-- Create tax_rates table for storing tax rates by location
CREATE TABLE IF NOT EXISTS tax_rates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  country VARCHAR(2) NOT NULL,
  state VARCHAR(2),
  city VARCHAR(100),
  zip_code VARCHAR(20),
  tax_rate DECIMAL(5,4) NOT NULL,
  tax_type VARCHAR(50) NOT NULL, -- 'state', 'county', 'city', 'special'
  is_active BOOLEAN DEFAULT TRUE,
  effective_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tax_exemptions table for storing tax-exempt customers
CREATE TABLE IF NOT EXISTS tax_exemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exemption_type VARCHAR(50) NOT NULL, -- 'business', 'nonprofit', 'government', etc.
  exemption_number VARCHAR(100),
  documentation_url VARCHAR(255),
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  effective_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expiration_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tax_calculations table for storing tax calculation history
CREATE TABLE IF NOT EXISTS tax_calculations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) NOT NULL,
  tax_rate DECIMAL(5,4) NOT NULL,
  shipping_address JSONB,
  breakdown JSONB,
  is_exempt BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to calculate tax
CREATE OR REPLACE FUNCTION calculate_tax(
  p_country VARCHAR(2),
  p_state VARCHAR(2),
  p_city VARCHAR(100),
  p_zip_code VARCHAR(20),
  p_subtotal DECIMAL(10,2),
  p_user_id UUID DEFAULT NULL,
  p_product_category VARCHAR(50) DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
  v_tax_rate DECIMAL(5,4) := 0;
  v_state_tax DECIMAL(5,4) := 0;
  v_county_tax DECIMAL(5,4) := 0;
  v_city_tax DECIMAL(5,4) := 0;
  v_special_tax DECIMAL(5,4) := 0;
  v_is_exempt BOOLEAN := FALSE;
  v_result JSONB;
  v_cgst DECIMAL(5,4) := 0;
  v_sgst DECIMAL(5,4) := 0;
  v_igst DECIMAL(5,4) := 0;
  v_category_rate DECIMAL(5,4) := 0;
BEGIN
  -- Check if user is tax exempt
  IF p_user_id IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM tax_exemptions
      WHERE user_id = p_user_id
      AND is_verified = TRUE
      AND is_active = TRUE
      AND (expiration_date IS NULL OR expiration_date > NOW())
    ) INTO v_is_exempt;
  END IF;

  -- If user is exempt, return zero tax
  IF v_is_exempt THEN
    v_result := jsonb_build_object(
      'tax_rate', 0,
      'tax_amount', 0,
      'taxable_amount', p_subtotal,
      'exempt_amount', p_subtotal,
      'is_exempt', TRUE
    );

    RETURN v_result;
  END IF;

  -- Handle India GST calculation
  IF p_country = 'IN' THEN
    -- Get CGST rate (Central GST)
    SELECT COALESCE(tax_rate, 0)
    INTO v_cgst
    FROM tax_rates
    WHERE country = 'IN'
    AND state IS NULL
    AND tax_type = 'cgst'
    AND is_active = TRUE
    AND (end_date IS NULL OR end_date > NOW())
    LIMIT 1;

    -- Get SGST rate (State GST) for the specific state
    SELECT COALESCE(tax_rate, 0)
    INTO v_sgst
    FROM tax_rates
    WHERE country = 'IN'
    AND state = p_state
    AND tax_type = 'sgst'
    AND is_active = TRUE
    AND (end_date IS NULL OR end_date > NOW())
    LIMIT 1;

    -- Get IGST rate (Integrated GST) for interstate transactions
    SELECT COALESCE(tax_rate, 0)
    INTO v_igst
    FROM tax_rates
    WHERE country = 'IN'
    AND state IS NULL
    AND tax_type = 'igst'
    AND is_active = TRUE
    AND (end_date IS NULL OR end_date > NOW())
    LIMIT 1;

    -- Check if product category has a special rate
    IF p_product_category IS NOT NULL THEN
      -- This is simplified - in reality would check against product category mapping
      IF p_product_category IN ('food', 'essentials') THEN
        SELECT tax_rate FROM tax_rates WHERE country = 'IN' AND tax_type = 'gst_reduced' LIMIT 1 INTO v_category_rate;
      ELSIF p_product_category IN ('clothing', 'pharmaceuticals') THEN
        SELECT tax_rate FROM tax_rates WHERE country = 'IN' AND tax_type = 'gst_medium' LIMIT 1 INTO v_category_rate;
      ELSIF p_product_category IN ('luxury', 'electronics') THEN
        SELECT tax_rate FROM tax_rates WHERE country = 'IN' AND tax_type = 'gst_high' LIMIT 1 INTO v_category_rate;
      END IF;
    END IF;

    -- If we have a category-specific rate, use that instead of standard rates
    IF v_category_rate > 0 THEN
      v_tax_rate := v_category_rate;

      -- Build result with category-specific GST
      v_result := jsonb_build_object(
        'tax_rate', v_tax_rate,
        'tax_amount', ROUND(p_subtotal * v_tax_rate, 2),
        'taxable_amount', p_subtotal,
        'exempt_amount', 0,
        'is_exempt', FALSE,
        'breakdown', jsonb_build_object(
          'category_gst', ROUND(p_subtotal * v_tax_rate, 2),
          'category', p_product_category
        )
      );
    ELSE
      -- For intrastate transactions, use CGST + SGST
      -- For interstate transactions, use IGST
      -- This is simplified - in reality would check if buyer and seller are in same state
      IF v_sgst > 0 THEN
        -- Intrastate transaction (CGST + SGST)
        v_tax_rate := v_cgst + v_sgst;

        -- Build result with CGST and SGST
        v_result := jsonb_build_object(
          'tax_rate', v_tax_rate,
          'tax_amount', ROUND(p_subtotal * v_tax_rate, 2),
          'taxable_amount', p_subtotal,
          'exempt_amount', 0,
          'is_exempt', FALSE,
          'breakdown', jsonb_build_object(
            'cgst', ROUND(p_subtotal * v_cgst, 2),
            'sgst', ROUND(p_subtotal * v_sgst, 2)
          )
        );
      ELSE
        -- Interstate transaction (IGST)
        v_tax_rate := v_igst;

        -- Build result with IGST
        v_result := jsonb_build_object(
          'tax_rate', v_tax_rate,
          'tax_amount', ROUND(p_subtotal * v_tax_rate, 2),
          'taxable_amount', p_subtotal,
          'exempt_amount', 0,
          'is_exempt', FALSE,
          'breakdown', jsonb_build_object(
            'igst', ROUND(p_subtotal * v_igst, 2)
          )
        );
      END IF;
    END IF;

    RETURN v_result;
  END IF;

  -- For other countries (like US), use the original calculation

  -- Get state tax rate
  SELECT COALESCE(tax_rate, 0)
  INTO v_state_tax
  FROM tax_rates
  WHERE country = p_country
  AND state = p_state
  AND city IS NULL
  AND zip_code IS NULL
  AND tax_type = 'state'
  AND is_active = TRUE
  AND (end_date IS NULL OR end_date > NOW())
  LIMIT 1;

  -- Get county tax rate (simplified - in reality would be more complex)
  SELECT COALESCE(tax_rate, 0)
  INTO v_county_tax
  FROM tax_rates
  WHERE country = p_country
  AND state = p_state
  AND tax_type = 'county'
  AND is_active = TRUE
  AND (end_date IS NULL OR end_date > NOW())
  LIMIT 1;

  -- Get city tax rate
  SELECT COALESCE(tax_rate, 0)
  INTO v_city_tax
  FROM tax_rates
  WHERE country = p_country
  AND state = p_state
  AND city = p_city
  AND tax_type = 'city'
  AND is_active = TRUE
  AND (end_date IS NULL OR end_date > NOW())
  LIMIT 1;

  -- Get special district tax rate (if any)
  SELECT COALESCE(tax_rate, 0)
  INTO v_special_tax
  FROM tax_rates
  WHERE country = p_country
  AND state = p_state
  AND zip_code = p_zip_code
  AND tax_type = 'special'
  AND is_active = TRUE
  AND (end_date IS NULL OR end_date > NOW())
  LIMIT 1;

  -- Calculate total tax rate
  v_tax_rate := v_state_tax + v_county_tax + v_city_tax + v_special_tax;

  -- Build result
  v_result := jsonb_build_object(
    'tax_rate', v_tax_rate,
    'tax_amount', ROUND(p_subtotal * v_tax_rate, 2),
    'taxable_amount', p_subtotal,
    'exempt_amount', 0,
    'is_exempt', FALSE,
    'breakdown', jsonb_build_object(
      'state_tax', ROUND(p_subtotal * v_state_tax, 2),
      'county_tax', ROUND(p_subtotal * v_county_tax, 2),
      'city_tax', ROUND(p_subtotal * v_city_tax, 2),
      'special_tax', ROUND(p_subtotal * v_special_tax, 2)
    )
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Create function to save tax calculation
CREATE OR REPLACE FUNCTION save_tax_calculation(
  p_order_id UUID,
  p_user_id UUID,
  p_subtotal DECIMAL(10,2),
  p_tax_amount DECIMAL(10,2),
  p_tax_rate DECIMAL(5,4),
  p_shipping_address JSONB,
  p_breakdown JSONB DEFAULT NULL,
  p_is_exempt BOOLEAN DEFAULT FALSE
)
RETURNS UUID AS $$
DECLARE
  v_calculation_id UUID;
BEGIN
  -- Insert tax calculation record
  INSERT INTO tax_calculations (
    order_id,
    user_id,
    subtotal,
    tax_amount,
    tax_rate,
    shipping_address,
    breakdown,
    is_exempt,
    created_at
  ) VALUES (
    p_order_id,
    p_user_id,
    p_subtotal,
    p_tax_amount,
    p_tax_rate,
    p_shipping_address,
    p_breakdown,
    p_is_exempt,
    NOW()
  ) RETURNING id INTO v_calculation_id;

  -- Update order with tax information
  UPDATE orders
  SET
    tax_amount = p_tax_amount,
    updated_at = NOW()
  WHERE id = p_order_id;

  RETURN v_calculation_id;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tax_rates_location ON tax_rates(country, state, city, zip_code);
CREATE INDEX IF NOT EXISTS idx_tax_exemptions_user_id ON tax_exemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_tax_calculations_order_id ON tax_calculations(order_id);

-- Set up Row Level Security (RLS) policies
-- Tax rates table policies
ALTER TABLE tax_rates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS tax_rates_select_policy ON tax_rates;
DROP POLICY IF EXISTS tax_rates_insert_policy ON tax_rates;
DROP POLICY IF EXISTS tax_rates_update_policy ON tax_rates;

-- Anyone can view tax rates
CREATE POLICY tax_rates_select_policy ON tax_rates
  FOR SELECT USING (TRUE);

-- Only admins can modify tax rates
CREATE POLICY tax_rates_insert_policy ON tax_rates
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY tax_rates_update_policy ON tax_rates
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Tax exemptions table policies
ALTER TABLE tax_exemptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS tax_exemptions_select_policy ON tax_exemptions;
DROP POLICY IF EXISTS tax_exemptions_insert_policy ON tax_exemptions;
DROP POLICY IF EXISTS tax_exemptions_update_policy ON tax_exemptions;

-- Users can view their own exemptions, admins can view all
CREATE POLICY tax_exemptions_select_policy ON tax_exemptions
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Users can request their own exemptions
CREATE POLICY tax_exemptions_insert_policy ON tax_exemptions
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
  );

