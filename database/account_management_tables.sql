-- Update user_profiles table with new fields
ALTER TABLE user_profiles
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS email_newsletter BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS email_order_updates BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS email_promotions BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS sms_order_updates BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS sms_promotions BOOLEAN DEFAULT FALSE;

-- Create addresses table
CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  address_line1 VARCHAR(255) NOT NULL,
  address_line2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(100) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cardholder_name VARCHAR(255) NOT NULL,
  last_four VARCHAR(4) NOT NULL,
  card_type VARCHAR(50) NOT NULL,
  expiry_month VARCHAR(2) NOT NULL,
  expiry_year VARCHAR(4) NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update orders table to match our type definition
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS order_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS item_count INTEGER DEFAULT 0;

-- Rename total_amount to total for consistency
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'total_amount') THEN
    ALTER TABLE orders RENAME COLUMN total_amount TO total;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);

-- Create RPC function to set default address
CREATE OR REPLACE FUNCTION set_default_address(address_id UUID, user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- First, set all addresses to not default
  UPDATE addresses
  SET is_default = FALSE
  WHERE user_id = $2;
  
  -- Then set the selected address as default
  UPDATE addresses
  SET is_default = TRUE
  WHERE id = $1;
END;
$$ LANGUAGE plpgsql;

-- Create RPC function to set default payment method
CREATE OR REPLACE FUNCTION set_default_payment_method(payment_method_id UUID, user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- First, set all payment methods to not default
  UPDATE payment_methods
  SET is_default = FALSE
  WHERE user_id = $2;
  
  -- Then set the selected payment method as default
  UPDATE payment_methods
  SET is_default = TRUE
  WHERE id = $1;
END;
$$ LANGUAGE plpgsql;

-- Set up Row Level Security (RLS) policies
-- Addresses table policies
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY addresses_select_policy ON addresses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY addresses_insert_policy ON addresses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY addresses_update_policy ON addresses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY addresses_delete_policy ON addresses
  FOR DELETE USING (auth.uid() = user_id);

-- Payment methods table policies
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY payment_methods_select_policy ON payment_methods
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY payment_methods_insert_policy ON payment_methods
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY payment_methods_update_policy ON payment_methods
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY payment_methods_delete_policy ON payment_methods
  FOR DELETE USING (auth.uid() = user_id);
