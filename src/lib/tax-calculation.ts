/**
 * Tax calculation service
 *
 * This module provides tax calculation functionality based on shipping address.
 * In a production environment, you would use a tax API like TaxJar or Avalara.
 */

import { supabase } from './supabase';

// Types for tax calculation
export interface TaxLocation {
  city: string;
  state: string;
  zipCode: string;
  country: string;
  productCategory?: string; // For category-specific tax rates (e.g., GST in India)
}

export interface TaxCalculationResult {
  taxRate: number;
  taxAmount: number;
  breakdown?: {
    stateTax?: number;
    countyTax?: number;
    cityTax?: number;
    specialTax?: number;
    // For India GST
    cgst?: number;
    sgst?: number;
    igst?: number;
    categoryGst?: number;
    category?: string;
  };
  taxableAmount: number;
  exemptAmount: number;
  totalAmount: number;
  taxSystem?: 'us' | 'gst' | 'vat' | 'other';
}

// Tax rates by state (simplified for example purposes)
const STATE_TAX_RATES: Record<string, number> = {
  'AL': 0.04, 'AK': 0.00, 'AZ': 0.056, 'AR': 0.065, 'CA': 0.0725,
  'CO': 0.029, 'CT': 0.0635, 'DE': 0.00, 'FL': 0.06, 'GA': 0.04,
  'HI': 0.04, 'ID': 0.06, 'IL': 0.0625, 'IN': 0.07, 'IA': 0.06,
  'KS': 0.065, 'KY': 0.06, 'LA': 0.0445, 'ME': 0.055, 'MD': 0.06,
  'MA': 0.0625, 'MI': 0.06, 'MN': 0.06875, 'MS': 0.07, 'MO': 0.04225,
  'MT': 0.00, 'NE': 0.055, 'NV': 0.0685, 'NH': 0.00, 'NJ': 0.06625,
  'NM': 0.05125, 'NY': 0.04, 'NC': 0.0475, 'ND': 0.05, 'OH': 0.0575,
  'OK': 0.045, 'OR': 0.00, 'PA': 0.06, 'RI': 0.07, 'SC': 0.06,
  'SD': 0.045, 'TN': 0.07, 'TX': 0.0625, 'UT': 0.0485, 'VT': 0.06,
  'VA': 0.053, 'WA': 0.065, 'WV': 0.06, 'WI': 0.05, 'WY': 0.04,
  'DC': 0.06,
};

// Additional local tax rates by ZIP code (simplified for example)
const ZIP_CODE_TAX_RATES: Record<string, number> = {
  '10001': 0.04875, // NYC
  '90001': 0.0975,  // Los Angeles
  '60601': 0.1025,  // Chicago
  '75001': 0.0825,  // Dallas
  '33101': 0.07,    // Miami
  '02101': 0.0625,  // Boston
  '98101': 0.101,   // Seattle
  '80201': 0.084,   // Denver
  '20001': 0.06,    // Washington DC
  '30301': 0.089,   // Atlanta
};

// India GST rates
const INDIA_GST_RATES = {
  // Standard GST rates
  IGST: 0.18, // Integrated GST for interstate transactions
  CGST: 0.09, // Central GST
  SGST: 0.09, // State GST

  // Category-specific GST rates
  REDUCED: 0.05,  // 5% for essential items
  MEDIUM: 0.12,   // 12% for certain goods
  STANDARD: 0.18, // 18% for most goods
  HIGH: 0.28,     // 28% for luxury items

  // Product category mappings
  CATEGORIES: {
    ESSENTIAL: ['food', 'groceries', 'books', 'medicines'],
    MEDIUM: ['clothing', 'footwear', 'processed_food'],
    STANDARD: ['electronics', 'appliances', 'furniture'],
    LUXURY: ['luxury', 'cars', 'jewelry', 'premium_electronics']
  }
};

/**
 * Calculates tax based on shipping address and order amount
 *
 * @param location The shipping location
 * @param subtotal The order subtotal
 * @param items Optional array of line items
 * @returns Tax calculation result
 */