-- Only admins can update exemptions (to verify them)
CREATE POLICY tax_exemptions_update_policy ON tax_exemptions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Tax calculations table policies
ALTER TABLE tax_calculations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS tax_calculations_select_policy ON tax_calculations;

-- Users can view their own calculations, admins can view all
CREATE POLICY tax_calculations_select_policy ON tax_calculations
  FOR SELECT USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Insert some sample tax rates for US states
INSERT INTO tax_rates (country, state, tax_rate, tax_type, is_active)
VALUES
  ('US', 'AL', 0.0400, 'state', TRUE),
  ('US', 'AK', 0.0000, 'state', TRUE),
  ('US', 'AZ', 0.0560, 'state', TRUE),
  ('US', 'AR', 0.0650, 'state', TRUE),
  ('US', 'CA', 0.0725, 'state', TRUE),
  ('US', 'CO', 0.0290, 'state', TRUE),
  ('US', 'CT', 0.0635, 'state', TRUE),
  ('US', 'DE', 0.0000, 'state', TRUE),
  ('US', 'FL', 0.0600, 'state', TRUE),
  ('US', 'GA', 0.0400, 'state', TRUE),
  ('US', 'HI', 0.0400, 'state', TRUE),
  ('US', 'ID', 0.0600, 'state', TRUE),
  ('US', 'IL', 0.0625, 'state', TRUE),
  ('US', 'IN', 0.0700, 'state', TRUE),
  ('US', 'IA', 0.0600, 'state', TRUE),
  ('US', 'KS', 0.0650, 'state', TRUE),
  ('US', 'KY', 0.0600, 'state', TRUE),
  ('US', 'LA', 0.0445, 'state', TRUE),
  ('US', 'ME', 0.0550, 'state', TRUE),
  ('US', 'MD', 0.0600, 'state', TRUE),
  ('US', 'MA', 0.0625, 'state', TRUE),
  ('US', 'MI', 0.0600, 'state', TRUE),
  ('US', 'MN', 0.0688, 'state', TRUE),
  ('US', 'MS', 0.0700, 'state', TRUE),
  ('US', 'MO', 0.0423, 'state', TRUE),
  ('US', 'MT', 0.0000, 'state', TRUE),
  ('US', 'NE', 0.0550, 'state', TRUE),
  ('US', 'NV', 0.0685, 'state', TRUE),
  ('US', 'NH', 0.0000, 'state', TRUE),
  ('US', 'NJ', 0.0663, 'state', TRUE),
  ('US', 'NM', 0.0513, 'state', TRUE),
  ('US', 'NY', 0.0400, 'state', TRUE),
  ('US', 'NC', 0.0475, 'state', TRUE),
  ('US', 'ND', 0.0500, 'state', TRUE),
  ('US', 'OH', 0.0575, 'state', TRUE),
  ('US', 'OK', 0.0450, 'state', TRUE),
  ('US', 'OR', 0.0000, 'state', TRUE),
  ('US', 'PA', 0.0600, 'state', TRUE),
  ('US', 'RI', 0.0700, 'state', TRUE),
  ('US', 'SC', 0.0600, 'state', TRUE),
  ('US', 'SD', 0.0450, 'state', TRUE),
  ('US', 'TN', 0.0700, 'state', TRUE),
  ('US', 'TX', 0.0625, 'state', TRUE),
  ('US', 'UT', 0.0485, 'state', TRUE),
  ('US', 'VT', 0.0600, 'state', TRUE),
  ('US', 'VA', 0.0530, 'state', TRUE),
  ('US', 'WA', 0.0650, 'state', TRUE),
  ('US', 'WV', 0.0600, 'state', TRUE),
  ('US', 'WI', 0.0500, 'state', TRUE),
  ('US', 'WY', 0.0400, 'state', TRUE),
  ('US', 'DC', 0.0600, 'state', TRUE)
