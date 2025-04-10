# Setting Up the Global Gourmet Database

This guide will help you set up the database for the Global Gourmet e-commerce website.

## Prerequisites

- A Supabase account and project
- Access to the Supabase SQL Editor

## Setup Instructions

1. **Go to your Supabase dashboard**
   - Log in to your Supabase account
   - Select your project

2. **Navigate to the SQL Editor**
   - Click on "SQL Editor" in the left sidebar

3. **Run the SQL script**
   - Copy the contents of the `supabase/simple-setup.sql` file
   - Paste it into the SQL Editor
   - Click "Run" to execute the script
   - If you encounter any errors, try running each section separately (table creation, then category insertion, then product insertion, etc.)

The script will:
- Create the necessary tables (categories, products, gift_boxes)
- Insert sample data into these tables

## Verifying the Setup

After running the script, you can verify that the tables were created and populated:

1. **Check the tables**
   - Go to the "Table Editor" in the left sidebar
   - You should see the following tables:
     - categories
     - products
     - gift_boxes

2. **Check the data**
   - Click on each table to view its contents
   - Verify that sample data has been inserted

## Troubleshooting

If you encounter any issues:

1. **Check for error messages**
   - The SQL Editor will display error messages if there are any issues with the script

2. **Check table permissions**
   - Go to "Authentication" > "Policies" in the left sidebar
   - Ensure that the tables have the appropriate read permissions

3. **Check the API keys**
   - Go to "Project Settings" > "API" in the left sidebar
   - Verify that the API keys in your `.env.local` file match the ones in your Supabase project

## Manual Setup

If you prefer to set up the database manually, you can create the tables and insert the data using the Supabase interface:

1. **Create the tables**
   - Go to the "Table Editor" in the left sidebar
   - Click "Create a new table" for each table (categories, products, gift_boxes)
   - Add the columns as specified in the `supabase/setup.sql` file

2. **Insert the data**
   - Click on each table
   - Click "Insert row" to add sample data

## Next Steps

Once the database is set up, you can:

1. **Start the development server**
   ```
   npm run dev
   ```

2. **Access the website**
   - Open your browser and go to `http://localhost:3000`
   - You should see the Global Gourmet website with data from your Supabase database
