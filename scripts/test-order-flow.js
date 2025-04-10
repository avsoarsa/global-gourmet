/**
 * Test script for the order creation and email sending flow
 * 
 * This script simulates the order creation process and tests the email sending functionality
 * 
 * Usage:
 * node scripts/test-order-flow.js
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

// Simulate email sending
const sendEmail = async (to, subject, htmlContent) => {
  console.log(`\n=== SIMULATED EMAIL ===`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Content: ${htmlContent.substring(0, 100)}...`);
  console.log(`=== END EMAIL ===\n`);
  return true;
};

// Create a test order
const createTestOrder = async () => {
  try {
    console.log('Starting test order creation...');
    
    // 1. Get a test user
    const { data: users, error: userError } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1);
    
    if (userError || !users || users.length === 0) {
      console.error('Error fetching test user:', userError || 'No users found');
      return;
    }
    
    const userId = users[0].id;
    console.log(`Using test user ID: ${userId}`);
    
    // 2. Get some test products
    const { data: products, error: productError } = await supabase
      .from('products')
      .select('id, name, price')
      .limit(3);
    
    if (productError || !products || products.length === 0) {
      console.error('Error fetching test products:', productError || 'No products found');
      return;
    }
    
    console.log(`Found ${products.length} test products`);
    
    // 3. Create an order
    const subtotal = products.reduce((sum, product) => sum + product.price, 0);
    const tax = subtotal * 0.1;
    const total = subtotal + tax;
    
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        subtotal: subtotal,
        discount_amount: 0,
        tax_amount: tax,
        shipping_amount: 0,
        total_amount: total,
        shipping_address: '123 Test Street',
        shipping_city: 'Test City',
        shipping_state: 'Test State',
        shipping_postal_code: '12345',
        shipping_country: 'Test Country',
        payment_method: 'credit-card',
        status: 'pending',
        payment_status: 'paid'
      })
      .select()
      .single();
    
    if (orderError || !order) {
      console.error('Error creating test order:', orderError || 'No order returned');
      return;
    }
    
    console.log(`Created test order with ID: ${order.id}`);
    
    // 4. Add order items
    const orderItems = products.map(product => ({
      order_id: order.id,
      product_id: product.id,
      quantity: 1,
      price: product.price
    }));
    
    const { data: items, error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)
      .select();
    
    if (itemsError || !items) {
      console.error('Error creating order items:', itemsError || 'No items returned');
      return;
    }
    
    console.log(`Added ${items.length} items to the order`);
    
    // 5. Simulate sending an order confirmation email
    const { data: user, error: userDataError } = await supabase.auth.admin.getUserById(userId);
    
    if (userDataError || !user) {
      console.log('Error fetching user data for email:', userDataError || 'No user returned');
      // Continue anyway for testing
    }
    
    const email = user?.email || 'test@example.com';
    const customerName = 'Test Customer';
    
    // Create a simple HTML email
    const emailSubject = `Order Confirmation #${order.id.substring(0, 8).toUpperCase()}`;
    const emailContent = `
      <!DOCTYPE html>
      <html>
      <body>
        <h1>Order Confirmation</h1>
        <p>Dear ${customerName},</p>
        <p>Thank you for your order! We're pleased to confirm that we've received your order and it's being processed.</p>
        <p><strong>Order Number:</strong> ${order.id.substring(0, 8).toUpperCase()}</p>
        <p><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
        <p><strong>Total:</strong> $${order.total_amount.toFixed(2)}</p>
        <p>Thank you for shopping with Global Gourmet!</p>
      </body>
      </html>
    `;
    
    await sendEmail(email, emailSubject, emailContent);
    
    console.log('Test completed successfully!');
    
  } catch (error) {
    console.error('Unexpected error during test:', error);
  }
};

// Run the test
createTestOrder();
