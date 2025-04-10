-- Global Gourmet Fresh Database Setup
-- This script will drop and recreate all tables and policies

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- DROP EXISTING POLICIES
-- =============================================

-- Drop all existing policies to avoid conflicts
DO $$
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname, tablename FROM pg_policies
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
    END LOOP;
END $$;

-- =============================================
-- DROP EXISTING TABLES
-- =============================================

-- Drop tables in reverse order of dependencies
DROP TABLE IF EXISTS public.newsletter_subscribers CASCADE;
DROP TABLE IF EXISTS public.coupons CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.bulk_order_requests CASCADE;
DROP TABLE IF EXISTS public.gift_box_items CASCADE;
DROP TABLE IF EXISTS public.gift_boxes CASCADE;
DROP TABLE IF EXISTS public.wishlist_items CASCADE;
DROP TABLE IF EXISTS public.wishlists CASCADE;
DROP TABLE IF EXISTS public.cart_items CASCADE;
DROP TABLE IF EXISTS public.carts CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;

-- =============================================
-- CORE TABLES
-- =============================================

-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  sale_price DECIMAL(10, 2),
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_bestseller BOOLEAN DEFAULT FALSE,
  is_organic BOOLEAN DEFAULT FALSE,
  category_id UUID REFERENCES public.categories(id),
  image_url TEXT,
  rating DECIMAL(3, 2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_profiles table (extends Supabase auth.users)
CREATE TABLE public.user_profiles (
  id UUID PRIMARY KEY,
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

-- =============================================
-- ORDER MANAGEMENT TABLES
-- =============================================

-- Create orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  shipping_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10, 2) NOT NULL,
  shipping_address TEXT,
  shipping_city VARCHAR(255),
  shipping_state VARCHAR(255),
  shipping_postal_code VARCHAR(20),
  shipping_country VARCHAR(255),
  payment_method VARCHAR(50),
  payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
  coupon_code VARCHAR(50),
  coupon_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order_items table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- SHOPPING CART TABLES
-- =============================================

-- Create carts table
CREATE TABLE public.carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cart_items table
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id UUID REFERENCES public.carts(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- WISHLIST TABLES
-- =============================================

-- Create wishlists table
CREATE TABLE public.wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wishlist_items table
CREATE TABLE public.wishlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wishlist_id UUID REFERENCES public.wishlists(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- GIFT BOX TABLES
-- =============================================

-- Create gift_boxes table
CREATE TABLE public.gift_boxes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  base_price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  is_customizable BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create gift_box_items table
CREATE TABLE public.gift_box_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gift_box_id UUID REFERENCES public.gift_boxes(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- BULK ORDER TABLES
-- =============================================

-- Create bulk_order_requests table
CREATE TABLE public.bulk_order_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  company_name VARCHAR(255),
  contact_name VARCHAR(255),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  product_details TEXT,
  quantity INTEGER,
  custom_packaging BOOLEAN DEFAULT FALSE,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- REVIEW TABLES
-- =============================================

-- Create reviews table
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- COUPON SYSTEM
-- =============================================

-- Create coupons table
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value DECIMAL(10, 2) NOT NULL CHECK (discount_value > 0),
  minimum_order_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  usage_limit INTEGER,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- =============================================
-- NEWSLETTER SYSTEM
-- =============================================

-- Create newsletter_subscribers table
CREATE TABLE public.newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================

-- Enable Row Level Security on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_box_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulk_order_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- =============================================
-- CREATE BASIC POLICIES
-- =============================================

-- Create a simple policy for each table to allow all operations for now
-- This is just to get the database working, you can refine these later

-- Categories policies
CREATE POLICY "Allow all operations on categories" 
ON public.categories FOR ALL TO authenticated, anon
USING (true) WITH CHECK (true);

-- Products policies
CREATE POLICY "Allow all operations on products" 
ON public.products FOR ALL TO authenticated, anon
USING (true) WITH CHECK (true);

-- User profiles policies
CREATE POLICY "Allow all operations on user_profiles" 
ON public.user_profiles FOR ALL TO authenticated, anon
USING (true) WITH CHECK (true);

-- Orders policies
CREATE POLICY "Allow all operations on orders" 
ON public.orders FOR ALL TO authenticated, anon
USING (true) WITH CHECK (true);

-- Order items policies
CREATE POLICY "Allow all operations on order_items" 
ON public.order_items FOR ALL TO authenticated, anon
USING (true) WITH CHECK (true);

-- Carts policies
CREATE POLICY "Allow all operations on carts" 
ON public.carts FOR ALL TO authenticated, anon
USING (true) WITH CHECK (true);

-- Cart items policies
CREATE POLICY "Allow all operations on cart_items" 
ON public.cart_items FOR ALL TO authenticated, anon
USING (true) WITH CHECK (true);

-- Wishlists policies
CREATE POLICY "Allow all operations on wishlists" 
ON public.wishlists FOR ALL TO authenticated, anon
USING (true) WITH CHECK (true);

-- Wishlist items policies
CREATE POLICY "Allow all operations on wishlist_items" 
ON public.wishlist_items FOR ALL TO authenticated, anon
USING (true) WITH CHECK (true);

-- Gift boxes policies
CREATE POLICY "Allow all operations on gift_boxes" 
ON public.gift_boxes FOR ALL TO authenticated, anon
USING (true) WITH CHECK (true);

-- Gift box items policies
CREATE POLICY "Allow all operations on gift_box_items" 
ON public.gift_box_items FOR ALL TO authenticated, anon
USING (true) WITH CHECK (true);

-- Bulk order requests policies
CREATE POLICY "Allow all operations on bulk_order_requests" 
ON public.bulk_order_requests FOR ALL TO authenticated, anon
USING (true) WITH CHECK (true);

-- Reviews policies
CREATE POLICY "Allow all operations on reviews" 
ON public.reviews FOR ALL TO authenticated, anon
USING (true) WITH CHECK (true);

-- Coupons policies
CREATE POLICY "Allow all operations on coupons" 
ON public.coupons FOR ALL TO authenticated, anon
USING (true) WITH CHECK (true);

-- Newsletter subscribers policies
CREATE POLICY "Allow all operations on newsletter_subscribers" 
ON public.newsletter_subscribers FOR ALL TO authenticated, anon
USING (true) WITH CHECK (true);

-- =============================================
-- CREATE FUNCTIONS
-- =============================================

-- Function to validate coupon
CREATE OR REPLACE FUNCTION public.validate_coupon(
    coupon_code TEXT,
    order_amount DECIMAL
) RETURNS JSONB AS $$
DECLARE
    coupon_record RECORD;
    result JSONB;
BEGIN
    -- Find the coupon
    SELECT * INTO coupon_record FROM public.coupons
    WHERE 
        code = coupon_code
        AND is_active = true
        AND (start_date IS NULL OR start_date <= now())
        AND (end_date IS NULL OR end_date >= now())
        AND (usage_limit IS NULL OR usage_count < usage_limit);
    
    -- Check if coupon exists
    IF coupon_record IS NULL THEN
        RETURN jsonb_build_object(
            'valid', false,
            'message', 'Invalid or expired coupon code'
        );
    END IF;
    
    -- Check minimum order amount
    IF order_amount < coupon_record.minimum_order_amount THEN
        RETURN jsonb_build_object(
            'valid', false,
            'message', format('Minimum order amount of $%s required', coupon_record.minimum_order_amount)
        );
    END IF;
    
    -- Calculate discount amount
    DECLARE
        discount_amount DECIMAL;
    BEGIN
        IF coupon_record.discount_type = 'percentage' THEN
            discount_amount := (order_amount * coupon_record.discount_value / 100);
        ELSE
            discount_amount := coupon_record.discount_value;
            -- Ensure discount doesn't exceed order amount
            IF discount_amount > order_amount THEN
                discount_amount := order_amount;
            END IF;
        END IF;
        
        -- Return valid coupon with details
        RETURN jsonb_build_object(
            'valid', true,
            'code', coupon_record.code,
            'discount_type', coupon_record.discount_type,
            'discount_value', coupon_record.discount_value,
            'discount_amount', discount_amount,
            'id', coupon_record.id
        );
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to apply coupon to order
CREATE OR REPLACE FUNCTION public.apply_coupon_to_order(
    order_id UUID,
    coupon_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    coupon_record RECORD;
    order_record RECORD;
    discount_amount DECIMAL;
BEGIN
    -- Get the coupon
    SELECT * INTO coupon_record FROM public.coupons
    WHERE id = coupon_id AND is_active = true;
    
    -- Check if coupon exists
    IF coupon_record IS NULL THEN
        RETURN false;
    END IF;
    
    -- Get the order
    SELECT * INTO order_record FROM public.orders
    WHERE id = order_id;
    
    -- Check if order exists
    IF order_record IS NULL THEN
        RETURN false;
    END IF;
    
    -- Calculate discount amount
    IF coupon_record.discount_type = 'percentage' THEN
        discount_amount := (order_record.subtotal * coupon_record.discount_value / 100);
    ELSE
        discount_amount := coupon_record.discount_value;
        -- Ensure discount doesn't exceed order subtotal
        IF discount_amount > order_record.subtotal THEN
            discount_amount := order_record.subtotal;
        END IF;
    END IF;
    
    -- Update the order with the discount
    UPDATE public.orders
    SET 
        coupon_id = coupon_record.id,
        coupon_code = coupon_record.code,
        discount_amount = discount_amount,
        total_amount = order_record.subtotal - discount_amount + order_record.tax_amount + order_record.shipping_amount
    WHERE id = order_id;
    
    -- Increment the coupon usage count
    UPDATE public.coupons
    SET usage_count = usage_count + 1
    WHERE id = coupon_id;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- GRANT PERMISSIONS
-- =============================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- =============================================
-- SAMPLE DATA
-- =============================================

-- Insert sample categories
INSERT INTO public.categories (name, slug, description) VALUES
('Dry Fruits', 'dry-fruits', 'Premium quality dry fruits from around the world'),
('Nuts', 'nuts', 'Fresh and crunchy nuts for snacking and cooking'),
('Seeds', 'seeds', 'Nutritious seeds for healthy eating'),
('Berries', 'berries', 'Dried berries packed with antioxidants'),
('Trail Mixes', 'trail-mixes', 'Custom blends of nuts, fruits, and seeds'),
('Organic', 'organic', 'Certified organic products');

-- Insert sample products
INSERT INTO public.products (name, slug, description, price, sale_price, stock_quantity, is_featured, is_bestseller, is_organic, category_id, image_url) VALUES
('Premium Almonds', 'premium-almonds', 'High-quality almonds sourced from California', 12.99, NULL, 100, true, true, false, (SELECT id FROM public.categories WHERE slug = 'nuts'), '/images/products/almonds.jpg'),
('Organic Walnuts', 'organic-walnuts', 'Certified organic walnuts', 14.99, 12.99, 75, true, false, true, (SELECT id FROM public.categories WHERE slug = 'nuts'), '/images/products/walnuts.jpg'),
('Dried Apricots', 'dried-apricots', 'Sweet and tangy dried apricots', 9.99, NULL, 120, false, true, false, (SELECT id FROM public.categories WHERE slug = 'dry-fruits'), '/images/products/apricots.jpg'),
('Medjool Dates', 'medjool-dates', 'Premium Medjool dates', 16.99, 14.99, 50, true, true, false, (SELECT id FROM public.categories WHERE slug = 'dry-fruits'), '/images/products/dates.jpg'),
('Chia Seeds', 'chia-seeds', 'Nutrient-rich chia seeds', 8.99, NULL, 200, false, false, true, (SELECT id FROM public.categories WHERE slug = 'seeds'), '/images/products/chia.jpg'),
('Dried Cranberries', 'dried-cranberries', 'Tangy dried cranberries', 7.99, NULL, 150, false, true, false, (SELECT id FROM public.categories WHERE slug = 'berries'), '/images/products/cranberries.jpg'),
('Trail Mix Classic', 'trail-mix-classic', 'Classic blend of nuts, seeds, and dried fruits', 11.99, 9.99, 80, true, true, false, (SELECT id FROM public.categories WHERE slug = 'trail-mixes'), '/images/products/trail-mix.jpg'),
('Organic Cashews', 'organic-cashews', 'Certified organic cashews', 18.99, NULL, 60, true, false, true, (SELECT id FROM public.categories WHERE slug = 'nuts'), '/images/products/cashews.jpg');

-- Insert sample gift boxes
INSERT INTO public.gift_boxes (name, description, base_price, image_url, is_customizable) VALUES
('Premium Gift Box', 'A luxurious assortment of our finest dry fruits and nuts', 49.99, '/images/gift-boxes/premium.jpg', true),
('Healthy Snacker', 'Perfect for health-conscious individuals', 39.99, '/images/gift-boxes/healthy.jpg', true),
('Corporate Gift', 'Impress your clients and colleagues', 79.99, '/images/gift-boxes/corporate.jpg', false),
('Festival Special', 'Celebrate special occasions with our festive selection', 59.99, '/images/gift-boxes/festival.jpg', true);

-- Insert sample gift box items
INSERT INTO public.gift_box_items (gift_box_id, product_id, quantity) VALUES
((SELECT id FROM public.gift_boxes WHERE name = 'Premium Gift Box'), (SELECT id FROM public.products WHERE slug = 'premium-almonds'), 1),
((SELECT id FROM public.gift_boxes WHERE name = 'Premium Gift Box'), (SELECT id FROM public.products WHERE slug = 'medjool-dates'), 1),
((SELECT id FROM public.gift_boxes WHERE name = 'Premium Gift Box'), (SELECT id FROM public.products WHERE slug = 'organic-cashews'), 1),
((SELECT id FROM public.gift_boxes WHERE name = 'Healthy Snacker'), (SELECT id FROM public.products WHERE slug = 'chia-seeds'), 1),
((SELECT id FROM public.gift_boxes WHERE name = 'Healthy Snacker'), (SELECT id FROM public.products WHERE slug = 'dried-cranberries'), 1),
((SELECT id FROM public.gift_boxes WHERE name = 'Healthy Snacker'), (SELECT id FROM public.products WHERE slug = 'organic-walnuts'), 1);

-- Insert sample coupons
INSERT INTO public.coupons (code, description, discount_type, discount_value, minimum_order_amount, is_active, start_date, end_date, usage_limit) VALUES
('WELCOME10', 'Welcome discount for new customers', 'percentage', 10, 0, true, NOW(), NOW() + INTERVAL '1 year', NULL),
('SUMMER2024', 'Summer sale discount', 'percentage', 15, 50, true, '2024-06-01', '2024-09-30', 100),
('FREESHIP', 'Free shipping on orders over $75', 'fixed', 10, 75, true, NOW(), NOW() + INTERVAL '6 months', 50);

-- Verify setup
SELECT 'Database setup complete!' as status;
SELECT 
    (SELECT COUNT(*) FROM public.categories) as categories_count,
    (SELECT COUNT(*) FROM public.products) as products_count,
    (SELECT COUNT(*) FROM public.gift_boxes) as gift_boxes_count,
    (SELECT COUNT(*) FROM public.gift_box_items) as gift_box_items_count,
    (SELECT COUNT(*) FROM public.coupons) as coupons_count;
