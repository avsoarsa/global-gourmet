/**
 * Simple Database Connection Test Script
 * 
 * This script tests the connection to the Supabase database and performs
 * basic read operations to verify that everything is working correctly.
 * 
 * Usage:
 * 1. Make sure you have the Supabase URL and key in your .env.local file
 * 2. Run: node scripts/simple-test.js
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

// Test database connection and operations
async function testDatabaseConnection() {
  console.log('Testing database connection...');
  
  try {
    // Test 1: Fetch categories
    console.log('\n=== Test 1: Fetch Categories ===');
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .limit(5);
    
    if (categoriesError) {
      throw new Error(`Error fetching categories: ${categoriesError.message}`);
    }
    
    console.log(`Successfully fetched ${categories.length} categories:`);
    categories.forEach(category => {
      console.log(`- ${category.name} (${category.slug})`);
    });
    
    // Test 2: Fetch products
    console.log('\n=== Test 2: Fetch Products ===');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(5);
    
    if (productsError) {
      throw new Error(`Error fetching products: ${productsError.message}`);
    }
    
    console.log(`Successfully fetched ${products.length} products:`);
    products.forEach(product => {
      console.log(`- ${product.name} ($${product.price})`);
    });
    
    // Test 3: Fetch gift boxes
    console.log('\n=== Test 3: Fetch Gift Boxes ===');
    const { data: giftBoxes, error: giftBoxesError } = await supabase
      .from('gift_boxes')
      .select('*')
      .limit(5);
    
    if (giftBoxesError) {
      throw new Error(`Error fetching gift boxes: ${giftBoxesError.message}`);
    }
    
    console.log(`Successfully fetched ${giftBoxes.length} gift boxes:`);
    giftBoxes.forEach(giftBox => {
      console.log(`- ${giftBox.name} ($${giftBox.base_price})`);
    });
    
    // Test 4: Fetch coupons
    console.log('\n=== Test 4: Fetch Coupons ===');
    const { data: coupons, error: couponsError } = await supabase
      .from('coupons')
      .select('*')
      .limit(5);
    
    if (couponsError) {
      throw new Error(`Error fetching coupons: ${couponsError.message}`);
    }
    
    console.log(`Successfully fetched ${coupons.length} coupons:`);
    coupons.forEach(coupon => {
      console.log(`- ${coupon.code} (${coupon.discount_type}: ${coupon.discount_value})`);
    });
    
    console.log('\n=== All Tests Passed ===');
    console.log('Database connection and read operations are working correctly!');
    
  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testDatabaseConnection();
