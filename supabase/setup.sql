-- Global Gourmet Database Setup
-- Run this SQL in the Supabase SQL Editor to set up the database

-- Create tables
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  sale_price DECIMAL(10, 2),
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_bestseller BOOLEAN DEFAULT FALSE,
  is_organic BOOLEAN DEFAULT FALSE,
  category_id UUID REFERENCES categories(id),
  image_url TEXT,
  rating DECIMAL(3, 2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gift_boxes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  base_price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  is_customizable BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert categories
INSERT INTO categories (name, slug, description)
VALUES
  ('Dry Fruits', 'dry-fruits', 'Premium quality dry fruits from around the world'),
  ('Nuts & Seeds', 'nuts-seeds', 'Nutritious nuts and seeds for a healthy lifestyle'),
  ('Spices', 'spices', 'Authentic spices to enhance your culinary experience'),
  ('Whole Foods', 'whole-foods', 'Natural whole foods for a balanced diet'),
  ('Sprouts', 'sprouts', 'Fresh sprouts packed with nutrients'),
  ('Superfoods', 'superfoods', 'Nutrient-rich superfoods for optimal health')
ON CONFLICT (slug) DO NOTHING;

-- Insert products
INSERT INTO products (name, slug, description, price, stock_quantity, is_featured, is_bestseller, is_organic, category_id, image_url, rating, review_count)
VALUES
  ('Premium California Almonds', 'premium-california-almonds', 'High-quality almonds sourced from California farms.', 12.99, 100, true, true, false, (SELECT id FROM categories WHERE slug = 'nuts-seeds'), 'https://images.unsplash.com/photo-1600348759200-5b94753c5a4e', 4.5, 48),
  ('Organic Turmeric Powder', 'organic-turmeric-powder', 'Pure organic turmeric powder with high curcumin content.', 8.99, 80, true, false, true, (SELECT id FROM categories WHERE slug = 'spices'), 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716', 4.0, 36),
  ('Assorted Nuts Mix (1kg)', 'assorted-nuts-mix', 'A delicious mix of premium nuts including almonds, cashews, and walnuts.', 18.99, 50, true, false, false, (SELECT id FROM categories WHERE slug = 'nuts-seeds'), 'https://images.unsplash.com/photo-1601493700895-eea82a48a8f2', 5.0, 72),
  ('Organic Quinoa Seeds', 'organic-quinoa-seeds', 'Nutrient-rich organic quinoa seeds for a healthy diet.', 14.99, 60, true, false, true, (SELECT id FROM categories WHERE slug = 'whole-foods'), 'https://images.unsplash.com/photo-1601493700518-42b241a914d2', 4.5, 29),
  ('Dried Apricots', 'dried-apricots', 'Sweet and tangy dried apricots, perfect for snacking or baking.', 9.99, 120, true, true, true, (SELECT id FROM categories WHERE slug = 'dry-fruits'), 'https://images.unsplash.com/photo-1596273312170-8ecb855913e5', 4.7, 56),
  ('Medjool Dates', 'medjool-dates', 'Premium Medjool dates known for their sweetness and soft texture.', 11.99, 90, true, false, true, (SELECT id FROM categories WHERE slug = 'dry-fruits'), 'https://images.unsplash.com/photo-1601897655071-982a0f079b5d', 4.8, 63),
  ('Organic Chia Seeds', 'organic-chia-seeds', 'Nutrient-dense chia seeds rich in omega-3 fatty acids and fiber.', 7.99, 110, false, true, true, (SELECT id FROM categories WHERE slug = 'nuts-seeds'), 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55', 4.6, 42),
  ('Cinnamon Sticks', 'cinnamon-sticks', 'Premium quality cinnamon sticks with intense aroma and flavor.', 6.99, 75, false, false, false, (SELECT id FROM categories WHERE slug = 'spices'), 'https://images.unsplash.com/photo-1588514912908-8f673c1a8ed3', 4.3, 31),
  ('Organic Goji Berries', 'organic-goji-berries', 'Antioxidant-rich goji berries known for their numerous health benefits.', 13.99, 65, true, false, true, (SELECT id FROM categories WHERE slug = 'superfoods'), 'https://images.unsplash.com/photo-1606923829579-0cb981a83e2e', 4.4, 38),
  ('Raw Cashews', 'raw-cashews', 'Creamy and delicious raw cashews, perfect for snacking or making cashew milk.', 15.99, 85, true, true, false, (SELECT id FROM categories WHERE slug = 'nuts-seeds'), 'https://images.unsplash.com/photo-1563412885-e335dc95c512', 4.7, 52),
  ('Black Peppercorns', 'black-peppercorns', 'Aromatic black peppercorns for adding depth and heat to your dishes.', 5.99, 95, false, false, false, (SELECT id FROM categories WHERE slug = 'spices'), 'https://images.unsplash.com/photo-1599690925058-90e1a0b56154', 4.2, 27),
  ('Alfalfa Sprouts', 'alfalfa-sprouts', 'Fresh and crisp alfalfa sprouts, perfect for salads and sandwiches.', 4.99, 40, false, false, true, (SELECT id FROM categories WHERE slug = 'sprouts'), 'https://images.unsplash.com/photo-1550828484-59a4a505a010', 4.1, 19),
  ('Organic Flaxseeds', 'organic-flaxseeds', 'Nutrient-rich flaxseeds high in omega-3 fatty acids and fiber.', 6.49, 70, false, true, true, (SELECT id FROM categories WHERE slug = 'nuts-seeds'), 'https://images.unsplash.com/photo-1595856619767-ab05aaa0e0ab', 4.5, 33),
  ('Dried Cranberries', 'dried-cranberries', 'Tangy and sweet dried cranberries, perfect for snacking or adding to salads.', 8.49, 110, false, false, false, (SELECT id FROM categories WHERE slug = 'dry-fruits'), 'https://images.unsplash.com/photo-1597733153203-a54d0fbc47de', 4.3, 29),
  ('Spirulina Powder', 'spirulina-powder', 'Nutrient-dense blue-green algae powder packed with protein and vitamins.', 19.99, 45, false, false, true, (SELECT id FROM categories WHERE slug = 'superfoods'), 'https://images.unsplash.com/photo-1622480916113-9000ac49b79d', 4.0, 22),
  ('Mung Bean Sprouts', 'mung-bean-sprouts', 'Crunchy mung bean sprouts rich in protein and vitamins.', 3.99, 35, false, false, true, (SELECT id FROM categories WHERE slug = 'sprouts'), 'https://images.unsplash.com/photo-1576486599420-194316d45840', 4.2, 18)
ON CONFLICT (slug) DO NOTHING;

-- Insert gift boxes
INSERT INTO gift_boxes (name, description, base_price, image_url, is_customizable)
VALUES
  ('Gourmet Delight Box', 'A carefully curated selection of our finest dry fruits and spices, perfect for gifting.', 49.99, 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716', true),
  ('Wellness Package', 'Organic superfoods and sprouts for health-conscious individuals.', 59.99, 'https://images.unsplash.com/photo-1601493700518-42b241a914d2', true),
  ('Corporate Gift Hamper', 'Premium selection for corporate gifting with customizable branding options.', 99.99, 'https://images.unsplash.com/photo-1600348759200-5b94753c5a4e', true),
  ('Festive Celebration Box', 'A luxurious assortment of premium nuts and dried fruits for special occasions.', 79.99, 'https://images.unsplash.com/photo-1607920592519-bab2a4e0d362', true),
  ('Healthy Snack Box', 'A variety of nutritious snacks perfect for the health-conscious individual.', 39.99, 'https://images.unsplash.com/photo-1606923829579-0cb981a83e2e', true),
  ('Spice Explorer Collection', 'A curated selection of exotic spices from around the world.', 45.99, 'https://images.unsplash.com/photo-1588514912908-8f673c1a8ed3', true)
ON CONFLICT (name) DO NOTHING;
