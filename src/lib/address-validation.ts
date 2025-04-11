/**
 * Address validation service
 * 
 * This module provides address validation functionality using the SmartyStreets API.
 * In a production environment, you would use your own API key.
 */

import axios from 'axios';

// Types for address validation
export interface AddressToValidate {
  street: string;
  street2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface ValidatedAddress {
  street: string;
  street2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isValid: boolean;
  deliveryLine1?: string;
  deliveryLine2?: string;
  lastLine?: string;
  metadata?: {
    countyName?: string;
    latitude?: number;
    longitude?: number;
    timeZone?: string;
  };
  components?: {
    primaryNumber?: string;
    streetName?: string;
    streetSuffix?: string;
    cityName?: string;
    stateAbbreviation?: string;
    zipCode?: string;
    plus4Code?: string;
  };
  analysis?: {
    dpvMatchCode?: string;
    dpvFootnotes?: string;
    active?: string;
    footnotes?: string;
    deliveryPointBarcode?: string;
  };
}

/**
 * Validates an address using SmartyStreets API
 * 
 * @param address The address to validate
 * @returns A validated address object
 */
export async function validateAddress(address: AddressToValidate): Promise<ValidatedAddress> {
  try {
    // In a real implementation, you would call the SmartyStreets API
    // For this example, we'll simulate the API call
    
    // Check if we're in development mode (no API key)
    if (process.env.NODE_ENV === 'development' || !process.env.SMARTY_AUTH_ID) {
      // Simulate API response with a delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simple validation logic
      const isValid = Boolean(
        address.street &&
        address.city &&
        address.state &&
        address.zipCode &&
        address.zipCode.match(/^\d{5}(-\d{4})?$/) // Basic US ZIP code validation
      );
      
      return {
        ...address,
        street: address.street,
        street2: address.street2,
        city: address.city,
        state: address.state,
        zipCode: address.zipCode,
        country: address.country,
        isValid,
        deliveryLine1: address.street,
        deliveryLine2: address.street2,
        lastLine: `${address.city}, ${address.state} ${address.zipCode}`,
        metadata: {
          countyName: 'Sample County',
          latitude: 37.7749,
          longitude: -122.4194,
          timeZone: 'America/Los_Angeles',
        },
      };
    }
    
    // Real API implementation
    const apiUrl = 'https://us-street.api.smartystreets.com/street-address';
    const response = await axios.get(apiUrl, {
      params: {
        'auth-id': process.env.SMARTY_AUTH_ID,
        'auth-token': process.env.SMARTY_AUTH_TOKEN,
        street: address.street,
        street2: address.street2,
        city: address.city,
        state: address.state,
        zipcode: address.zipCode,
        candidates: 1,
      },
    });
    
    // Process the API response
    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      return {
        street: result.delivery_line_1,
        street2: address.street2,
        city: result.components.city_name,
        state: result.components.state_abbreviation,
        zipCode: `${result.components.zipcode}${result.components.plus4_code ? '-' + result.components.plus4_code : ''}`,
        country: address.country,
        isValid: true,
        deliveryLine1: result.delivery_line_1,
        deliveryLine2: result.delivery_line_2,
        lastLine: result.last_line,
        metadata: {
          countyName: result.metadata.county_name,
          latitude: result.metadata.latitude,
          longitude: result.metadata.longitude,
          timeZone: result.metadata.time_zone,
        },
        components: {
          primaryNumber: result.components.primary_number,
          streetName: result.components.street_name,
          streetSuffix: result.components.street_suffix,
          cityName: result.components.city_name,
          stateAbbreviation: result.components.state_abbreviation,
          zipCode: result.components.zipcode,
          plus4Code: result.components.plus4_code,
        },
        analysis: {
          dpvMatchCode: result.analysis.dpv_match_code,
          dpvFootnotes: result.analysis.dpv_footnotes,
          active: result.analysis.active,
          footnotes: result.analysis.footnotes,
          deliveryPointBarcode: result.analysis.delivery_point_barcode,
        },
      };
    }
    
    // If no results, return invalid address
    return {
      ...address,
      isValid: false,
    };
  } catch (error) {
    console.error('Error validating address:', error);
    // Return the original address marked as invalid
    return {
      ...address,
      isValid: false,
    };
  }
}

/**
 * Formats an address for display
 * 
 * @param address The address to format
 * @returns A formatted address string
 */
export function formatAddress(address: AddressToValidate | ValidatedAddress): string {
  const parts = [
    address.street,
    address.street2,
    `${address.city}, ${address.state} ${address.zipCode}`,
    address.country,
  ].filter(Boolean);
  
  return parts.join('\n');
}

/**
 * Converts a database address to the validation format
 */
export function convertAddressForValidation(address: any): AddressToValidate {
  return {
    street: address.address_line1 || '',
    street2: address.address_line2 || '',
    city: address.city || '',
    state: address.state || '',
    zipCode: address.postal_code || '',
    country: address.country || 'US',
  };
}

/**
 * Converts a validated address back to database format
 */
export function convertValidatedAddressToDbFormat(address: ValidatedAddress, originalAddress: any): any {
  return {
    ...originalAddress,
    address_line1: address.street,
    address_line2: address.street2 || '',
    city: address.city,
    state: address.state,
    postal_code: address.zipCode,
    country: address.country,
    // Additional metadata could be stored in a separate table if needed
  };
}
