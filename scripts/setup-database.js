/**
 * Database Setup Script
 *
 * This script creates tables and populates the Supabase database with sample data
 * for the Global Gourmet e-commerce platform.
 *
 * Usage:
 * 1. Make sure you have the Supabase URL and key in your .env.local file
 * 2. Run: node scripts/setup-database.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase URL or key not found in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Sample data
const categories = [
  {
    name: 'Dry Fruits',
    slug: 'dry-fruits',
    description: 'Premium quality dry fruits from around the world',
  },
  {
    name: 'Nuts & Seeds',
    slug: 'nuts-seeds',
    description: 'Nutritious nuts and seeds for a healthy lifestyle',
  },
  {
    name: 'Spices',
    slug: 'spices',
    description: 'Authentic spices to enhance your culinary experience',
  },
  {
    name: 'Whole Foods',
    slug: 'whole-foods',
    description: 'Natural whole foods for a balanced diet',
  },
  {
    name: 'Sprouts',
    slug: 'sprouts',
    description: 'Fresh sprouts packed with nutrients',
  },
  {
    name: 'Superfoods',
    slug: 'superfoods',
    description: 'Nutrient-rich superfoods for optimal health',
  },
];

const products = [
  {
    name: 'Premium California Almonds',
    slug: 'premium-california-almonds',
    description: 'High-quality almonds sourced from California farms.',
    price: 12.99,
    stock_quantity: 100,
    is_featured: true,
    is_bestseller: true,
    is_organic: false,
    category_slug: 'nuts-seeds',
    image_url: 'https://images.unsplash.com/photo-1600348759200-5b94753c5a4e',
    rating: 4.5,
    review_count: 48,
  },
  {
    name: 'Organic Turmeric Powder',
    slug: 'organic-turmeric-powder',
    description: 'Pure organic turmeric powder with high curcumin content.',
    price: 8.99,
    stock_quantity: 80,
    is_featured: true,
    is_bestseller: false,
    is_organic: true,
    category_slug: 'spices',
    image_url: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716',
    rating: 4.0,
    review_count: 36,
  },
  {
    name: 'Assorted Nuts Mix (1kg)',
    slug: 'assorted-nuts-mix',
    description: 'A delicious mix of premium nuts including almonds, cashews, and walnuts.',
    price: 18.99,
    stock_quantity: 50,
    is_featured: true,
    is_bestseller: false,
    is_organic: false,
    category_slug: 'nuts-seeds',
    image_url: 'https://images.unsplash.com/photo-1601493700895-eea82a48a8f2',
    rating: 5.0,
    review_count: 72,
  },
  {
    name: 'Organic Quinoa Seeds',
    slug: 'organic-quinoa-seeds',
    description: 'Nutrient-rich organic quinoa seeds for a healthy diet.',
    price: 14.99,
    stock_quantity: 60,
    is_featured: true,
    is_bestseller: false,
    is_organic: true,
    category_slug: 'whole-foods',
    image_url: 'https://images.unsplash.com/photo-1601493700518-42b241a914d2',
    rating: 4.5,
    review_count: 29,
  },
  {
    name: 'Dried Apricots',
    slug: 'dried-apricots',
    description: 'Sweet and tangy dried apricots, perfect for snacking or baking.',
    price: 9.99,
    stock_quantity: 120,
    is_featured: true,
    is_bestseller: true,
    is_organic: true,
    category_slug: 'dry-fruits',
    image_url: 'https://images.unsplash.com/photo-1596273312170-8ecb855913e5',
    rating: 4.7,
    review_count: 56,
  },
  {
    name: 'Medjool Dates',
    slug: 'medjool-dates',
    description: 'Premium Medjool dates known for their sweetness and soft texture.',
    price: 11.99,
    stock_quantity: 90,
    is_featured: true,
    is_bestseller: false,
    is_organic: true,
    category_slug: 'dry-fruits',
    image_url: 'https://images.unsplash.com/photo-1601897655071-982a0f079b5d',
    rating: 4.8,
    review_count: 63,
  },
  {
    name: 'Organic Chia Seeds',
    slug: 'organic-chia-seeds',
    description: 'Nutrient-dense chia seeds rich in omega-3 fatty acids and fiber.',
    price: 7.99,
    stock_quantity: 110,
    is_featured: false,
    is_bestseller: true,
    is_organic: true,
    category_slug: 'nuts-seeds',
    image_url: 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55',
    rating: 4.6,
    review_count: 42,
  },
  {
    name: 'Cinnamon Sticks',
    slug: 'cinnamon-sticks',
    description: 'Premium quality cinnamon sticks with intense aroma and flavor.',
    price: 6.99,
    stock_quantity: 75,
    is_featured: false,
    is_bestseller: false,
    is_organic: false,
    category_slug: 'spices',
    image_url: 'https://images.unsplash.com/photo-1588514912908-8f673c1a8ed3',
    rating: 4.3,
    review_count: 31,
  },
  {
    name: 'Organic Goji Berries',
    slug: 'organic-goji-berries',
    description: 'Antioxidant-rich goji berries known for their numerous health benefits.',
    price: 13.99,
    stock_quantity: 65,
    is_featured: true,
    is_bestseller: false,
    is_organic: true,
    category_slug: 'superfoods',
    image_url: 'https://images.unsplash.com/photo-1606923829579-0cb981a83e2e',
    rating: 4.4,
    review_count: 38,
  },
  {
    name: 'Raw Cashews',
    slug: 'raw-cashews',
    description: 'Creamy and delicious raw cashews, perfect for snacking or making cashew milk.',
    price: 15.99,
    stock_quantity: 85,
    is_featured: true,
    is_bestseller: true,
    is_organic: false,
    category_slug: 'nuts-seeds',
    image_url: 'https://images.unsplash.com/photo-1563412885-e335dc95c512',
    rating: 4.7,
    review_count: 52,
  },
  {
    name: 'Black Peppercorns',
    slug: 'black-peppercorns',
    description: 'Aromatic black peppercorns for adding depth and heat to your dishes.',
    price: 5.99,
    stock_quantity: 95,
    is_featured: false,
    is_bestseller: false,
    is_organic: false,
    category_slug: 'spices',
    image_url: 'https://images.unsplash.com/photo-1599690925058-90e1a0b56154',
    rating: 4.2,
    review_count: 27,
  },
  {
    name: 'Alfalfa Sprouts',
    slug: 'alfalfa-sprouts',
    description: 'Fresh and crisp alfalfa sprouts, perfect for salads and sandwiches.',
    price: 4.99,
    stock_quantity: 40,
    is_featured: false,
    is_bestseller: false,
    is_organic: true,
    category_slug: 'sprouts',
    image_url: 'https://images.unsplash.com/photo-1550828484-59a4a505a010',
    rating: 4.1,
    review_count: 19,
  },
  {
    name: 'Organic Flaxseeds',
    slug: 'organic-flaxseeds',
    description: 'Nutrient-rich flaxseeds high in omega-3 fatty acids and fiber.',
    price: 6.49,
    stock_quantity: 70,
    is_featured: false,
    is_bestseller: true,
    is_organic: true,
    category_slug: 'nuts-seeds',
    image_url: 'https://images.unsplash.com/photo-1595856619767-ab05aaa0e0ab',
    rating: 4.5,
    review_count: 33,
  },
  {
    name: 'Dried Cranberries',
    slug: 'dried-cranberries',
    description: 'Tangy and sweet dried cranberries, perfect for snacking or adding to salads.',
    price: 8.49,
    stock_quantity: 110,
    is_featured: false,
    is_bestseller: false,
    is_organic: false,
    category_slug: 'dry-fruits',
    image_url: 'https://images.unsplash.com/photo-1597733153203-a54d0fbc47de',
    rating: 4.3,
    review_count: 29,
  },
  {
    name: 'Spirulina Powder',
    slug: 'spirulina-powder',
    description: 'Nutrient-dense blue-green algae powder packed with protein and vitamins.',
    price: 19.99,
    stock_quantity: 45,
    is_featured: false,
    is_bestseller: false,
    is_organic: true,
    category_slug: 'superfoods',
    image_url: 'https://images.unsplash.com/photo-1622480916113-9000ac49b79d',
    rating: 4.0,
    review_count: 22,
  },
  {
    name: 'Mung Bean Sprouts',
    slug: 'mung-bean-sprouts',
    description: 'Crunchy mung bean sprouts rich in protein and vitamins.',
    price: 3.99,
    stock_quantity: 35,
    is_featured: false,
    is_bestseller: false,
    is_organic: true,
    category_slug: 'sprouts',
    image_url: 'https://images.unsplash.com/photo-1576486599420-194316d45840',
    rating: 4.2,
    review_count: 18,
  },
];

const giftBoxes = [
  {
    name: 'Gourmet Delight Box',
    description: 'A carefully curated selection of our finest dry fruits and spices, perfect for gifting.',
    base_price: 49.99,
    image_url: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716',
    is_customizable: true,
  },
  {
    name: 'Wellness Package',
    description: 'Organic superfoods and sprouts for health-conscious individuals.',
    base_price: 59.99,
    image_url: 'https://images.unsplash.com/photo-1601493700518-42b241a914d2',
    is_customizable: true,
  },
  {
    name: 'Corporate Gift Hamper',
    description: 'Premium selection for corporate gifting with customizable branding options.',
    base_price: 99.99,
    image_url: 'https://images.unsplash.com/photo-1600348759200-5b94753c5a4e',
    is_customizable: true,
  },
  {
    name: 'Festive Celebration Box',
    description: 'A luxurious assortment of premium nuts and dried fruits for special occasions.',
    base_price: 79.99,
    image_url: 'https://images.unsplash.com/photo-1607920592519-bab2a4e0d362',
    is_customizable: true,
  },
  {
    name: 'Healthy Snack Box',
    description: 'A variety of nutritious snacks perfect for the health-conscious individual.',
    base_price: 39.99,
    image_url: 'https://images.unsplash.com/photo-1606923829579-0cb981a83e2e',
    is_customizable: true,
  },
  {
    name: 'Spice Explorer Collection',
    description: 'A curated selection of exotic spices from around the world.',
    base_price: 45.99,
    image_url: 'https://images.unsplash.com/photo-1588514912908-8f673c1a8ed3',
    is_customizable: true,
  },
];

// Function to create tables
async function createTables() {
  console.log('Creating tables...');

  try {
    // Create categories table
    console.log('Creating categories table...');
    const { error: categoriesError } = await supabase
      .from('categories')
      .insert(categories)
      .select();

    if (categoriesError) {
      if (categoriesError.code === '42P01') { // Table doesn't exist
        console.log('Categories table does not exist, creating it...');

        // Create the table using REST API
        const { error } = await supabase
          .from('categories')
          .insert({
            name: 'Temporary',
            slug: 'temp',
            description: 'Temporary category'
          });

        if (error && error.code === '42P01') {
          console.log('Cannot create table through REST API, please create tables manually in Supabase dashboard');
          console.log('Instructions:');
          console.log('1. Go to your Supabase dashboard');
          console.log('2. Navigate to the SQL Editor');
          console.log('3. Run the following SQL:');
          console.log(`
            CREATE TABLE categories (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              name VARCHAR(255) NOT NULL,
              slug VARCHAR(255) NOT NULL UNIQUE,
              description TEXT,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );

            CREATE TABLE products (
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

            CREATE TABLE gift_boxes (
              id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              name VARCHAR(255) NOT NULL,
              description TEXT,
              base_price DECIMAL(10, 2) NOT NULL,
              image_url TEXT,
              is_customizable BOOLEAN DEFAULT TRUE,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
              updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
          `);
          return false;
        }
      } else {
        console.error('Error checking categories table:', categoriesError);
        return false;
      }
    } else {
      console.log('Categories table exists');
    }

    // Check products table
    console.log('Checking products table...');
    const { error: productsError } = await supabase
      .from('products')
      .select('count(*)', { count: 'exact', head: true });

    if (productsError) {
      console.error('Error checking products table:', productsError);
      return false;
    } else {
      console.log('Products table exists');
    }

    // Check gift_boxes table
    console.log('Checking gift_boxes table...');
    const { error: giftBoxesError } = await supabase
      .from('gift_boxes')
      .select('count(*)', { count: 'exact', head: true });

    if (giftBoxesError) {
      console.error('Error checking gift_boxes table:', giftBoxesError);
      return false;
    } else {
      console.log('Gift boxes table exists');
    }

    console.log('All tables verified successfully');
    return true;
  } catch (error) {
    console.error('Error verifying tables:', error);
    return false;
  }
}

// Function to populate the database
async function populateDatabase() {
  console.log('Populating database...');

  try {
    // Insert categories
    console.log('Inserting categories...');
    const { error: categoriesError } = await supabase
      .from('categories')
      .upsert(categories, { onConflict: 'slug' });

    if (categoriesError) {
      console.error('Error inserting categories:', categoriesError);
      return false;
    }
    console.log('Categories inserted successfully');

    // Get all categories to map slugs to IDs
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('id, slug');

    if (categoryError) {
      console.error('Error fetching categories:', categoryError);
      return false;
    }

    const categoryMap = {};
    categoryData.forEach(cat => {
      categoryMap[cat.slug] = cat.id;
    });

    // Insert products
    console.log('Inserting products...');
    const productsWithCategoryIds = products.map(product => {
      const categoryId = categoryMap[product.category_slug];
      if (!categoryId) {
        console.warn(`Category with slug ${product.category_slug} not found for product ${product.name}`);
        return null;
      }

      // Create a new object without the category_slug property
      const { category_slug, ...productWithoutSlug } = product;
      return {
        ...productWithoutSlug,
        category_id: categoryId
      };
    }).filter(Boolean); // Remove null entries

    if (productsWithCategoryIds.length > 0) {
      const { error: productsError } = await supabase
        .from('products')
        .upsert(productsWithCategoryIds, { onConflict: 'slug' });

      if (productsError) {
        console.error('Error inserting products:', productsError);
        return false;
      }
    } else {
      console.warn('No products to insert - all categories may be missing');
    }
    console.log('Products inserted successfully');

    // Insert gift boxes
    console.log('Inserting gift boxes...');
    const { error: giftBoxesError } = await supabase
      .from('gift_boxes')
      .upsert(giftBoxes, { onConflict: 'name' });

    if (giftBoxesError) {
      console.error('Error inserting gift boxes:', giftBoxesError);
      return false;
    }
    console.log('Gift boxes inserted successfully');

    console.log('Database population completed successfully');
    return true;
  } catch (error) {
    console.error('Error populating database:', error);
    return false;
  }
}

// Main function
async function main() {
  console.log('Starting database setup...');

  // Create tables
  const tablesCreated = await createTables();
  if (!tablesCreated) {
    console.error('Failed to create tables. Exiting...');
    process.exit(1);
  }

  // Populate database
  const databasePopulated = await populateDatabase();
  if (!databasePopulated) {
    console.error('Failed to populate database. Exiting...');
    process.exit(1);
  }

  console.log('Database setup completed successfully!');
  process.exit(0);
}

// Run the main function
main();
