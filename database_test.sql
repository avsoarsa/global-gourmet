-- Global Gourmet Database Test Script
-- This script inserts test data into all tables and verifies relationships

-- =============================================
-- CLEAR EXISTING TEST DATA (OPTIONAL)
-- =============================================
-- Uncomment these lines if you want to clear existing test data
/*
DELETE FROM public.newsletter_subscribers WHERE email LIKE 'test%@example.com';
DELETE FROM public.reviews WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'test@example.com');
DELETE FROM public.bulk_order_requests WHERE email LIKE 'test%@example.com';
DELETE FROM public.gift_box_items WHERE gift_box_id IN (SELECT id FROM public.gift_boxes WHERE name LIKE 'Test Gift Box%');
DELETE FROM public.gift_boxes WHERE name LIKE 'Test Gift Box%';
DELETE FROM public.wishlist_items WHERE wishlist_id IN (SELECT id FROM public.wishlists WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'test@example.com'));
DELETE FROM public.wishlists WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'test@example.com');
DELETE FROM public.cart_items WHERE cart_id IN (SELECT id FROM public.carts WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'test@example.com'));
DELETE FROM public.carts WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'test@example.com');
DELETE FROM public.order_items WHERE order_id IN (SELECT id FROM public.orders WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'test@example.com'));
DELETE FROM public.orders WHERE user_id IN (SELECT id FROM auth.users WHERE email = 'test@example.com');
DELETE FROM public.products WHERE name LIKE 'Test Product%';
DELETE FROM public.categories WHERE name LIKE 'Test Category%';
*/

-- =============================================
-- TEST DATA INSERTION
-- =============================================

-- Create test categories
INSERT INTO public.categories (name, slug, description)
VALUES 
  ('Test Category 1', 'test-category-1', 'Test category description 1'),
  ('Test Category 2', 'test-category-2', 'Test category description 2'),
  ('Test Category 3', 'test-category-3', 'Test category description 3')
ON CONFLICT (slug) DO NOTHING
RETURNING id, name;

-- Create test products
INSERT INTO public.products (name, slug, description, price, sale_price, stock_quantity, is_featured, is_bestseller, is_organic, category_id, image_url)
VALUES 
  (
    'Test Product 1', 
    'test-product-1', 
    'Test product description 1', 
    19.99, 
    17.99, 
    100, 
    true, 
    true, 
    false, 
    (SELECT id FROM public.categories WHERE slug = 'test-category-1'), 
    '/images/test-product-1.jpg'
  ),
  (
    'Test Product 2', 
    'test-product-2', 
    'Test product description 2', 
    29.99, 
    NULL, 
    50, 
    false, 
    true, 
    true, 
    (SELECT id FROM public.categories WHERE slug = 'test-category-2'), 
    '/images/test-product-2.jpg'
  ),
  (
    'Test Product 3', 
    'test-product-3', 
    'Test product description 3', 
    39.99, 
    34.99, 
    75, 
    true, 
    false, 
    true, 
    (SELECT id FROM public.categories WHERE slug = 'test-category-3'), 
    '/images/test-product-3.jpg'
  )
ON CONFLICT (slug) DO NOTHING
RETURNING id, name, category_id;

-- Create test user (if not exists)
-- Note: This requires admin privileges and might not work in all environments
-- You may need to create a test user manually through the Supabase Auth UI
DO $$
DECLARE
    test_user_id UUID;
