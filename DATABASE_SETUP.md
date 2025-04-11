# Database Setup Guide for Global Gourmet

This guide provides instructions for setting up the database for the Global Gourmet e-commerce website.

## Prerequisites

- Supabase account and project
- Access to the Supabase SQL Editor or CLI

## SQL Files

The database setup is divided into several SQL files:

1. `auth_setup.sql` - Sets up authentication tables and functions
2. `order_tracking_tables_fixed.sql` - Creates tables for order tracking
3. `inventory_functions.sql` - Sets up inventory management
4. `tax_functions.sql` - Creates tax calculation functions and tables

## Running the SQL Files

### Option 1: Using the Script (Recommended)

We've provided a script that will help you run the SQL files in the correct order:

```bash
# Make the script executable
chmod +x scripts/run-database-setup.sh

# Run the script
./scripts/run-database-setup.sh
```

Note: You may need to edit the script to provide your Supabase URL and API key.

### Option 2: Manual Execution

If you prefer to run the SQL files manually, follow these steps:

1. Go to the Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of each SQL file in the following order:
   - `database/auth_setup.sql`
   - `database/order_tracking_tables_fixed.sql`
   - `database/inventory_functions.sql`
   - `database/tax_functions.sql`
4. Execute each script and check for errors

## Troubleshooting Common Errors

### Policy Already Exists Error

If you encounter an error like:

```
ERROR: 42710: policy "tax_rates_select_policy" for table "tax_rates" already exists
```

This means you're trying to create a policy that already exists. The updated SQL files include `DROP POLICY IF EXISTS` statements to handle this, but if you're still seeing the error, you can manually drop the policy before creating it:

```sql
-- Drop the existing policy
DROP POLICY IF EXISTS tax_rates_select_policy ON tax_rates;

-- Then create the policy
CREATE POLICY tax_rates_select_policy ON tax_rates
  FOR SELECT USING (TRUE);
```

### Table Does Not Exist Error

If you see an error like:

```
ERROR: 42P01: relation "tax_rates" does not exist
```

This means you're trying to reference a table that hasn't been created yet. Make sure you run the SQL files in the correct order as specified above.

### Column Does Not Exist Error

If you encounter an error like:

```
ERROR: 42703: column "is_admin" does not exist
```

This means you're referencing a column that doesn't exist in the table. We've fixed this in the `order_tracking_tables_fixed.sql` file by removing references to the `is_admin` column.

## India GST Support

The tax calculation system now includes support for India's Goods and Services Tax (GST) system:

- CGST (Central GST) - 9% standard rate
- SGST (State GST) - 9% standard rate
- IGST (Integrated GST) - 18% standard rate for interstate transactions

Category-specific GST rates are also supported:
- 5% for essential items
- 12% for certain goods
- 18% standard rate for most goods
- 28% for luxury items

## Verifying the Setup

After running all the SQL files, you can verify the setup by running the following queries:

```sql
-- Check if tax rates were created
SELECT * FROM tax_rates LIMIT 10;

-- Check if India GST rates were added
SELECT * FROM tax_rates WHERE country = 'IN' LIMIT 10;

-- Test the tax calculation function for US
SELECT calculate_tax('US', 'CA', 'Los Angeles', '90001', 100.00);

-- Test the tax calculation function for India
SELECT calculate_tax('IN', 'MH', 'Mumbai', '400001', 100.00);
```

## Next Steps

After setting up the database, you should:

1. Create a test user using the provided script: `node scripts/create-test-user.js`
2. Add some test products to the database
3. Test the checkout process to ensure tax calculation and inventory management work correctly
