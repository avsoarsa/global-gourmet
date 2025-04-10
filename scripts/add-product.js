/**
 * Script to add a new product to the database
 * 
 * Usage:
 * node scripts/add-product.js
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

async function addProduct() {
  try {
    // First, get the category ID for 'dry-fruits'
    const { data: categoryData, error: categoryError } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', 'dry-fruits')
      .single();

    if (categoryError) {
      console.error('Error fetching category:', categoryError);
      return;
    }

    if (!categoryData) {
      console.error('Category "dry-fruits" not found');
      return;
    }

    const categoryId = categoryData.id;

    // Now insert the new product
    const { data, error } = await supabase
      .from('products')
      .insert({
        name: 'Dried Apricots',
        slug: 'dried-apricots',
        description: 'Sweet and tangy dried apricots',
        price: 9.99,
        sale_price: null,
        stock_quantity: 120,
        is_featured: false,
        is_bestseller: true,
        is_organic: false,
        category_id: categoryId,
        image_url: '/images/products/apricots.jpg'
      })
      .select();

    if (error) {
      console.error('Error adding product:', error);
      return;
    }

    console.log('Product added successfully:', data);
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

addProduct();