BEGIN
    -- Check if test user exists
    SELECT id INTO test_user_id FROM auth.users WHERE email = 'test@example.com' LIMIT 1;
    
    -- If test user doesn't exist and we have admin privileges, create one
    IF test_user_id IS NULL THEN
        BEGIN
            -- Try to create a user (this might fail without proper admin privileges)
            INSERT INTO auth.users (email, email_confirmed_at, created_at, updated_at)
            VALUES ('test@example.com', now(), now(), now())
            RETURNING id INTO test_user_id;
            
            -- Create user profile
            INSERT INTO public.user_profiles (id, first_name, last_name, phone, address, city, state, postal_code, country, is_admin)
            VALUES (test_user_id, 'Test', 'User', '123-456-7890', '123 Test St', 'Test City', 'Test State', '12345', 'Test Country', true);
            
            RAISE NOTICE 'Created test user with ID: %', test_user_id;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Could not create test user. You may need to create one manually through the Supabase Auth UI.';
            -- Use a placeholder UUID for testing other tables
            test_user_id := '00000000-0000-0000-0000-000000000000'::UUID;
        END;
    ELSE
        RAISE NOTICE 'Test user already exists with ID: %', test_user_id;
        
        -- Ensure user profile exists
        INSERT INTO public.user_profiles (id, first_name, last_name, phone, address, city, state, postal_code, country, is_admin)
        VALUES (test_user_id, 'Test', 'User', '123-456-7890', '123 Test St', 'Test City', 'Test State', '12345', 'Test Country', true)
        ON CONFLICT (id) DO UPDATE
        SET first_name = 'Test', last_name = 'User', is_admin = true;
    END IF;
    
    -- Create test cart
    INSERT INTO public.carts (user_id)
    VALUES (test_user_id)
    ON CONFLICT DO NOTHING;
    
    -- Get cart ID
    DECLARE
        test_cart_id UUID;
    BEGIN
        SELECT id INTO test_cart_id FROM public.carts WHERE user_id = test_user_id LIMIT 1;
        
        -- Add items to cart
        INSERT INTO public.cart_items (cart_id, product_id, quantity)
        VALUES 
          (test_cart_id, (SELECT id FROM public.products WHERE slug = 'test-product-1'), 2),
          (test_cart_id, (SELECT id FROM public.products WHERE slug = 'test-product-2'), 1)
        ON CONFLICT DO NOTHING;
    END;
    
    -- Create test wishlist
    INSERT INTO public.wishlists (user_id)
    VALUES (test_user_id)
    ON CONFLICT DO NOTHING;
    
    -- Get wishlist ID
    DECLARE
        test_wishlist_id UUID;
    BEGIN
        SELECT id INTO test_wishlist_id FROM public.wishlists WHERE user_id = test_user_id LIMIT 1;
        
        -- Add items to wishlist
        INSERT INTO public.wishlist_items (wishlist_id, product_id)
        VALUES 
          (test_wishlist_id, (SELECT id FROM public.products WHERE slug = 'test-product-3'))
        ON CONFLICT DO NOTHING;
    END;
    
    -- Create test order
    DECLARE
        test_order_id UUID;
    BEGIN
        INSERT INTO public.orders (
            user_id, 
            status, 
            subtotal, 
            discount_amount, 
            tax_amount, 
            shipping_amount, 
            total_amount, 
            shipping_address, 
            shipping_city, 
            shipping_state, 
            shipping_postal_code, 
            shipping_country, 
            payment_method, 
            payment_status
        )
        VALUES (
            test_user_id,
            'pending',
            89.97,
            10.00,
            7.99,
            0.00,
            87.96,
            '123 Test St',
            'Test City',
            'Test State',
            '12345',
            'Test Country',
            'credit_card',
            'pending'
        )
        RETURNING id INTO test_order_id;
        
        -- Add order items
        INSERT INTO public.order_items (order_id, product_id, quantity, price)
        VALUES 
          (test_order_id, (SELECT id FROM public.products WHERE slug = 'test-product-1'), 2, 19.99),
          (test_order_id, (SELECT id FROM public.products WHERE slug = 'test-product-2'), 1, 29.99),
          (test_order_id, (SELECT id FROM public.products WHERE slug = 'test-product-3'), 1, 39.99);
    END;
END $$;

-- Create test gift boxes
INSERT INTO public.gift_boxes (name, description, base_price, image_url, is_customizable)
VALUES 
  ('Test Gift Box 1', 'Test gift box description 1', 49.99, '/images/test-gift-box-1.jpg', true),
  ('Test Gift Box 2', 'Test gift box description 2', 69.99, '/images/test-gift-box-2.jpg', false)
ON CONFLICT DO NOTHING
RETURNING id, name;

-- Add products to gift boxes
INSERT INTO public.gift_box_items (gift_box_id, product_id, quantity)
VALUES 
  (
    (SELECT id FROM public.gift_boxes WHERE name = 'Test Gift Box 1'), 
    (SELECT id FROM public.products WHERE slug = 'test-product-1'), 
    1
  ),
  (
    (SELECT id FROM public.gift_boxes WHERE name = 'Test Gift Box 1'), 
    (SELECT id FROM public.products WHERE slug = 'test-product-2'), 
    1
  ),
  (
    (SELECT id FROM public.gift_boxes WHERE name = 'Test Gift Box 2'), 
    (SELECT id FROM public.products WHERE slug = 'test-product-3'), 
    2
  )
ON CONFLICT DO NOTHING;

