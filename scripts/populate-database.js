/**
 * Database Population Script
 * 
 * This script populates the Supabase database with sample data for the Global Gourmet e-commerce platform.
 * 
 * Usage:
 * 1. Make sure you have the Supabase CLI installed
 * 2. Run: node scripts/populate-database.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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

// Function to populate the database
async function populateDatabase() {
  console.log('Starting database population...');

  try {
    // Insert categories
    console.log('Inserting categories...');
    for (const category of categories) {
      const { error } = await supabase.from('categories').insert(category);
      if (error) throw error;
    }
    console.log('Categories inserted successfully');

    // Insert products
    console.log('Inserting products...');
    for (const product of products) {
      // Get category ID
      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', product.category_slug)
        .single();

      if (categoryError) throw categoryError;

      const { error } = await supabase.from('products').insert({
        ...product,
        category_id: categoryData.id,
        category_slug: undefined, // Remove this field as it's not in the products table
      });

      if (error) throw error;
    }
    console.log('Products inserted successfully');

    // Insert gift boxes
    console.log('Inserting gift boxes...');
    for (const giftBox of giftBoxes) {
      const { error } = await supabase.from('gift_boxes').insert(giftBox);
      if (error) throw error;
    }
    console.log('Gift boxes inserted successfully');

    console.log('Database population completed successfully');
  } catch (error) {
    console.error('Error populating database:', error);
  }
}

// Run the population script
populateDatabase();
