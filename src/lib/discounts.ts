/**
 * Discount code service
 * 
 * This module provides discount code functionality for the checkout process.
 */

import { supabase } from './supabase';

// Types for discount codes
export interface DiscountCode {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  minimum_order_amount: number;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  usage_limit: number | null;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface DiscountValidationResult {
  valid: boolean;
  discount?: DiscountCode;
  discountAmount: number;
  message?: string;
}

/**
 * Validates a discount code
 * 
 * @param code The discount code to validate
 * @param subtotal The order subtotal
 * @returns Discount validation result
 */
export async function validateDiscountCode(
  code: string,
  subtotal: number
): Promise<DiscountValidationResult> {
  try {
    // Normalize code
    const normalizedCode = code.trim().toUpperCase();
    
    // Fetch discount code from database
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', normalizedCode)
      .single();
    
    if (error) {
      return {
        valid: false,
        discountAmount: 0,
        message: 'Invalid discount code',
      };
    }
    
    const discount = data as DiscountCode;
    
    // Check if code is active
    if (!discount.is_active) {
      return {
        valid: false,
        discountAmount: 0,
        message: 'This discount code is not active',
      };
    }
    
    // Check date range
    const now = new Date();
    if (discount.start_date && new Date(discount.start_date) > now) {
      return {
        valid: false,
        discountAmount: 0,
        message: 'This discount code is not yet active',
      };
    }
    
    if (discount.end_date && new Date(discount.end_date) < now) {
      return {
        valid: false,
        discountAmount: 0,
        message: 'This discount code has expired',
      };
    }
    
    // Check usage limit
    if (discount.usage_limit !== null && discount.usage_count >= discount.usage_limit) {
      return {
        valid: false,
        discountAmount: 0,
        message: 'This discount code has reached its usage limit',
      };
    }
    
    // Check minimum order amount
    if (subtotal < discount.minimum_order_amount) {
      return {
        valid: false,
        discountAmount: 0,
        message: `This discount code requires a minimum order of $${discount.minimum_order_amount.toFixed(2)}`,
      };
    }
    
    // Calculate discount amount
    let discountAmount = 0;
    if (discount.discount_type === 'percentage') {
      discountAmount = subtotal * (discount.discount_value / 100);
    } else {
      discountAmount = Math.min(discount.discount_value, subtotal);
    }
    
    return {
      valid: true,
      discount,
      discountAmount,
      message: `Discount applied: ${discount.description || discount.code}`,
    };
  } catch (error) {
    console.error('Error validating discount code:', error);
    return {
      valid: false,
      discountAmount: 0,
      message: 'An error occurred while validating the discount code',
    };
  }
}

/**
 * Applies a discount code to an order
 * 
 * @param orderId The order ID
 * @param discountId The discount ID
 * @param discountAmount The discount amount
 * @returns Whether the discount was applied successfully
 */
export async function applyDiscountToOrder(
  orderId: string,
  discountId: string,
  discountAmount: number
): Promise<boolean> {
  try {
    // Update order with discount
    const { error: orderError } = await supabase
      .from('orders')
      .update({
        coupon_id: discountId,
        discount_amount: discountAmount,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);
    
    if (orderError) throw orderError;
    
    // Increment usage count
    const { error: usageError } = await supabase
      .from('coupons')
      .update({
        usage_count: supabase.rpc('increment', { row_id: discountId }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', discountId);
    
    if (usageError) throw usageError;
    
    return true;
  } catch (error) {
    console.error('Error applying discount to order:', error);
    return false;
  }
}

/**
 * Gets active discount codes
 * 
 * @returns Array of active discount codes
 */
export async function getActiveDiscountCodes(): Promise<DiscountCode[]> {
  try {
    const { data, error } = await supabase
      .from('coupons')
      .select('*')
      .eq('is_active', true)
      .lt('usage_count', supabase.raw('COALESCE(usage_limit, usage_count + 1)'))
      .or(`end_date.is.null,end_date.gt.${new Date().toISOString()}`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error getting active discount codes:', error);
    return [];
  }
}

/**
 * Creates a new discount code
 * 
 * @param discount The discount code to create
 * @returns The created discount code
 */
export async function createDiscountCode(discount: Partial<DiscountCode>): Promise<DiscountCode | null> {
  try {
    const { data, error } = await supabase
      .from('coupons')
      .insert({
        code: discount.code,
        description: discount.description,
        discount_type: discount.discount_type,
        discount_value: discount.discount_value,
        minimum_order_amount: discount.minimum_order_amount || 0,
        is_active: discount.is_active !== undefined ? discount.is_active : true,
        start_date: discount.start_date,
        end_date: discount.end_date,
        usage_limit: discount.usage_limit,
        usage_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error('Error creating discount code:', error);
    return null;
  }
}