-- Create test bulk order request
INSERT INTO public.bulk_order_requests (
  user_id, 
  company_name, 
  contact_name, 
  email, 
  phone, 
  product_details, 
  quantity, 
  custom_packaging, 
  status
)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'test@example.com' LIMIT 1),
  'Test Company',
  'Test Contact',
  'test-bulk@example.com',
  '123-456-7890',
  'Bulk order of Test Product 1 and Test Product 2',
  1000,
  true,
  'pending'
)
ON CONFLICT DO NOTHING
RETURNING id;

-- Create test review
INSERT INTO public.reviews (
  product_id, 
  user_id, 
  rating, 
  comment
)
VALUES (
  (SELECT id FROM public.products WHERE slug = 'test-product-1'),
  (SELECT id FROM auth.users WHERE email = 'test@example.com' LIMIT 1),
  5,
  'This is a test review. The product is excellent!'
)
ON CONFLICT DO NOTHING
RETURNING id;

-- Create test coupon
INSERT INTO public.coupons (
  code, 
  description, 
  discount_type, 
  discount_value, 
  minimum_order_amount, 
  is_active, 
  start_date, 
  end_date, 
  usage_limit
)
VALUES (
  'TESTCODE',
  'Test coupon for database verification',
  'percentage',
  15,
  50.00,
  true,
  NOW(),
  NOW() + INTERVAL '30 days',
  100
)
ON CONFLICT (code) DO NOTHING
RETURNING id, code;

-- Create test newsletter subscriber
INSERT INTO public.newsletter_subscribers (
  email,
  is_active
)
VALUES (
  'test-newsletter@example.com',
  true
)
ON CONFLICT (email) DO NOTHING
RETURNING id, email;

-- =============================================
-- VERIFY RELATIONSHIPS
-- =============================================

-- Verify product-category relationship
SELECT 
    p.id AS product_id, 
    p.name AS product_name, 
    c.id AS category_id, 
    c.name AS category_name
FROM 
    public.products p
JOIN 
    public.categories c ON p.category_id = c.id
WHERE 
    p.name LIKE 'Test Product%';

-- Verify cart-cart items relationship
SELECT 
    c.id AS cart_id, 
    c.user_id, 
    ci.id AS cart_item_id, 
    p.name AS product_name, 
    ci.quantity
FROM 
    public.carts c
JOIN 
    public.cart_items ci ON c.id = ci.cart_id
JOIN 
    public.products p ON ci.product_id = p.id
WHERE 
    c.user_id = (SELECT id FROM auth.users WHERE email = 'test@example.com' LIMIT 1);

-- Verify wishlist-wishlist items relationship
SELECT 
    w.id AS wishlist_id, 
    w.user_id, 
    wi.id AS wishlist_item_id, 
    p.name AS product_name
FROM 
    public.wishlists w
JOIN 
    public.wishlist_items wi ON w.id = wi.wishlist_id
JOIN 
    public.products p ON wi.product_id = p.id
WHERE 
    w.user_id = (SELECT id FROM auth.users WHERE email = 'test@example.com' LIMIT 1);

-- Verify order-order items relationship
SELECT 
    o.id AS order_id, 
    o.user_id, 
    o.status, 
    o.total_amount, 
    oi.id AS order_item_id, 
    p.name AS product_name, 
    oi.quantity, 
    oi.price
FROM 
    public.orders o
JOIN 
    public.order_items oi ON o.id = oi.order_id
JOIN 
    public.products p ON oi.product_id = p.id
WHERE 
    o.user_id = (SELECT id FROM auth.users WHERE email = 'test@example.com' LIMIT 1);

-- Verify gift box-gift box items relationship
SELECT 
    gb.id AS gift_box_id, 
    gb.name AS gift_box_name, 
    gbi.id AS gift_box_item_id, 
    p.name AS product_name, 
    gbi.quantity
FROM 
    public.gift_boxes gb
JOIN 
    public.gift_box_items gbi ON gb.id = gbi.gift_box_id
JOIN 
    public.products p ON gbi.product_id = p.id
WHERE 
    gb.name LIKE 'Test Gift Box%';

-- Verify review-product-user relationship
SELECT 
    r.id AS review_id, 
    r.rating, 
    r.comment, 
    p.name AS product_name, 
    u.email AS user_email
FROM 
    public.reviews r
JOIN 
    public.products p ON r.product_id = p.id
JOIN 
    auth.users u ON r.user_id = u.id
