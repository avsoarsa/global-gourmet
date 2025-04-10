-- Global Gourmet Complete Database Setup
-- Run this SQL in the Supabase SQL Editor to set up all required tables for the project

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- CORE TABLES
-- =============================================

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
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
CREATE TABLE IF NOT EXISTS public.user_profiles (
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

-- =============================================
-- ORDER MANAGEMENT TABLES
-- =============================================

-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
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
CREATE TABLE IF NOT EXISTS public.order_items (
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
CREATE TABLE IF NOT EXISTS public.carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cart_items table
CREATE TABLE IF NOT EXISTS public.cart_items (
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
CREATE TABLE IF NOT EXISTS public.wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wishlist_items table
CREATE TABLE IF NOT EXISTS public.wishlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wishlist_id UUID REFERENCES public.wishlists(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- GIFT BOX TABLES
-- =============================================

-- Create gift_boxes table
CREATE TABLE IF NOT EXISTS public.gift_boxes (
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
CREATE TABLE IF NOT EXISTS public.gift_box_items (
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
CREATE TABLE IF NOT EXISTS public.bulk_order_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
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
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- COUPON SYSTEM
-- =============================================

-- Create coupons table
CREATE TABLE IF NOT EXISTS public.coupons (
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
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
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
-- CREATE ADMIN CHECK FUNCTION
-- =============================================

-- Create a simple admin check function
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Simple check for admin role
  RETURN EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- CREATE RLS POLICIES
-- =============================================

-- Categories policies
CREATE POLICY "Allow public read access to categories"
ON public.categories FOR SELECT USING (true);

CREATE POLICY "Allow admin full access to categories"
ON public.categories USING (public.is_admin());

-- Products policies
CREATE POLICY "Allow public read access to products"
ON public.products FOR SELECT USING (true);

CREATE POLICY "Allow admin full access to products"
ON public.products USING (public.is_admin());

-- User profiles policies
CREATE POLICY "Users can view their own profile"
ON public.user_profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.user_profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Allow admin full access to user profiles"
ON public.user_profiles USING (public.is_admin());

-- Orders policies
CREATE POLICY "Users can view their own orders"
ON public.orders FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders"
ON public.orders FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow admin full access to orders"
ON public.orders USING (public.is_admin());

-- Order items policies
CREATE POLICY "Users can view their own order items"
ON public.order_items FOR SELECT USING (
  order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid())
);

CREATE POLICY "Users can create their own order items"
ON public.order_items FOR INSERT WITH CHECK (
  order_id IN (SELECT id FROM public.orders WHERE user_id = auth.uid())
);

CREATE POLICY "Allow admin full access to order items"
ON public.order_items USING (public.is_admin());

-- Carts policies
CREATE POLICY "Users can view their own cart"
ON public.carts FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cart"
ON public.carts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart"
ON public.carts FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart"
ON public.carts FOR DELETE USING (auth.uid() = user_id);

-- Cart items policies
CREATE POLICY "Users can view their own cart items"
ON public.cart_items FOR SELECT USING (
  cart_id IN (SELECT id FROM public.carts WHERE user_id = auth.uid())
);

CREATE POLICY "Users can create their own cart items"
ON public.cart_items FOR INSERT WITH CHECK (
  cart_id IN (SELECT id FROM public.carts WHERE user_id = auth.uid())
);

CREATE POLICY "Users can update their own cart items"
ON public.cart_items FOR UPDATE USING (
  cart_id IN (SELECT id FROM public.carts WHERE user_id = auth.uid())
);

CREATE POLICY "Users can delete their own cart items"
ON public.cart_items FOR DELETE USING (
  cart_id IN (SELECT id FROM public.carts WHERE user_id = auth.uid())
);

-- Wishlists policies
CREATE POLICY "Users can view their own wishlist"
ON public.wishlists FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own wishlist"
ON public.wishlists FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wishlist"
ON public.wishlists FOR DELETE USING (auth.uid() = user_id);

-- Wishlist items policies
CREATE POLICY "Users can view their own wishlist items"
ON public.wishlist_items FOR SELECT USING (
  wishlist_id IN (SELECT id FROM public.wishlists WHERE user_id = auth.uid())
);

CREATE POLICY "Users can create their own wishlist items"
ON public.wishlist_items FOR INSERT WITH CHECK (
  wishlist_id IN (SELECT id FROM public.wishlists WHERE user_id = auth.uid())
);

CREATE POLICY "Users can delete their own wishlist items"
ON public.wishlist_items FOR DELETE USING (
  wishlist_id IN (SELECT id FROM public.wishlists WHERE user_id = auth.uid())
);

-- Gift boxes policies
CREATE POLICY "Allow public read access to gift boxes"
ON public.gift_boxes FOR SELECT USING (true);

CREATE POLICY "Allow admin full access to gift boxes"
ON public.gift_boxes USING (public.is_admin());

-- Gift box items policies
CREATE POLICY "Allow public read access to gift box items"
ON public.gift_box_items FOR SELECT USING (true);

CREATE POLICY "Allow admin full access to gift box items"
ON public.gift_box_items USING (public.is_admin());

-- Bulk order requests policies
CREATE POLICY "Users can view their own bulk order requests"
ON public.bulk_order_requests FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create bulk order requests"
ON public.bulk_order_requests FOR INSERT WITH CHECK (
  auth.uid() IS NULL OR auth.uid() = user_id
);

CREATE POLICY "Allow admin full access to bulk order requests"
ON public.bulk_order_requests USING (public.is_admin());

-- Reviews policies
CREATE POLICY "Allow public read access to reviews"
ON public.reviews FOR SELECT USING (true);

CREATE POLICY "Users can create their own reviews"
ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
ON public.reviews FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
ON public.reviews FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Allow admin full access to reviews"
ON public.reviews USING (public.is_admin());

-- Coupons policies
CREATE POLICY "Allow public read access to active coupons"
ON public.coupons FOR SELECT USING (
  is_active = true AND
  (start_date IS NULL OR start_date <= now()) AND
  (end_date IS NULL OR end_date >= now()) AND
  (usage_limit IS NULL OR usage_count < usage_limit)
);

CREATE POLICY "Allow admin full access to coupons"
ON public.coupons USING (public.is_admin());

-- Newsletter subscribers policies
CREATE POLICY "Allow public to subscribe to newsletter"
ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admin full access to newsletter subscribers"
ON public.newsletter_subscribers USING (public.is_admin());

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

-- Function to update product rating
CREATE OR REPLACE FUNCTION public.update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the product's rating and review count
    UPDATE public.products
    SET
        rating = (
            SELECT COALESCE(AVG(rating), 0)
            FROM public.reviews
            WHERE product_id = NEW.product_id
        ),
        review_count = (
            SELECT COUNT(*)
            FROM public.reviews
            WHERE product_id = NEW.product_id
        )
    WHERE id = NEW.product_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for updating product rating
CREATE TRIGGER update_product_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_product_rating();

-- =============================================
-- GRANT PERMISSIONS
-- =============================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.user_profiles TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.orders TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.order_items TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.carts TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.cart_items TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.wishlists TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.wishlist_items TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.bulk_order_requests TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT INSERT ON public.newsletter_subscribers TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.validate_coupon TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_coupon_to_order TO authenticated;

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
('Organic', 'organic', 'Certified organic products')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample gift boxes
INSERT INTO public.gift_boxes (name, description, base_price, image_url, is_customizable) VALUES
('Premium Gift Box', 'A luxurious assortment of our finest dry fruits and nuts', 49.99, '/images/gift-boxes/premium.jpg', true),
('Healthy Snacker', 'Perfect for health-conscious individuals', 39.99, '/images/gift-boxes/healthy.jpg', true),
('Corporate Gift', 'Impress your clients and colleagues', 79.99, '/images/gift-boxes/corporate.jpg', false),
('Festival Special', 'Celebrate special occasions with our festive selection', 59.99, '/images/gift-boxes/festival.jpg', true)
ON CONFLICT DO NOTHING;

-- Insert sample coupons
INSERT INTO public.coupons (code, description, discount_type, discount_value, minimum_order_amount, is_active, start_date, end_date, usage_limit) VALUES
('WELCOME10', 'Welcome discount for new customers', 'percentage', 10, 0, true, NOW(), NOW() + INTERVAL '1 year', NULL),
('SUMMER2024', 'Summer sale discount', 'percentage', 15, 50, true, '2024-06-01', '2024-09-30', 100),
('FREESHIP', 'Free shipping on orders over $75', 'fixed', 10, 75, true, NOW(), NOW() + INTERVAL '6 months', 50)
ON CONFLICT (code) DO NOTHING;

-- Verify setup
SELECT 'Database setup complete!' as status;
SELECT
    (SELECT COUNT(*) FROM public.categories) as categories_count,
    (SELECT COUNT(*) FROM public.gift_boxes) as gift_boxes_count,
    (SELECT COUNT(*) FROM public.coupons) as coupons_count;
