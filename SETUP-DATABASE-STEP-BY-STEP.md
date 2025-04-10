# Step-by-Step Guide to Setting Up the Global Gourmet Database

This guide will walk you through setting up the database for the Global Gourmet e-commerce website in your Supabase project.

## Step 1: Access Your Supabase Project

1. Go to [https://supabase.com/](https://supabase.com/) and sign in to your account
2. Select your project from the dashboard

## Step 2: Create the Tables

1. In the left sidebar, click on **SQL Editor**
2. Create a new query by clicking the "+" button
3. Copy and paste the following SQL to create the tables:

```sql
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
```

4. Click the "Run" button to execute the query

## Step 3: Insert Categories

1. Create a new query
2. Copy and paste the following SQL to insert categories:

```sql
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
```

3. Click the "Run" button to execute the query

## Step 4: Insert Products

1. Create a new query
2. Copy and paste the following SQL to insert products:

```sql
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
```

3. Click the "Run" button to execute the query

## Step 5: Insert Gift Boxes

1. Create a new query
2. Copy and paste the following SQL to insert gift boxes:

```sql
-- Insert gift boxes
INSERT INTO gift_boxes (name, description, base_price, image_url, is_customizable)
VALUES ('Gourmet Delight Box', 'A carefully curated selection of our finest dry fruits and spices, perfect for gifting.', 49.99, 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716', true);

INSERT INTO gift_boxes (name, description, base_price, image_url, is_customizable)
VALUES ('Wellness Package', 'Organic superfoods and sprouts for health-conscious individuals.', 59.99, 'https://images.unsplash.com/photo-1601493700518-42b241a914d2', true);

INSERT INTO gift_boxes (name, description, base_price, image_url, is_customizable)
VALUES ('Corporate Gift Hamper', 'Premium selection for corporate gifting with customizable branding options.', 99.99, 'https://images.unsplash.com/photo-1600348759200-5b94753c5a4e', true);
```

3. Click the "Run" button to execute the query

## Step 6: Verify the Data

1. In the left sidebar, click on **Table Editor**
2. You should see the tables you created: `categories`, `products`, and `gift_boxes`
3. Click on each table to verify that the data was inserted correctly

## Step 7: Set Up Row-Level Security (RLS) Policies

For a production application, you should set up Row-Level Security policies to control access to your data. For this demo, we'll set up simple policies that allow public read access:

1. Create a new query
2. Copy and paste the following SQL:

```sql
-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_boxes ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "Allow public read access for categories" 
ON categories FOR SELECT 
TO anon
USING (true);

CREATE POLICY "Allow public read access for products" 
ON products FOR SELECT 
TO anon
USING (true);

CREATE POLICY "Allow public read access for gift_boxes" 
ON gift_boxes FOR SELECT 
TO anon
USING (true);
```

3. Click the "Run" button to execute the query

## Step 8: Restart Your Application

1. If your application is running, restart it to ensure it connects to the updated database
2. Navigate to your application in the browser
3. You should now see the products and categories displayed correctly

## Troubleshooting

If you encounter any issues:

1. **Check for error messages** in the SQL Editor
2. **Verify your database URL and API key** in the `.env.local` file
3. **Check the browser console** for any API errors
4. **Try running the queries one at a time** if you encounter any issues with the batch execution
