/**
 * Database Connection Test Script
 * 
 * This script tests the connection to the Supabase database and performs
 * basic CRUD operations to verify that everything is working correctly.
 * 
 * Usage:
 * 1. Make sure you have the Supabase URL and key in your .env.local file
 * 2. Run: node scripts/test-database-connection.js
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
    
    // Test 2: Fetch products with their categories
    console.log('\n=== Test 2: Fetch Products with Categories ===');
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select(`
        id,
        name,
        price,
        categories:category_id (
          name
        )
      `)
      .limit(5);
    
    if (productsError) {
      throw new Error(`Error fetching products: ${productsError.message}`);
    }
    
    console.log(`Successfully fetched ${products.length} products:`);
    products.forEach(product => {
      console.log(`- ${product.name} ($${product.price}) - Category: ${product.categories?.name || 'None'}`);
    });
    
    // Test 3: Create a test product
    console.log('\n=== Test 3: Create Test Product ===');
    const testProduct = {
      name: `Test Product ${Date.now()}`,
      slug: `test-product-${Date.now()}`,
      description: 'This is a test product created by the database connection test script',
      price: 99.99,
      stock_quantity: 999,
      category_id: categories[0]?.id
    };
    
    const { data: newProduct, error: newProductError } = await supabase
      .from('products')
      .insert(testProduct)
      .select()
      .single();
    
    if (newProductError) {
      throw new Error(`Error creating test product: ${newProductError.message}`);
    }
    
    console.log('Successfully created test product:');
    console.log(newProduct);
    
    // Test 4: Update the test product
    console.log('\n=== Test 4: Update Test Product ===');
    const { data: updatedProduct, error: updateError } = await supabase
      .from('products')
      .update({ price: 89.99, stock_quantity: 888 })
      .eq('id', newProduct.id)
      .select()
      .single();
    
    if (updateError) {
      throw new Error(`Error updating test product: ${updateError.message}`);
    }
    
    console.log('Successfully updated test product:');
    console.log(`- Price: $${newProduct.price} -> $${updatedProduct.price}`);
    console.log(`- Stock: ${newProduct.stock_quantity} -> ${updatedProduct.stock_quantity}`);
    
    // Test 5: Delete the test product
    console.log('\n=== Test 5: Delete Test Product ===');
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .eq('id', newProduct.id);
    
    if (deleteError) {
      throw new Error(`Error deleting test product: ${deleteError.message}`);
    }
    
    console.log(`Successfully deleted test product with ID: ${newProduct.id}`);
    
    // Test 6: Test coupon validation function
    console.log('\n=== Test 6: Test Coupon Validation Function ===');
    const { data: couponResult, error: couponError } = await supabase
      .rpc('validate_coupon', {
        coupon_code: 'WELCOME10',
        order_amount: 100
      });
    
    if (couponError) {
      throw new Error(`Error validating coupon: ${couponError.message}`);
    }
    
    console.log('Coupon validation result:');
    console.log(couponResult);
    
    // Test 7: Fetch gift boxes with their items
    console.log('\n=== Test 7: Fetch Gift Boxes with Items ===');
    const { data: giftBoxes, error: giftBoxesError } = await supabase
      .from('gift_boxes')
      .select('*')
      .limit(2);
    
    if (giftBoxesError) {
      throw new Error(`Error fetching gift boxes: ${giftBoxesError.message}`);
    }
    
    if (giftBoxes.length > 0) {
      console.log(`Successfully fetched ${giftBoxes.length} gift boxes:`);
      
      for (const giftBox of giftBoxes) {
        console.log(`- ${giftBox.name} ($${giftBox.base_price})`);
        
        // Fetch items for this gift box
        const { data: giftBoxItems, error: giftBoxItemsError } = await supabase
          .from('gift_box_items')
          .select(`
            quantity,
            products:product_id (
              name,
              price
            )
          `)
          .eq('gift_box_id', giftBox.id);
        
        if (giftBoxItemsError) {
          console.warn(`  Warning: Could not fetch items for gift box: ${giftBoxItemsError.message}`);
        } else if (giftBoxItems.length === 0) {
          console.log('  No items found for this gift box');
        } else {
          console.log('  Items:');
          giftBoxItems.forEach(item => {
            console.log(`  - ${item.quantity}x ${item.products?.name} ($${item.products?.price})`);
          });
        }
      }
    } else {
      console.log('No gift boxes found');
    }
    
    console.log('\n=== All Tests Passed ===');
    console.log('Database connection and operations are working correctly!');
    
  } catch (error) {
    console.error('Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
testDatabaseConnection();
