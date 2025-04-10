-- Add coupon_code column to orders table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'orders'
        AND column_name = 'coupon_code'
    ) THEN
        ALTER TABLE orders ADD COLUMN coupon_code VARCHAR(50);
    END IF;
END $$;
