-- Additional tables for Global Gourmet e-commerce platform
-- Run this SQL in the Supabase SQL Editor to add more functionality

-- Create user_profiles table to store additional user information
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  city VARCHAR(255),
  state VARCHAR(255),
  postal_code VARCHAR(20),
  country VARCHAR(255),
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table to track customer orders
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  total_amount DECIMAL(10, 2) NOT NULL,
  shipping_address TEXT,
  shipping_city VARCHAR(255),
  shipping_state VARCHAR(255),
  shipping_postal_code VARCHAR(20),
  shipping_country VARCHAR(255),
  shipping_method VARCHAR(100),
  shipping_cost DECIMAL(10, 2) DEFAULT 0,
  payment_method VARCHAR(100),
  payment_status VARCHAR(50) DEFAULT 'pending',
  coupon_code VARCHAR(50),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table to track items in each order
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create carts table to track user shopping carts
CREATE TABLE IF NOT EXISTS carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cart_items table to track items in each cart
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(cart_id, product_id)
);

-- Create wishlists table to track user wishlists
CREATE TABLE IF NOT EXISTS wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wishlist_items table to track items in each wishlist
CREATE TABLE IF NOT EXISTS wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wishlist_id UUID REFERENCES wishlists(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(wishlist_id, product_id)
);

-- Create reviews table to store product reviews
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title VARCHAR(255),
  content TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bulk_order_requests table to track bulk order inquiries
CREATE TABLE IF NOT EXISTS bulk_order_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  company_name VARCHAR(255),
  contact_name VARCHAR(255),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  product_details TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  custom_packaging BOOLEAN DEFAULT FALSE,
  status VARCHAR(50) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create gift_box_items table to track products in gift boxes
CREATE TABLE IF NOT EXISTS gift_box_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gift_box_id UUID REFERENCES gift_boxes(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create coupons table for discount codes
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  discount_type VARCHAR(20) NOT NULL, -- 'percentage' or 'fixed'
  discount_value DECIMAL(10, 2) NOT NULL,
  minimum_order_amount DECIMAL(10, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_order_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_box_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view their own profile"
ON user_profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON user_profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON user_profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- Create policies for orders
CREATE POLICY "Users can view their own orders"
ON orders FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders"
ON orders FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create policies for order_items
CREATE POLICY "Users can view their own order items"
ON order_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own order items"
ON order_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders
    WHERE orders.id = order_items.order_id
    AND orders.user_id = auth.uid()
  )
);

-- Create policies for carts
CREATE POLICY "Users can view their own cart"
ON carts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cart"
ON carts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart"
ON carts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart"
ON carts FOR DELETE
USING (auth.uid() = user_id);

-- Create policies for cart_items
CREATE POLICY "Users can view their own cart items"
ON cart_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM carts
    WHERE carts.id = cart_items.cart_id
    AND carts.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own cart items"
ON cart_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM carts
    WHERE carts.id = cart_items.cart_id
    AND carts.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own cart items"
ON cart_items FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM carts
    WHERE carts.id = cart_items.cart_id
    AND carts.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own cart items"
ON cart_items FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM carts
    WHERE carts.id = cart_items.cart_id
    AND carts.user_id = auth.uid()
  )
);

-- Create policies for wishlists
CREATE POLICY "Users can view their own wishlist"
ON wishlists FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wishlist"
ON wishlists FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create policies for wishlist_items
CREATE POLICY "Users can view their own wishlist items"
ON wishlist_items FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM wishlists
    WHERE wishlists.id = wishlist_items.wishlist_id
    AND wishlists.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert their own wishlist items"
ON wishlist_items FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM wishlists
    WHERE wishlists.id = wishlist_items.wishlist_id
    AND wishlists.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own wishlist items"
ON wishlist_items FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM wishlists
    WHERE wishlists.id = wishlist_items.wishlist_id
    AND wishlists.user_id = auth.uid()
  )
);

-- Create policies for reviews
CREATE POLICY "Anyone can view reviews"
ON reviews FOR SELECT
USING (true);

CREATE POLICY "Users can insert their own reviews"
ON reviews FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
ON reviews FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
ON reviews FOR DELETE
USING (auth.uid() = user_id);

-- Create policies for bulk_order_requests
CREATE POLICY "Users can view their own bulk order requests"
ON bulk_order_requests FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bulk order requests"
ON bulk_order_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create policies for gift_box_items
CREATE POLICY "Anyone can view gift box items"
ON gift_box_items FOR SELECT
USING (true);

-- Create policies for coupons
CREATE POLICY "Anyone can view active coupons"
ON coupons FOR SELECT
USING (is_active = true);

-- Insert sample data for coupons
INSERT INTO coupons (code, description, discount_type, discount_value, minimum_order_amount, is_active, start_date, end_date, usage_limit)
VALUES
('WELCOME10', 'Get 10% off your first order', 'percentage', 10, 0, true, NOW(), NOW() + INTERVAL '30 days', 100),
('SUMMER25', 'Summer sale - 25% off orders over $50', 'percentage', 25, 50, true, NOW(), NOW() + INTERVAL '60 days', 50),
('FREESHIP', 'Free shipping on all orders', 'fixed', 10, 30, true, NOW(), NOW() + INTERVAL '15 days', 200);