WHERE 
    u.email = 'test@example.com';

-- Verify bulk order request-user relationship
SELECT 
    bor.id AS bulk_order_request_id, 
    bor.company_name, 
    bor.contact_name, 
    bor.email, 
    bor.product_details, 
    bor.status, 
    u.email AS user_email
FROM 
    public.bulk_order_requests bor
LEFT JOIN 
    auth.users u ON bor.user_id = u.id
WHERE 
    bor.email = 'test-bulk@example.com';

-- Verify coupon data
SELECT 
    id, 
    code, 
    discount_type, 
    discount_value, 
    minimum_order_amount, 
    is_active, 
    start_date, 
    end_date, 
    usage_limit, 
    usage_count
FROM 
    public.coupons
WHERE 
    code = 'TESTCODE';

-- Verify newsletter subscriber data
SELECT 
    id, 
    email, 
    is_active, 
    created_at
FROM 
    public.newsletter_subscribers
WHERE 
    email = 'test-newsletter@example.com';

-- =============================================
-- SUMMARY
-- =============================================

-- Count records in each table
SELECT 
    'categories' AS table_name, COUNT(*) AS record_count FROM public.categories WHERE name LIKE 'Test Category%'
UNION ALL
SELECT 
    'products' AS table_name, COUNT(*) AS record_count FROM public.products WHERE name LIKE 'Test Product%'
UNION ALL
SELECT 
    'user_profiles' AS table_name, COUNT(*) AS record_count FROM public.user_profiles WHERE first_name = 'Test' AND last_name = 'User'
UNION ALL
SELECT 
    'carts' AS table_name, COUNT(*) AS record_count FROM public.carts WHERE user_id = (SELECT id FROM auth.users WHERE email = 'test@example.com' LIMIT 1)
UNION ALL
SELECT 
    'cart_items' AS table_name, COUNT(*) AS record_count FROM public.cart_items WHERE cart_id IN (SELECT id FROM public.carts WHERE user_id = (SELECT id FROM auth.users WHERE email = 'test@example.com' LIMIT 1))
UNION ALL
SELECT 
    'wishlists' AS table_name, COUNT(*) AS record_count FROM public.wishlists WHERE user_id = (SELECT id FROM auth.users WHERE email = 'test@example.com' LIMIT 1)
UNION ALL
SELECT 
    'wishlist_items' AS table_name, COUNT(*) AS record_count FROM public.wishlist_items WHERE wishlist_id IN (SELECT id FROM public.wishlists WHERE user_id = (SELECT id FROM auth.users WHERE email = 'test@example.com' LIMIT 1))
UNION ALL
SELECT 
    'orders' AS table_name, COUNT(*) AS record_count FROM public.orders WHERE user_id = (SELECT id FROM auth.users WHERE email = 'test@example.com' LIMIT 1)
UNION ALL
SELECT 
    'order_items' AS table_name, COUNT(*) AS record_count FROM public.order_items WHERE order_id IN (SELECT id FROM public.orders WHERE user_id = (SELECT id FROM auth.users WHERE email = 'test@example.com' LIMIT 1))
UNION ALL
SELECT 
    'gift_boxes' AS table_name, COUNT(*) AS record_count FROM public.gift_boxes WHERE name LIKE 'Test Gift Box%'
UNION ALL
SELECT 
    'gift_box_items' AS table_name, COUNT(*) AS record_count FROM public.gift_box_items WHERE gift_box_id IN (SELECT id FROM public.gift_boxes WHERE name LIKE 'Test Gift Box%')
UNION ALL
SELECT 
    'bulk_order_requests' AS table_name, COUNT(*) AS record_count FROM public.bulk_order_requests WHERE email = 'test-bulk@example.com'
UNION ALL
SELECT 
    'reviews' AS table_name, COUNT(*) AS record_count FROM public.reviews WHERE user_id = (SELECT id FROM auth.users WHERE email = 'test@example.com' LIMIT 1)
UNION ALL
SELECT 
    'coupons' AS table_name, COUNT(*) AS record_count FROM public.coupons WHERE code = 'TESTCODE'
UNION ALL
SELECT 
    'newsletter_subscribers' AS table_name, COUNT(*) AS record_count FROM public.newsletter_subscribers WHERE email = 'test-newsletter@example.com';

-- Final verification message
SELECT 'Database test complete! If all counts are greater than 0, the database is properly set up and relationships are working correctly.' AS result;
