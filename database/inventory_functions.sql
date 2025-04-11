-- Add inventory-related columns to products table
ALTER TABLE products
ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS allow_backorders BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS estimated_restock_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 5;

-- Create inventory_transactions table to track inventory changes
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  transaction_type VARCHAR(50) NOT NULL, -- 'order', 'restock', 'adjustment', 'return'
  reference_id UUID, -- Order ID, etc.
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to reserve inventory
CREATE OR REPLACE FUNCTION reserve_inventory(
  p_product_id UUID,
  p_quantity INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_stock INTEGER;
  v_allow_backorders BOOLEAN;
BEGIN
  -- Get current stock and backorder status
  SELECT stock_quantity, allow_backorders
  INTO v_current_stock, v_allow_backorders
  FROM products
  WHERE id = p_product_id;

  -- Check if enough stock is available
  IF v_current_stock >= p_quantity OR v_allow_backorders THEN
    -- Record the reservation in inventory_transactions
    INSERT INTO inventory_transactions (
      product_id,
      quantity,
      transaction_type,
      notes,
      created_by
    ) VALUES (
      p_product_id,
      -p_quantity, -- Negative quantity for reservations
      'reservation',
      'Inventory reserved for order',
      auth.uid()
    );

    -- Update product stock
    UPDATE products
    SET
      stock_quantity = GREATEST(0, stock_quantity - p_quantity),
      updated_at = NOW()
    WHERE id = p_product_id;

    RETURN TRUE;
  ELSE
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create function to update inventory after order
CREATE OR REPLACE FUNCTION update_inventory_after_order(
  p_product_id UUID,
  p_quantity INTEGER,
  p_order_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Record the transaction
  INSERT INTO inventory_transactions (
    product_id,
    quantity,
    transaction_type,
    reference_id,
    notes,
    created_by
  ) VALUES (
    p_product_id,
    -p_quantity, -- Negative quantity for order
    'order',
    p_order_id,
    'Inventory updated after order',
    auth.uid()
  );

  -- No need to update stock quantity again if already reserved

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create function to restock inventory
CREATE OR REPLACE FUNCTION restock_inventory(
  p_product_id UUID,
  p_quantity INTEGER,
  p_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Record the transaction
  INSERT INTO inventory_transactions (
    product_id,
    quantity,
    transaction_type,
    notes,
    created_by
  ) VALUES (
    p_product_id,
    p_quantity, -- Positive quantity for restock
    'restock',
    p_notes,
    auth.uid()
  );

  -- Update product stock
  UPDATE products
  SET
    stock_quantity = stock_quantity + p_quantity,
    estimated_restock_date = NULL, -- Clear restock date since we've restocked
    updated_at = NOW()
  WHERE id = p_product_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create function to get low stock products
CREATE OR REPLACE FUNCTION get_low_stock_products()
RETURNS SETOF products AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM products
  WHERE stock_quantity <= low_stock_threshold
  AND stock_quantity > 0
  ORDER BY stock_quantity ASC;
END;
$$ LANGUAGE plpgsql;

-- Create function to get out of stock products
CREATE OR REPLACE FUNCTION get_out_of_stock_products()
RETURNS SETOF products AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM products
  WHERE stock_quantity = 0
  ORDER BY name ASC;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_product_id ON inventory_transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_reference_id ON inventory_transactions(reference_id);
CREATE INDEX IF NOT EXISTS idx_products_stock_quantity ON products(stock_quantity);

-- Set up Row Level Security (RLS) policies
-- Inventory transactions table policies
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS inventory_transactions_select_policy ON inventory_transactions;
DROP POLICY IF EXISTS inventory_transactions_insert_policy ON inventory_transactions;

-- Only admins can view inventory transactions
CREATE POLICY inventory_transactions_select_policy ON inventory_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Only admins can insert inventory transactions
CREATE POLICY inventory_transactions_insert_policy ON inventory_transactions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Update some products with initial inventory
UPDATE products
SET
  stock_quantity = FLOOR(RANDOM() * 50) + 10, -- Random stock between 10 and 59
  allow_backorders = (RANDOM() > 0.7), -- 30% chance of allowing backorders
  low_stock_threshold = 5
WHERE stock_quantity IS NULL OR stock_quantity = 0;
