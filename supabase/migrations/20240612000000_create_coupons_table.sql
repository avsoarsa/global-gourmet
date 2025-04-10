-- Create coupons table
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT NOT NULL UNIQUE,
    description TEXT,
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value DECIMAL(10, 2) NOT NULL CHECK (discount_value > 0),
    minimum_order_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    usage_limit INTEGER,
    usage_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create RLS policies for coupons table
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Policy for admins (full access)
CREATE POLICY admin_coupons_policy ON public.coupons
    USING (auth.jwt() ->> 'role' = 'admin')
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Policy for users (read-only access to active coupons)
CREATE POLICY user_coupons_policy ON public.coupons
    FOR SELECT
    USING (
        is_active = true AND
        (start_date IS NULL OR start_date <= now()) AND
        (end_date IS NULL OR end_date >= now()) AND
        (usage_limit IS NULL OR usage_count < usage_limit)
    );

-- Create function to validate coupon
CREATE OR REPLACE FUNCTION public.validate_coupon(
    coupon_code TEXT,
    order_amount DECIMAL
) RETURNS JSONB AS $$
DECLARE
    coupon_record RECORD;
    result JSONB;
BEGIN
    -- Find the coupon
    SELECT * INTO coupon_record FROM public.coupons
    WHERE 
        code = coupon_code
        AND is_active = true
        AND (start_date IS NULL OR start_date <= now())
        AND (end_date IS NULL OR end_date >= now())
        AND (usage_limit IS NULL OR usage_count < usage_limit);
    
    -- Check if coupon exists
    IF coupon_record IS NULL THEN
        RETURN jsonb_build_object(
            'valid', false,
            'message', 'Invalid or expired coupon code'
        );
    END IF;
    
    -- Check minimum order amount
    IF order_amount < coupon_record.minimum_order_amount THEN
        RETURN jsonb_build_object(
            'valid', false,
            'message', format('Minimum order amount of $%s required', coupon_record.minimum_order_amount)
        );
    END IF;
    
    -- Calculate discount amount
    DECLARE
        discount_amount DECIMAL;
    BEGIN
        IF coupon_record.discount_type = 'percentage' THEN
            discount_amount := (order_amount * coupon_record.discount_value / 100);
        ELSE
            discount_amount := coupon_record.discount_value;
            -- Ensure discount doesn't exceed order amount
            IF discount_amount > order_amount THEN
                discount_amount := order_amount;
            END IF;
        END IF;
        
        -- Return valid coupon with details
        RETURN jsonb_build_object(
            'valid', true,
            'code', coupon_record.code,
            'discount_type', coupon_record.discount_type,
            'discount_value', coupon_record.discount_value,
            'discount_amount', discount_amount,
            'id', coupon_record.id
        );
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to apply coupon to order
CREATE OR REPLACE FUNCTION public.apply_coupon_to_order(
    order_id UUID,
    coupon_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    coupon_record RECORD;
    order_record RECORD;
    discount_amount DECIMAL;
BEGIN
    -- Get the coupon
    SELECT * INTO coupon_record FROM public.coupons
    WHERE id = coupon_id AND is_active = true;
    
    -- Check if coupon exists
    IF coupon_record IS NULL THEN
        RETURN false;
    END IF;
    
    -- Get the order
    SELECT * INTO order_record FROM public.orders
    WHERE id = order_id;
    
    -- Check if order exists
    IF order_record IS NULL THEN
        RETURN false;
    END IF;
    
    -- Calculate discount amount
    IF coupon_record.discount_type = 'percentage' THEN
        discount_amount := (order_record.subtotal * coupon_record.discount_value / 100);
    ELSE
        discount_amount := coupon_record.discount_value;
        -- Ensure discount doesn't exceed order subtotal
        IF discount_amount > order_record.subtotal THEN
            discount_amount := order_record.subtotal;
        END IF;
    END IF;
    
    -- Update the order with the discount
    UPDATE public.orders
    SET 
        coupon_id = coupon_record.id,
        discount_amount = discount_amount,
        total_amount = order_record.subtotal - discount_amount + order_record.tax_amount + order_record.shipping_amount
    WHERE id = order_id;
    
    -- Increment the coupon usage count
    UPDATE public.coupons
    SET usage_count = usage_count + 1
    WHERE id = coupon_id;
    
    RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add coupon_id and discount_amount columns to orders table if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'coupon_id') THEN
        ALTER TABLE public.orders ADD COLUMN coupon_id UUID REFERENCES public.coupons(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'discount_amount') THEN
        ALTER TABLE public.orders ADD COLUMN discount_amount DECIMAL(10, 2) NOT NULL DEFAULT 0;
    END IF;
END $$;
