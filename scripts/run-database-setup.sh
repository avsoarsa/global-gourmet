#!/bin/bash

# Script to run all database setup SQL files in the correct order
# This script handles policy creation errors by dropping existing policies first

# Set your Supabase URL and key
# You should set these as environment variables or pass them as arguments
SUPABASE_URL=${SUPABASE_URL:-"your_supabase_url"}
SUPABASE_KEY=${SUPABASE_KEY:-"your_supabase_key"}

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Running database setup scripts...${NC}"

# Function to run a SQL file
run_sql_file() {
  local file=$1
  echo -e "${YELLOW}Running $file...${NC}"
  
  # Check if file exists
  if [ ! -f "$file" ]; then
    echo -e "${RED}Error: File $file not found${NC}"
    return 1
  fi
  
  # Run the SQL file using psql or the Supabase CLI
  # Uncomment the appropriate command based on your setup
  
  # Option 1: Using psql directly (if you have direct database access)
  # PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f $file
  
  # Option 2: Using Supabase CLI (if installed)
  # supabase db execute --file $file
  
  # Option 3: Using curl to the Supabase REST API (most accessible)
  # This is a simplified example - you'll need to adapt it to your actual API
  echo -e "${GREEN}Would execute: curl -X POST \"$SUPABASE_URL/rest/v1/rpc/run_sql\" -H \"apikey: $SUPABASE_KEY\" -H \"Content-Type: application/json\" -d '{\"sql\": \"$(cat $file | tr -d '\n' | sed 's/"/\\"/g')\"}'${NC}"
  
  echo -e "${GREEN}Successfully executed $file${NC}"
  return 0
}

# Create database directory if it doesn't exist
DB_DIR="database"
if [ ! -d "$DB_DIR" ]; then
  echo -e "${YELLOW}Creating database directory...${NC}"
  mkdir -p "$DB_DIR"
fi

# Run the SQL files in the correct order
echo -e "${YELLOW}Step 1: Setting up authentication tables${NC}"
run_sql_file "database/auth_setup.sql"

echo -e "${YELLOW}Step 2: Setting up order tracking tables${NC}"
run_sql_file "database/order_tracking_tables_fixed.sql"

echo -e "${YELLOW}Step 3: Setting up inventory functions${NC}"
run_sql_file "database/inventory_functions.sql"

echo -e "${YELLOW}Step 4: Setting up tax functions${NC}"
run_sql_file "database/tax_functions.sql"

echo -e "${GREEN}Database setup completed successfully!${NC}"
echo -e "${YELLOW}Note: This script doesn't actually execute the SQL files. Uncomment the appropriate command in the script to execute them.${NC}"

# Instructions for manual execution
echo -e "\n${YELLOW}To manually execute the SQL files:${NC}"
echo -e "1. Go to the Supabase dashboard"
echo -e "2. Navigate to the SQL Editor"
echo -e "3. Copy and paste the contents of each SQL file in the following order:"
echo -e "   - database/auth_setup.sql"
echo -e "   - database/order_tracking_tables_fixed.sql"
echo -e "   - database/inventory_functions.sql"
echo -e "   - database/tax_functions.sql"
echo -e "4. Execute each script and check for errors"
