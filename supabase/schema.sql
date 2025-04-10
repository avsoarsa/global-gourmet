-- Create categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE products (
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
  category_id UUID REFERENCES categories(id),
  image_url TEXT,
  rating DECIMAL(3, 2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table (extends Supabase auth.users)
CREATE TABLE user_profiles (
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

-- Create orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  total_amount DECIMAL(10, 2) NOT NULL,
  shipping_address TEXT,
  shipping_city VARCHAR(255),
  shipping_state VARCHAR(255),
  shipping_postal_code VARCHAR(20),
  shipping_country VARCHAR(255),
  payment_method VARCHAR(50),
  payment_status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cart table
CREATE TABLE carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create cart items table
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wishlist table
CREATE TABLE wishlists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create wishlist items table
CREATE TABLE wishlist_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wishlist_id UUID REFERENCES wishlists(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create gift boxes table
CREATE TABLE gift_boxes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  base_price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  is_customizable BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bulk order requests table
CREATE TABLE bulk_order_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  company_name VARCHAR(255),
  contact_name VARCHAR(255),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  product_details TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  custom_packaging BOOLEAN DEFAULT FALSE,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create newsletter subscribers table
CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create RLS policies
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bulk_order_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Create policies for public access to products and categories
CREATE POLICY "Allow public read access to categories"
  ON categories FOR SELECT USING (true);

CREATE POLICY "Allow public read access to products"
  ON products FOR SELECT USING (true);

CREATE POLICY "Allow public read access to gift boxes"
  ON gift_boxes FOR SELECT USING (true);

-- Create policies for user profiles
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE USING (auth.uid() = id);

-- Create policies for orders
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders"
  ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policies for carts
CREATE POLICY "Users can view their own cart"
  ON carts FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cart"
  ON carts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart"
  ON carts FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for cart items
CREATE POLICY "Users can view their own cart items"
  ON cart_items FOR SELECT USING (
    cart_id IN (SELECT id FROM carts WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert their own cart items"
  ON cart_items FOR INSERT WITH CHECK (
    cart_id IN (SELECT id FROM carts WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update their own cart items"
  ON cart_items FOR UPDATE USING (
    cart_id IN (SELECT id FROM carts WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete their own cart items"
  ON cart_items FOR DELETE USING (
    cart_id IN (SELECT id FROM carts WHERE user_id = auth.uid())
  );

-- Create policies for wishlists
CREATE POLICY "Users can view their own wishlist"
  ON wishlists FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own wishlist"
  ON wishlists FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create policies for wishlist items
CREATE POLICY "Users can view their own wishlist items"
  ON wishlist_items FOR SELECT USING (
    wishlist_id IN (SELECT id FROM wishlists WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert their own wishlist items"
  ON wishlist_items FOR INSERT WITH CHECK (
    wishlist_id IN (SELECT id FROM wishlists WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete their own wishlist items"
  ON wishlist_items FOR DELETE USING (
    wishlist_id IN (SELECT id FROM wishlists WHERE user_id = auth.uid())
  );

-- Create policies for reviews
CREATE POLICY "Allow public read access to reviews"
  ON reviews FOR SELECT USING (true);

CREATE POLICY "Users can create their own reviews"
  ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON reviews FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for bulk order requests
CREATE POLICY "Users can view their own bulk order requests"
  ON bulk_order_requests FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create bulk order requests"
  ON bulk_order_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create functions and triggers to update product ratings
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products
  SET
    rating = (SELECT AVG(rating) FROM reviews WHERE product_id = NEW.product_id),
    review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = NEW.product_id)
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_product_rating_trigger
AFTER INSERT OR UPDATE OR DELETE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_product_rating();

-- Create sample data for categories
INSERT INTO categories (name, slug, description) VALUES
('Dry Fruits', 'dry-fruits', 'Premium quality dry fruits from around the world'),
('Nuts & Seeds', 'nuts-seeds', 'Nutritious nuts and seeds for a healthy lifestyle'),
('Spices', 'spices', 'Authentic spices to enhance your culinary experience'),
('Whole Foods', 'whole-foods', 'Natural whole foods for a balanced diet'),
('Sprouts', 'sprouts', 'Fresh sprouts packed with nutrients'),
('Superfoods', 'superfoods', 'Nutrient-rich superfoods for optimal health');

-- Create sample data for products
INSERT INTO products (name, slug, description, price, stock_quantity, is_featured, is_bestseller, is_organic, category_id, image_url, rating, review_count) VALUES
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
('Mung Bean Sprouts', 'mung-bean-sprouts', 'Crunchy mung bean sprouts rich in protein and vitamins.', 3.99, 35, false, false, true, (SELECT id FROM categories WHERE slug = 'sprouts'), 'https://images.unsplash.com/photo-1576486599420-194316d45840', 4.2, 18);

-- Create sample data for gift boxes
INSERT INTO gift_boxes (name, description, base_price, image_url, is_customizable) VALUES
('Gourmet Delight Box', 'A carefully curated selection of our finest dry fruits and spices, perfect for gifting.', 49.99, 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716', true),
('Wellness Package', 'Organic superfoods and sprouts for health-conscious individuals.', 59.99, 'https://images.unsplash.com/photo-1601493700518-42b241a914d2', true),
('Corporate Gift Hamper', 'Premium selection for corporate gifting with customizable branding options.', 99.99, 'https://images.unsplash.com/photo-1600348759200-5b94753c5a4e', true),
('Festive Celebration Box', 'A luxurious assortment of premium nuts and dried fruits for special occasions.', 79.99, 'https://images.unsplash.com/photo-1607920592519-bab2a4e0d362', true),
('Healthy Snack Box', 'A variety of nutritious snacks perfect for the health-conscious individual.', 39.99, 'https://images.unsplash.com/photo-1606923829579-0cb981a83e2e', true),
('Spice Explorer Collection', 'A curated selection of exotic spices from around the world.', 45.99, 'https://images.unsplash.com/photo-1588514912908-8f673c1a8ed3', true);

-- Create sample data for reviews
INSERT INTO reviews (product_id, user_id, rating, comment, created_at) VALUES
((SELECT id FROM products WHERE slug = 'premium-california-almonds'), '00000000-0000-0000-0000-000000000001', 5, 'These almonds are incredibly fresh and tasty. Will definitely buy again!', NOW() - INTERVAL '2 days'),
((SELECT id FROM products WHERE slug = 'premium-california-almonds'), '00000000-0000-0000-0000-000000000002', 4, 'Great quality almonds, but the packaging could be improved.', NOW() - INTERVAL '5 days'),
((SELECT id FROM products WHERE slug = 'organic-turmeric-powder'), '00000000-0000-0000-0000-000000000003', 5, 'The best turmeric powder I have ever used. Very potent and flavorful.', NOW() - INTERVAL '1 day'),
((SELECT id FROM products WHERE slug = 'organic-turmeric-powder'), '00000000-0000-0000-0000-000000000001', 3, 'Good quality but the container arrived damaged.', NOW() - INTERVAL '7 days'),
((SELECT id FROM products WHERE slug = 'assorted-nuts-mix'), '00000000-0000-0000-0000-000000000002', 5, 'Perfect mix of nuts, all very fresh. Great for snacking!', NOW() - INTERVAL '3 days'),
((SELECT id FROM products WHERE slug = 'organic-quinoa-seeds'), '00000000-0000-0000-0000-000000000003', 4, 'High quality quinoa, cooks perfectly every time.', NOW() - INTERVAL '4 days');

-- Create sample data for user profiles
INSERT INTO user_profiles (id, first_name, last_name, phone, address, city, state, postal_code, country, is_admin) VALUES
('00000000-0000-0000-0000-000000000001', 'John', 'Doe', '555-123-4567', '123 Main St', 'New York', 'NY', '10001', 'USA', false),
('00000000-0000-0000-0000-000000000002', 'Jane', 'Smith', '555-987-6543', '456 Oak Ave', 'Los Angeles', 'CA', '90001', 'USA', false),
('00000000-0000-0000-0000-000000000003', 'Admin', 'User', '555-555-5555', '789 Admin Blvd', 'Chicago', 'IL', '60601', 'USA', true);