export async function calculateTax(
  location: TaxLocation,
  subtotal: number,
  items?: Array<{ productId: string; price: number; quantity: number }>
): Promise<TaxCalculationResult> {
  try {
    // In a real implementation, you would call a tax API like TaxJar or Avalara
    // For this example, we'll use a simplified calculation based on location

    // Check if we're in development mode (no API key)
    if (process.env.NODE_ENV === 'development' || !process.env.TAX_API_KEY) {
      // Simulate API response with a delay
      await new Promise(resolve => setTimeout(resolve, 300));

      // Handle India GST calculation
      if (location.country === 'IN') {
        return calculateIndiaGST(location, subtotal, items);
      }

      // For US and other countries
      // Get state tax rate
      const stateCode = location.state.toUpperCase();
      const stateTaxRate = STATE_TAX_RATES[stateCode] || 0;

      // Get local tax rate based on ZIP code
      const zipTaxRate = ZIP_CODE_TAX_RATES[location.zipCode] || 0;

      // If we have a specific ZIP code rate, use that instead of calculating
      let totalTaxRate = zipTaxRate > 0 ? zipTaxRate : stateTaxRate;

      // Add estimated local tax if we don't have a specific ZIP code rate
      if (zipTaxRate === 0) {
        // Estimate local tax (county + city) - typically 1-3%
        const localTaxRate = Math.random() * 0.02 + 0.01; // 1-3%
        totalTaxRate += localTaxRate;
      }

      // Calculate tax amount
      const taxAmount = subtotal * totalTaxRate;

      // Create breakdown
      const stateTax = subtotal * stateTaxRate;
      const remainingTax = taxAmount - stateTax;
      const countyTax = remainingTax * 0.6; // Estimate 60% of remaining is county
      const cityTax = remainingTax * 0.3;   // Estimate 30% of remaining is city
      const specialTax = remainingTax * 0.1; // Estimate 10% of remaining is special district

      return {
        taxRate: totalTaxRate,
        taxAmount: taxAmount,
        breakdown: {
          stateTax,
          countyTax,
          cityTax,
          specialTax,
        },
        taxableAmount: subtotal,
        exemptAmount: 0,
        totalAmount: subtotal + taxAmount,
        taxSystem: 'us'
      };
    }

    // Real API implementation would go here
    // For example, using TaxJar API:
    /*
    const taxJarClient = new TaxJar({
      apiKey: process.env.TAXJAR_API_KEY
    });

    const response = await taxJarClient.taxForOrder({
      from_country: 'US',
      from_zip: '92093',
      from_state: 'CA',
      to_country: location.country,
      to_zip: location.zipCode,
      to_state: location.state,
      to_city: location.city,
      amount: subtotal,
      shipping: 0,
      line_items: items?.map(item => ({
        id: item.productId,
        quantity: item.quantity,
        unit_price: item.price,
        product_tax_code: '20010', // General product code
      }))
    });

    return {
      taxRate: response.rate,
      taxAmount: response.tax.amount_to_collect,
      breakdown: {
        stateTax: response.tax.breakdown.state_tax_collectable,
        countyTax: response.tax.breakdown.county_tax_collectable,
        cityTax: response.tax.breakdown.city_tax_collectable,
        specialTax: response.tax.breakdown.special_district_tax_collectable,
      },
      taxableAmount: response.tax.taxable_amount,
      exemptAmount: response.tax.exemption_amount,
      totalAmount: subtotal + response.tax.amount_to_collect,
    };
    */

    // For now, return the simplified calculation
    const stateCode = location.state.toUpperCase();
    const stateTaxRate = STATE_TAX_RATES[stateCode] || 0;
    const taxAmount = subtotal * stateTaxRate;

    return {
      taxRate: stateTaxRate,
      taxAmount: taxAmount,
      taxableAmount: subtotal,
      exemptAmount: 0,
      totalAmount: subtotal + taxAmount,
    };
  } catch (error) {
    console.error('Error calculating tax:', error);
    // Return a default tax calculation
    return {
      taxRate: 0.08, // Default to 8%
      taxAmount: subtotal * 0.08,
      taxableAmount: subtotal,
      exemptAmount: 0,
      totalAmount: subtotal * 1.08,
    };
  }
}

