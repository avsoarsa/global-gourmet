-- Global Gourmet Database Setup - Simplified Version
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
INSERT INTO categories (name, slug, description) VALUES
  ('Dry Fruits', 'dry-fruits', 'Premium quality dry fruits from around the world');

INSERT INTO categories (name, slug, description) VALUES
  ('Nuts & Seeds', 'nuts-seeds', 'Nutritious nuts and seeds for a healthy lifestyle');

INSERT INTO categories (name, slug, description) VALUES
  ('Spices', 'spices', 'Authentic spices to enhance your culinary experience');

INSERT INTO categories (name, slug, description) VALUES
  ('Whole Foods', 'whole-foods', 'Natural whole foods for a balanced diet');

INSERT INTO categories (name, slug, description) VALUES
  ('Sprouts', 'sprouts', 'Fresh sprouts packed with nutrients');

INSERT INTO categories (name, slug, description) VALUES
  ('Superfoods', 'superfoods', 'Nutrient-rich superfoods for optimal health');

-- Insert products (one at a time to avoid reference issues)
INSERT INTO products (name, slug, description, price, stock_quantity, is_featured, is_bestseller, is_organic, category_id, image_url, rating, review_count)
VALUES ('Premium California Almonds', 'premium-california-almonds', 'High-quality almonds sourced from California farms.', 12.99, 100, true, true, false, 
       (SELECT id FROM categories WHERE slug = 'nuts-seeds'), 
       'https://images.unsplash.com/photo-1600348759200-5b94753c5a4e', 4.5, 48);

INSERT INTO products (name, slug, description, price, stock_quantity, is_featured, is_bestseller, is_organic, category_id, image_url, rating, review_count)
VALUES ('Organic Turmeric Powder', 'organic-turmeric-powder', 'Pure organic turmeric powder with high curcumin content.', 8.99, 80, true, false, true, 
       (SELECT id FROM categories WHERE slug = 'spices'), 
       'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716', 4.0, 36);

INSERT INTO products (name, slug, description, price, stock_quantity, is_featured, is_bestseller, is_organic, category_id, image_url, rating, review_count)
VALUES ('Assorted Nuts Mix (1kg)', 'assorted-nuts-mix', 'A delicious mix of premium nuts including almonds, cashews, and walnuts.', 18.99, 50, true, false, false, 
       (SELECT id FROM categories WHERE slug = 'nuts-seeds'), 
       'https://images.unsplash.com/photo-1601493700895-eea82a48a8f2', 5.0, 72);

INSERT INTO products (name, slug, description, price, stock_quantity, is_featured, is_bestseller, is_organic, category_id, image_url, rating, review_count)
VALUES ('Organic Quinoa Seeds', 'organic-quinoa-seeds', 'Nutrient-rich organic quinoa seeds for a healthy diet.', 14.99, 60, true, false, true, 
       (SELECT id FROM categories WHERE slug = 'whole-foods'), 
       'https://images.unsplash.com/photo-1601493700518-42b241a914d2', 4.5, 29);

INSERT INTO products (name, slug, description, price, stock_quantity, is_featured, is_bestseller, is_organic, category_id, image_url, rating, review_count)
VALUES ('Dried Apricots', 'dried-apricots', 'Sweet and tangy dried apricots, perfect for snacking or baking.', 9.99, 120, true, true, true, 
       (SELECT id FROM categories WHERE slug = 'dry-fruits'), 
       'https://images.unsplash.com/photo-1596273312170-8ecb855913e5', 4.7, 56);

INSERT INTO products (name, slug, description, price, stock_quantity, is_featured, is_bestseller, is_organic, category_id, image_url, rating, review_count)
VALUES ('Medjool Dates', 'medjool-dates', 'Premium Medjool dates known for their sweetness and soft texture.', 11.99, 90, true, false, true, 
       (SELECT id FROM categories WHERE slug = 'dry-fruits'), 
       'https://images.unsplash.com/photo-1601897655071-982a0f079b5d', 4.8, 63);

-- Insert gift boxes
INSERT INTO gift_boxes (name, description, base_price, image_url, is_customizable)
VALUES ('Gourmet Delight Box', 'A carefully curated selection of our finest dry fruits and spices, perfect for gifting.', 49.99, 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716', true);

INSERT INTO gift_boxes (name, description, base_price, image_url, is_customizable)
VALUES ('Wellness Package', 'Organic superfoods and sprouts for health-conscious individuals.', 59.99, 'https://images.unsplash.com/photo-1601493700518-42b241a914d2', true);

INSERT INTO gift_boxes (name, description, base_price, image_url, is_customizable)
VALUES ('Corporate Gift Hamper', 'Premium selection for corporate gifting with customizable branding options.', 99.99, 'https://images.unsplash.com/photo-1600348759200-5b94753c5a4e', true);
