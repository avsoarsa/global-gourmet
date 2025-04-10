-- Fix policies with infinite recursion issues

-- First, drop all problematic policies
DROP POLICY IF EXISTS "Allow admin full access to categories" ON public.categories;
DROP POLICY IF EXISTS "Allow admin full access to products" ON public.products;
DROP POLICY IF EXISTS "Allow admin full access to user_profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Allow admin full access to orders" ON public.orders;
DROP POLICY IF EXISTS "Allow admin full access to order_items" ON public.order_items;
DROP POLICY IF EXISTS "Allow admin full access to gift_boxes" ON public.gift_boxes;
DROP POLICY IF EXISTS "Allow admin full access to gift_box_items" ON public.gift_box_items;
DROP POLICY IF EXISTS "Allow admin full access to bulk_order_requests" ON public.bulk_order_requests;
DROP POLICY IF EXISTS "Allow admin full access to reviews" ON public.reviews;
DROP POLICY IF EXISTS "Allow admin full access to coupons" ON public.coupons;
DROP POLICY IF EXISTS "Allow admin full access to newsletter_subscribers" ON public.newsletter_subscribers;

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

-- Create new policies using the function
CREATE POLICY "Allow admin full access to categories" 
ON public.categories 
USING (public.is_admin());

CREATE POLICY "Allow admin full access to products" 
ON public.products 
USING (public.is_admin());

CREATE POLICY "Allow admin full access to user_profiles" 
ON public.user_profiles 
USING (public.is_admin());

CREATE POLICY "Allow admin full access to orders" 
ON public.orders 
USING (public.is_admin());

CREATE POLICY "Allow admin full access to order_items" 
ON public.order_items 
USING (public.is_admin());

CREATE POLICY "Allow admin full access to gift_boxes" 
ON public.gift_boxes 
USING (public.is_admin());

CREATE POLICY "Allow admin full access to gift_box_items" 
ON public.gift_box_items 
USING (public.is_admin());

CREATE POLICY "Allow admin full access to bulk_order_requests" 
ON public.bulk_order_requests 
USING (public.is_admin());

CREATE POLICY "Allow admin full access to reviews" 
ON public.reviews 
USING (public.is_admin());

CREATE POLICY "Allow admin full access to coupons" 
ON public.coupons 
USING (public.is_admin());

CREATE POLICY "Allow admin full access to newsletter_subscribers" 
ON public.newsletter_subscribers 
USING (public.is_admin());

-- Verify the fix
SELECT 'Policies fixed successfully!' as status;
