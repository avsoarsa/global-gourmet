'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore, useCheckoutStore } from '@/lib/store';
import { getUserAddresses, createAddress, updateAddress } from '@/lib/api';
import { Address } from '@/types/database.types';
import { toast } from 'react-hot-toast';
import { validateAddress, convertAddressForValidation, convertValidatedAddressToDbFormat } from '@/lib/address-validation';

export default function ShippingPage() {
  const router = useRouter();
  const { userId } = useAuthStore();
  const { shippingAddress, setShippingAddress, shippingMethod, setShippingMethod } = useCheckoutStore();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [isNewAddress, setIsNewAddress] = useState(true);
  const [saving, setSaving] = useState(false);
  const [validatingAddress, setValidatingAddress] = useState(false);
  const [addressValidated, setAddressValidated] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
    phone: '',
    saveAddress: true,
    isDefault: false,
  });

  // Shipping methods
  const shippingMethods = [
    { id: 'standard', name: 'Standard Shipping', price: 5.99, description: 'Delivery in 5-7 business days', days: '5-7' },
    { id: 'express', name: 'Express Shipping', price: 12.99, description: 'Delivery in 2-3 business days', days: '2-3' },
    { id: 'overnight', name: 'Overnight Shipping', price: 24.99, description: 'Next business day delivery', days: '1' },
  ];

  useEffect(() => {
    if (!userId) return;

    const loadAddresses = async () => {
      setLoading(true);
      try {
        const addressList = await getUserAddresses(userId);
        setAddresses(addressList);

        // If we have a saved shipping address from store, select it
        if (shippingAddress) {
          setSelectedAddressId(shippingAddress.id);
        } else {
          // Otherwise select the default address if available
          const defaultAddress = addressList.find(addr => addr.is_default);
          if (defaultAddress) {
            setSelectedAddressId(defaultAddress.id);
            setShippingAddress(defaultAddress);
          }
        }

        // If no shipping method is selected, select the standard one
        if (!shippingMethod) {
          setShippingMethod(shippingMethods[0]);
        }
      } catch (error) {
        console.error('Error loading addresses:', error);
        toast.error('Failed to load addresses');
      } finally {
        setLoading(false);
      }
    };

    loadAddresses();
  }, [userId, shippingAddress, shippingMethod, setShippingAddress, setShippingMethod]);

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);
    const selectedAddress = addresses.find(addr => addr.id === addressId);
    if (selectedAddress) {
      setShippingAddress(selectedAddress);
    }
  };

  const handleAddNewAddress = () => {
    setShowAddressForm(true);
    setIsNewAddress(true);
    setFormData({
      fullName: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US',
      phone: '',
      saveAddress: true,
      isDefault: addresses.length === 0, // Make default if it's the first address
    });
  };

  const handleEditAddress = (address: Address) => {
    setShowAddressForm(true);
    setIsNewAddress(false);
    setSelectedAddressId(address.id);
    setFormData({
      fullName: address.full_name,
      addressLine1: address.address_line1,
      addressLine2: address.address_line2 || '',
      city: address.city,
      state: address.state,
      postalCode: address.postal_code,
      country: address.country,
      phone: address.phone,
      saveAddress: true,
      isDefault: address.is_default,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleShippingMethodSelect = (method: any) => {
    setShippingMethod(method);
  };

  const validateAddressFields = async () => {
    setValidatingAddress(true);
    setValidationMessage(null);

    try {
      // Basic validation
      if (!formData.fullName || !formData.addressLine1 || !formData.city ||
          !formData.state || !formData.postalCode || !formData.country || !formData.phone) {
        setValidationMessage('Please fill in all required fields');
        return false;
      }

      // Convert to format for validation
      const addressToValidate = {
        street: formData.addressLine1,
        street2: formData.addressLine2,
        city: formData.city,
        state: formData.state,
        zipCode: formData.postalCode,
        country: formData.country
      };

      // Validate with address validation service
      const validatedAddress = await validateAddress(addressToValidate);

      if (!validatedAddress.isValid) {
        setValidationMessage('The address appears to be invalid. Please check and try again.');
        return false;
      }

      // Update form with validated address
      setFormData(prev => ({
        ...prev,
        addressLine1: validatedAddress.street,
        addressLine2: validatedAddress.street2 || '',
        city: validatedAddress.city,
        state: validatedAddress.state,
        postalCode: validatedAddress.zipCode
      }));

      setAddressValidated(true);
      setValidationMessage('Address validated successfully!');
      return true;
    } catch (error) {
      console.error('Error validating address:', error);
      setValidationMessage('An error occurred while validating the address');
      return false;
    } finally {
      setValidatingAddress(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userId) return;

    setSaving(true);

    try {
      // Validate address if not already validated
      if (!addressValidated) {
        const isValid = await validateAddressFields();
        if (!isValid) {
          setSaving(false);
          return;
        }
      }

      // Format address data
      const addressData = {
        fullName: formData.fullName,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: formData.country,
        phone: formData.phone,
        isDefault: formData.isDefault,
      };

      let savedAddress;

      if (isNewAddress) {
        // Create new address
        if (formData.saveAddress) {
          savedAddress = await createAddress(userId, addressData);
          toast.success('Address saved successfully');
        } else {
          // If not saving to address book, create a temporary address object
          savedAddress = {
            id: 'temp-' + Date.now(),
            user_id: userId,
            full_name: formData.fullName,
            address_line1: formData.addressLine1,
            address_line2: formData.addressLine2,
            city: formData.city,
            state: formData.state,
            postal_code: formData.postalCode,
            country: formData.country,
            phone: formData.phone,
            is_default: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        }
      } else {
        // Update existing address
        if (!selectedAddressId) {
          toast.error('No address selected for update');
          setSaving(false);
          return;
        }

        savedAddress = await updateAddress(selectedAddressId, userId, addressData);
        toast.success('Address updated successfully');
      }

      // Update addresses list
      if (formData.saveAddress) {
        const updatedAddresses = isNewAddress
          ? [...addresses, savedAddress]
          : addresses.map(addr => addr.id === savedAddress.id ? savedAddress : addr);

        setAddresses(updatedAddresses);
      }

      // Set as selected shipping address
      setSelectedAddressId(savedAddress.id);
      setShippingAddress(savedAddress);

      // Hide form
      setShowAddressForm(false);
      setAddressValidated(false);
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error('Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const handleContinue = () => {
    if (!selectedAddressId) {
      toast.error('Please select a shipping address');
      return;
    }

    if (!shippingMethod) {
      toast.error('Please select a shipping method');
      return;
    }

    // Navigate to payment page
    router.push('/checkout/payment');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Shipping Information</h2>
          </div>

          {loading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          ) : showAddressForm ? (
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                {isNewAddress ? 'Add New Address' : 'Edit Address'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 1 *
                  </label>
                  <input
                    type="text"
                    id="addressLine1"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 2 (Optional)
                  </label>
                  <input
                    type="text"
                    id="addressLine2"
                    name="addressLine2"
                    value={formData.addressLine2}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                      State/Province *
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      id="postalCode"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                      Country *
                    </label>
                    <select
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="">Select Country</option>
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="UK">United Kingdom</option>
                      <option value="AU">Australia</option>
                      <option value="IN">India</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="saveAddress"
                    name="saveAddress"
                    checked={formData.saveAddress}
                    onChange={handleChange}
                    className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                  />
                  <label htmlFor="saveAddress" className="ml-2 block text-sm text-gray-700">
                    Save to address book
                  </label>
                </div>

                {formData.saveAddress && (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isDefault"
                      name="isDefault"
                      checked={formData.isDefault}
                      onChange={handleChange}
                      className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-700">
                      Set as default address
                    </label>
                  </div>
                )}

                {validationMessage && (
                  <div className={`p-3 rounded-md mb-4 ${addressValidated ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {validationMessage}
                  </div>
                )}

                <div className="flex justify-between space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>

                  <div className="flex space-x-2">
                    {!addressValidated && (
                      <button
                        type="button"
                        onClick={validateAddressFields}
                        disabled={validatingAddress}
                        className={`bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 font-medium ${
                          validatingAddress ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                      >
                        {validatingAddress ? 'Validating...' : 'Validate Address'}
                      </button>
                    )}

                    <button
                      type="submit"
                      disabled={saving || (!addressValidated && !validatingAddress)}
                      className={`bg-amber-600 text-white px-6 py-2 rounded-md hover:bg-amber-700 font-medium ${
                        saving || (!addressValidated && !validatingAddress) ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      {saving ? 'Saving...' : 'Save Address'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-800">Select Shipping Address</h3>
                <button
                  onClick={handleAddNewAddress}
                  className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                >
                  + Add New Address
                </button>
              </div>

              {addresses.length === 0 ? (
                <div className="bg-gray-50 p-6 rounded-md text-center">
                  <p className="text-gray-600 mb-4">You don't have any saved addresses.</p>
                  <button
                    onClick={handleAddNewAddress}
                    className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700"
                  >
                    Add New Address
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {addresses.map((address) => (
                    <div
                      key={address.id}
                      className={`border rounded-lg p-4 relative cursor-pointer ${
                        selectedAddressId === address.id
                          ? 'border-amber-600 bg-amber-50'
                          : 'border-gray-200 hover:border-amber-300'
                      }`}
                      onClick={() => handleAddressSelect(address.id)}
                    >
                      <div className="flex items-start">
                        <div className="mr-3 mt-1">
                          <input
                            type="radio"
                            checked={selectedAddressId === address.id}
                            onChange={() => handleAddressSelect(address.id)}
                            className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300"
                          />
                        </div>
                        <div className="flex-grow">
                          <div className="flex justify-between">
                            <h4 className="font-medium text-gray-800">{address.full_name}</h4>
                            {address.is_default && (
                              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600">{address.address_line1}</p>
                          {address.address_line2 && (
                            <p className="text-gray-600">{address.address_line2}</p>
                          )}
                          <p className="text-gray-600">
                            {address.city}, {address.state} {address.postal_code}
                          </p>
                          <p className="text-gray-600">{address.country}</p>
                          <p className="text-gray-600 mt-1">{address.phone}</p>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditAddress(address);
                            }}
                            className="text-sm text-amber-600 hover:text-amber-700 mt-2"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Shipping Method</h2>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {shippingMethods.map((method) => (
                <div
                  key={method.id}
                  className={`border rounded-lg p-4 relative cursor-pointer ${
                    shippingMethod?.id === method.id
                      ? 'border-amber-600 bg-amber-50'
                      : 'border-gray-200 hover:border-amber-300'
                  }`}
                  onClick={() => handleShippingMethodSelect(method)}
                >
                  <div className="flex items-start">
                    <div className="mr-3 mt-1">
                      <input
                        type="radio"
                        checked={shippingMethod?.id === method.id}
                        onChange={() => handleShippingMethodSelect(method)}
                        className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300"
                      />
                    </div>
                    <div className="flex-grow">
                      <div className="flex justify-between">
                        <h4 className="font-medium text-gray-800">{method.name}</h4>
                        <span className="font-medium text-gray-800">${method.price.toFixed(2)}</span>
                      </div>
                      <p className="text-gray-600">{method.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden sticky top-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Order Summary</h2>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>$XXX.XX</span>
            </div>

            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>${shippingMethod ? shippingMethod.price.toFixed(2) : '0.00'}</span>
            </div>

            <div className="flex justify-between text-gray-600">
              <span>Tax</span>
              <span>$XX.XX</span>
            </div>

            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex justify-between font-bold text-gray-800">
                <span>Total</span>
                <span>$XXX.XX</span>
              </div>
            </div>

            <div className="pt-4">
              <button
                onClick={handleContinue}
                className="w-full bg-amber-600 text-white py-3 rounded-md hover:bg-amber-700 font-medium"
              >
                Continue to Payment
              </button>

              <Link
                href="/cart"
                className="block text-center text-amber-600 hover:text-amber-700 mt-4"
              >
                Return to Cart
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
