-- Update orders table with tracking information
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS tracking_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS tracking_url VARCHAR(255),
ADD COLUMN IF NOT EXISTS carrier VARCHAR(100),
ADD COLUMN IF NOT EXISTS estimated_delivery_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS actual_delivery_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS shipping_notes TEXT;

-- Create order_status_history table to track order status changes
CREATE TABLE IF NOT EXISTS order_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_tracking_updates table for detailed tracking events
CREATE TABLE IF NOT EXISTS order_tracking_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status VARCHAR(100) NOT NULL,
  location VARCHAR(255),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_tracking_updates_order_id ON order_tracking_updates(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON orders(tracking_number);

-- Create RPC function to add order status history
CREATE OR REPLACE FUNCTION add_order_status_history(
  p_order_id UUID,
  p_status VARCHAR(50),
  p_notes TEXT DEFAULT NULL,
  p_created_by UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_history_id UUID;
BEGIN
  -- Insert status history record
  INSERT INTO order_status_history (
    order_id,
    status,
    notes,
    created_by
  ) VALUES (
    p_order_id,
    p_status,
    p_notes,
    p_created_by
  ) RETURNING id INTO v_history_id;
  
  -- Update order status
  UPDATE orders
  SET 
    status = p_status,
    updated_at = NOW()
  WHERE id = p_order_id;
  
  RETURN v_history_id;
END;
$$ LANGUAGE plpgsql;

-- Create RPC function to add tracking information
CREATE OR REPLACE FUNCTION add_order_tracking_info(
  p_order_id UUID,
  p_tracking_number VARCHAR(100),
  p_tracking_url VARCHAR(255),
  p_carrier VARCHAR(100),
  p_estimated_delivery_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  -- Update order with tracking information
  UPDATE orders
  SET 
    tracking_number = p_tracking_number,
    tracking_url = p_tracking_url,
    carrier = p_carrier,
    estimated_delivery_date = p_estimated_delivery_date,
    status = 'shipped',
    updated_at = NOW()
  WHERE id = p_order_id;
  
  -- Add status history record
  PERFORM add_order_status_history(
    p_order_id,
    'shipped',
    'Order shipped via ' || p_carrier || ' with tracking number ' || p_tracking_number
  );
END;
$$ LANGUAGE plpgsql;

-- Create RPC function to mark order as delivered
CREATE OR REPLACE FUNCTION mark_order_delivered(
  p_order_id UUID,
  p_actual_delivery_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
)
RETURNS VOID AS $$
BEGIN
  -- Update order status to delivered
  UPDATE orders
  SET 
    status = 'delivered',
    actual_delivery_date = p_actual_delivery_date,
    updated_at = NOW()
  WHERE id = p_order_id;
  
  -- Add status history record
  PERFORM add_order_status_history(
    p_order_id,
    'delivered',
    'Order delivered on ' || to_char(p_actual_delivery_date, 'YYYY-MM-DD HH24:MI:SS')
  );
END;
$$ LANGUAGE plpgsql;

-- Set up Row Level Security (RLS) policies
-- Order status history table policies
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY order_status_history_select_policy ON order_status_history
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM orders WHERE id = order_id
    ) OR 
    auth.uid() IN (
      SELECT id FROM auth.users WHERE is_admin = true
    )
  );

-- Order tracking updates table policies
ALTER TABLE order_tracking_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY order_tracking_updates_select_policy ON order_tracking_updates
  FOR SELECT USING (
    auth.uid() IN (
      SELECT user_id FROM orders WHERE id = order_id
    ) OR 
    auth.uid() IN (
      SELECT id FROM auth.users WHERE is_admin = true
    )
  );
