/**
 * Very Simple Database Verification Script
 * 
 * This script tests the connection to the Supabase database and performs
 * a simple query to verify that the database is working.
 * 
 * Usage:
 * 1. Make sure you have the Supabase URL and key in your .env.local file
 * 2. Run: node scripts/verify-database.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase URL or key not found in environment variables');
  console.log('Make sure you have a .env.local file with the following variables:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=your_supabase_url');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key');
  process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseKey.substring(0, 5) + '...');

const supabase = createClient(supabaseUrl, supabaseKey);

// Test database connection
async function verifyDatabase() {
  console.log('\nVerifying database connection...');
  
  try {
    // Simple query to check if the database is accessible
    const { data, error } = await supabase.from('categories').select('count').limit(1);
    
    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }
    
    console.log('\n✅ Database connection successful!');
    console.log('\nYou can now run the SQL script to set up all tables:');
    console.log('1. Go to the Supabase dashboard');
    console.log('2. Navigate to the SQL Editor');
    console.log('3. Copy and paste the content of simple_database_setup.sql');
    console.log('4. Run the query');
    
  } catch (error) {
    console.error('\n❌ Database connection failed:', error.message);
    console.log('\nPlease check your Supabase credentials and try again.');
  }
}

// Run the verification
verifyDatabase();