ON CONFLICT DO NOTHING;

-- Insert tax rates for India (GST)
-- India uses a Goods and Services Tax (GST) system with different rates for different categories
-- For simplicity, we'll add the standard rates for each state

-- First, add the IGST (Integrated GST) rate which applies to interstate transactions
INSERT INTO tax_rates (country, state, tax_rate, tax_type, is_active)
VALUES ('IN', NULL, 0.1800, 'igst', TRUE) -- 18% is the standard IGST rate for most goods
ON CONFLICT DO NOTHING;

-- Then add CGST (Central GST) and SGST (State GST) rates for each state
-- These typically combine to equal the IGST rate (e.g., 9% CGST + 9% SGST = 18% total)
INSERT INTO tax_rates (country, state, tax_rate, tax_type, is_active)
VALUES
  -- Major states and union territories with their SGST rates
  ('IN', 'AP', 0.0900, 'sgst', TRUE), -- Andhra Pradesh
  ('IN', 'AR', 0.0900, 'sgst', TRUE), -- Arunachal Pradesh
  ('IN', 'AS', 0.0900, 'sgst', TRUE), -- Assam
  ('IN', 'BR', 0.0900, 'sgst', TRUE), -- Bihar
  ('IN', 'CG', 0.0900, 'sgst', TRUE), -- Chhattisgarh
  ('IN', 'GA', 0.0900, 'sgst', TRUE), -- Goa
  ('IN', 'GJ', 0.0900, 'sgst', TRUE), -- Gujarat
  ('IN', 'HR', 0.0900, 'sgst', TRUE), -- Haryana
  ('IN', 'HP', 0.0900, 'sgst', TRUE), -- Himachal Pradesh
  ('IN', 'JH', 0.0900, 'sgst', TRUE), -- Jharkhand
  ('IN', 'KA', 0.0900, 'sgst', TRUE), -- Karnataka
  ('IN', 'KL', 0.0900, 'sgst', TRUE), -- Kerala
  ('IN', 'MP', 0.0900, 'sgst', TRUE), -- Madhya Pradesh
  ('IN', 'MH', 0.0900, 'sgst', TRUE), -- Maharashtra
  ('IN', 'MN', 0.0900, 'sgst', TRUE), -- Manipur
  ('IN', 'ML', 0.0900, 'sgst', TRUE), -- Meghalaya
  ('IN', 'MZ', 0.0900, 'sgst', TRUE), -- Mizoram
  ('IN', 'NL', 0.0900, 'sgst', TRUE), -- Nagaland
  ('IN', 'OD', 0.0900, 'sgst', TRUE), -- Odisha
  ('IN', 'PB', 0.0900, 'sgst', TRUE), -- Punjab
  ('IN', 'RJ', 0.0900, 'sgst', TRUE), -- Rajasthan
  ('IN', 'SK', 0.0900, 'sgst', TRUE), -- Sikkim
  ('IN', 'TN', 0.0900, 'sgst', TRUE), -- Tamil Nadu
  ('IN', 'TS', 0.0900, 'sgst', TRUE), -- Telangana
  ('IN', 'TR', 0.0900, 'sgst', TRUE), -- Tripura
  ('IN', 'UK', 0.0900, 'sgst', TRUE), -- Uttarakhand
  ('IN', 'UP', 0.0900, 'sgst', TRUE), -- Uttar Pradesh
  ('IN', 'WB', 0.0900, 'sgst', TRUE), -- West Bengal
  ('IN', 'AN', 0.0900, 'sgst', TRUE), -- Andaman and Nicobar Islands
  ('IN', 'CH', 0.0900, 'sgst', TRUE), -- Chandigarh
  ('IN', 'DN', 0.0900, 'sgst', TRUE), -- Dadra and Nagar Haveli and Daman and Diu
  ('IN', 'DL', 0.0900, 'sgst', TRUE), -- Delhi
  ('IN', 'JK', 0.0900, 'sgst', TRUE), -- Jammu and Kashmir
  ('IN', 'LA', 0.0900, 'sgst', TRUE), -- Ladakh
  ('IN', 'LD', 0.0900, 'sgst', TRUE), -- Lakshadweep
  ('IN', 'PY', 0.0900, 'sgst', TRUE)  -- Puducherry
ON CONFLICT DO NOTHING;

-- Add CGST (Central GST) which is the same across all states
INSERT INTO tax_rates (country, state, tax_rate, tax_type, is_active)
VALUES ('IN', NULL, 0.0900, 'cgst', TRUE) -- 9% is the standard CGST rate
ON CONFLICT DO NOTHING;

-- Add special GST rates for specific product categories
-- These would typically be applied based on product category rather than location
INSERT INTO tax_rates (country, tax_rate, tax_type, is_active)
VALUES
  ('IN', 0.0500, 'gst_reduced', TRUE),  -- 5% GST for essential items
  ('IN', 0.1200, 'gst_medium', TRUE),   -- 12% GST for certain goods
  ('IN', 0.2800, 'gst_high', TRUE)      -- 28% GST for luxury items
ON CONFLICT DO NOTHING;