/**
 * Gets tax exemption status for a user
 *
 * @param userId The user ID
 * @returns Whether the user is tax exempt
 */
export async function getUserTaxExemptStatus(userId: string): Promise<boolean> {
  try {
    // In a real implementation, you would check if the user has tax exemption
    // For this example, we'll assume no users are tax exempt
    return false;
  } catch (error) {
    console.error('Error getting tax exempt status:', error);
    return false;
  }
}

/**
 * Saves tax calculation for an order
 *
 * @param orderId The order ID
 * @param taxCalculation The tax calculation result
 */
export async function saveTaxCalculation(
  orderId: string,
  taxCalculation: TaxCalculationResult
): Promise<void> {
  try {
    // In a real implementation, you would save the tax calculation to the database
    // For this example, we'll just update the order
    const { error } = await supabase
      .from('orders')
      .update({
        tax_amount: taxCalculation.taxAmount,
        tax_rate: taxCalculation.taxRate,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (error) throw error;
  } catch (error) {
    console.error('Error saving tax calculation:', error);
  }
}

/**
 * Calculates GST for India based on location and product category
 *
 * @param location The location information
 * @param subtotal The order subtotal
 * @param items Optional array of line items
 * @returns Tax calculation result with GST breakdown
 */
function calculateIndiaGST(
  location: TaxLocation,
  subtotal: number,
  items?: Array<{ productId: string; price: number; quantity: number }>
): TaxCalculationResult {
  // Determine if this is an interstate or intrastate transaction
  // For simplicity, we'll assume it's intrastate if a state code is provided
  const isIntrastate = Boolean(location.state);

  // Check if we have a specific product category
  let categoryRate = 0;
  let categoryType = '';

  if (location.productCategory) {
    const category = location.productCategory.toLowerCase();

    // Check if category falls into any of our predefined groups
    if (INDIA_GST_RATES.CATEGORIES.ESSENTIAL.includes(category)) {
      categoryRate = INDIA_GST_RATES.REDUCED;
      categoryType = 'essential';
    } else if (INDIA_GST_RATES.CATEGORIES.MEDIUM.includes(category)) {
      categoryRate = INDIA_GST_RATES.MEDIUM;
      categoryType = 'medium';
    } else if (INDIA_GST_RATES.CATEGORIES.LUXURY.includes(category)) {
      categoryRate = INDIA_GST_RATES.HIGH;
      categoryType = 'luxury';
    } else {
      // Default to standard rate
      categoryRate = INDIA_GST_RATES.STANDARD;
      categoryType = 'standard';
    }
  }

  // If we have a category-specific rate, use that
  if (categoryRate > 0) {
    const taxAmount = subtotal * categoryRate;

    return {
      taxRate: categoryRate,
      taxAmount: taxAmount,
      breakdown: {
        categoryGst: taxAmount,
        category: categoryType
      },
      taxableAmount: subtotal,
      exemptAmount: 0,
      totalAmount: subtotal + taxAmount,
      taxSystem: 'gst'
    };
  }

  // Otherwise use standard GST calculation
  if (isIntrastate) {
    // Intrastate: CGST + SGST
    const cgstRate = INDIA_GST_RATES.CGST;
    const sgstRate = INDIA_GST_RATES.SGST;
    const totalRate = cgstRate + sgstRate;

    const cgstAmount = subtotal * cgstRate;
    const sgstAmount = subtotal * sgstRate;
    const totalTax = cgstAmount + sgstAmount;

    return {
      taxRate: totalRate,
      taxAmount: totalTax,
      breakdown: {
        cgst: cgstAmount,
        sgst: sgstAmount
      },
      taxableAmount: subtotal,
      exemptAmount: 0,
      totalAmount: subtotal + totalTax,
      taxSystem: 'gst'
    };
  } else {
    // Interstate: IGST
    const igstRate = INDIA_GST_RATES.IGST;
    const igstAmount = subtotal * igstRate;

    return {
      taxRate: igstRate,
      taxAmount: igstAmount,
      breakdown: {
        igst: igstAmount
      },
      taxableAmount: subtotal,
      exemptAmount: 0,
      totalAmount: subtotal + igstAmount,
      taxSystem: 'gst'
    };
  }
}
