-- Seed data for coupons
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
) VALUES 
(
  'WELCOME10', 
  'Welcome discount for new customers', 
  'percentage', 
  10, 
  0, 
  true, 
  NOW(), 
  NOW() + INTERVAL '1 year', 
  NULL
),
(
  'SUMMER2024', 
  'Summer sale discount', 
  'percentage', 
  15, 
  50, 
  true, 
  '2024-06-01', 
  '2024-09-30', 
  100
),
(
  'FREESHIP', 
  'Free shipping on orders over $75', 
  'fixed', 
  10, 
  75, 
  true, 
  NOW(), 
  NOW() + INTERVAL '6 months', 
  50
),
(
  'HOLIDAY25', 
  'Holiday season discount', 
  'percentage', 
  25, 
  100, 
  false, 
  '2024-11-15', 
  '2024-12-31', 
  200
),
(
  'FIRSTORDER', 
  'First order discount', 
  'fixed', 
  15, 
  30, 
  true, 
  NOW(), 
  NULL, 
  1
);
