/**
 * Inventory management service
 * 
 * This module provides inventory management functionality for the checkout process.
 */

import { supabase } from './supabase';
import { Product } from '@/types/database.types';

// Types for inventory management
export interface InventoryCheck {
  productId: string;
  quantity: number;
  available: boolean;
  currentStock: number;
  backorderAvailable: boolean;
  estimatedRestockDate?: string;
}

export interface InventoryCheckResult {
  success: boolean;
  unavailableItems: InventoryCheck[];
  availableItems: InventoryCheck[];
  message?: string;
}

/**
 * Checks if all items in the cart are available in the requested quantities
 * 
 * @param items Array of cart items with product IDs and quantities
 * @returns Inventory check result
 */
export async function checkInventory(
  items: Array<{ productId: string; quantity: number }>
): Promise<InventoryCheckResult> {
  try {
    // Get product IDs
    const productIds = items.map(item => item.productId);
    
    // Fetch products with inventory information
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, stock_quantity, allow_backorders, estimated_restock_date')
      .in('id', productIds);
    
    if (error) throw error;
    
    // Check each item
    const inventoryChecks: InventoryCheck[] = items.map(item => {
      const product = products?.find(p => p.id === item.productId);
      
      if (!product) {
        return {
          productId: item.productId,
          quantity: item.quantity,
          available: false,
          currentStock: 0,
          backorderAvailable: false,
        };
      }
      
      const available = (product.stock_quantity >= item.quantity);
      
      return {
        productId: item.productId,
        quantity: item.quantity,
        available,
        currentStock: product.stock_quantity,
        backorderAvailable: product.allow_backorders,
        estimatedRestockDate: product.estimated_restock_date,
      };
    });
    
    // Separate available and unavailable items
    const unavailableItems = inventoryChecks.filter(item => !item.available);
    const availableItems = inventoryChecks.filter(item => item.available);
    
    // Check if all items are available
    const success = unavailableItems.length === 0;
    
    // Generate message
    let message = '';
    if (!success) {
      const unavailableNames = await getProductNames(unavailableItems.map(item => item.productId));
      message = `The following items are not available in the requested quantities: ${unavailableNames.join(', ')}`;
    }
    
    return {
      success,
      unavailableItems,
      availableItems,
      message,
    };
  } catch (error) {
    console.error('Error checking inventory:', error);
    return {
      success: false,
      unavailableItems: [],
      availableItems: [],
      message: 'An error occurred while checking inventory',
    };
  }
}

/**
 * Reserves inventory for an order
 * 
 * @param items Array of order items with product IDs and quantities
 * @returns Whether the reservation was successful
 */
export async function reserveInventory(
  items: Array<{ productId: string; quantity: number }>
): Promise<boolean> {
  try {
    // Check inventory first
    const inventoryCheck = await checkInventory(items);
    
    if (!inventoryCheck.success) {
      return false;
    }
    
    // Update inventory for each product
    for (const item of items) {
      const { error } = await supabase.rpc('reserve_inventory', {
        p_product_id: item.productId,
        p_quantity: item.quantity,
      });
      
      if (error) throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error reserving inventory:', error);
    return false;
  }
}

/**
 * Updates inventory after an order is placed
 * 
 * @param orderId The order ID
 * @returns Whether the update was successful
 */
export async function updateInventoryAfterOrder(orderId: string): Promise<boolean> {
  try {
    // Get order items
    const { data: orderItems, error: itemsError } = await supabase
      .from('order_items')
      .select('product_id, quantity')
      .eq('order_id', orderId);
    
    if (itemsError) throw itemsError;
    
    // Update inventory for each product
    for (const item of orderItems || []) {
      const { error } = await supabase.rpc('update_inventory_after_order', {
        p_product_id: item.product_id,
        p_quantity: item.quantity,
      });
      
      if (error) throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error updating inventory after order:', error);
    return false;
  }
}

/**
 * Gets product names by IDs
 * 
 * @param productIds Array of product IDs
 * @returns Array of product names
 */
async function getProductNames(productIds: string[]): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, name')
      .in('id', productIds);
    
    if (error) throw error;
    
    return (data || []).map(product => product.name);
  } catch (error) {
    console.error('Error getting product names:', error);
    return [];
  }
}

/**
 * Gets low stock products
 * 
 * @param threshold The low stock threshold
 * @returns Array of low stock products
 */
export async function getLowStockProducts(threshold: number = 10): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .lt('stock_quantity', threshold)
      .gt('stock_quantity', 0);
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error getting low stock products:', error);
    return [];
  }
}

/**
 * Gets out of stock products
 * 
 * @returns Array of out of stock products
 */
export async function getOutOfStockProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('stock_quantity', 0);
    
    if (error) throw error;
    
    return data || [];
  } catch (error) {
    console.error('Error getting out of stock products:', error);
    return [];
  }
}
