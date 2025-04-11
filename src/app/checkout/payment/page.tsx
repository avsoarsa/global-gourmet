'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore, useCheckoutStore } from '@/lib/store';
import { getUserPaymentMethods, createPaymentMethod, updatePaymentMethod } from '@/lib/api';
import { PaymentMethod } from '@/types/database.types';
import { toast } from 'react-hot-toast';

export default function PaymentPage() {
  const router = useRouter();
  const { userId } = useAuthStore();
  const { 
    shippingAddress, 
    shippingMethod, 
    paymentMethod, 
    setPaymentMethod,
    billingAddress,
    setBillingAddress
  } = useCheckoutStore();
  
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [isNewPayment, setIsNewPayment] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sameAsShipping, setSameAsShipping] = useState(true);
  
  const [formData, setFormData] = useState({
    cardholderName: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    savePayment: true,
    isDefault: false,
  });
  
  useEffect(() => {
    if (!userId) return;
    
    // Check if shipping information is available
    if (!shippingAddress || !shippingMethod) {
      router.push('/checkout/shipping');
      return;
    }
    
    const loadPaymentMethods = async () => {
      setLoading(true);
      try {
        const methodsList = await getUserPaymentMethods(userId);
        setPaymentMethods(methodsList);
        
        // If we have a saved payment method from store, select it
        if (paymentMethod) {
          setSelectedPaymentId(paymentMethod.id);
        } else {
          // Otherwise select the default payment method if available
          const defaultMethod = methodsList.find(method => method.is_default);
          if (defaultMethod) {
            setSelectedPaymentId(defaultMethod.id);
            setPaymentMethod(defaultMethod);
          }
        }
        
        // Set billing address same as shipping by default
        if (!billingAddress) {
          setBillingAddress(shippingAddress);
        }
      } catch (error) {
        console.error('Error loading payment methods:', error);
        toast.error('Failed to load payment methods');
      } finally {
        setLoading(false);
      }
    };
    
    loadPaymentMethods();
  }, [userId, shippingAddress, shippingMethod, paymentMethod, billingAddress, router, setPaymentMethod, setBillingAddress]);
  
  const handlePaymentSelect = (paymentId: string) => {
    setSelectedPaymentId(paymentId);
    const selectedMethod = paymentMethods.find(method => method.id === paymentId);
    if (selectedMethod) {
      setPaymentMethod(selectedMethod);
    }
  };
  
  const handleAddNewPayment = () => {
    setShowPaymentForm(true);
    setIsNewPayment(true);
    setFormData({
      cardholderName: '',
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      savePayment: true,
      isDefault: paymentMethods.length === 0, // Make default if it's the first payment method
    });
  };
  
  const handleEditPayment = (payment: PaymentMethod) => {
    setShowPaymentForm(true);
    setIsNewPayment(false);
    setSelectedPaymentId(payment.id);
    setFormData({
      cardholderName: payment.cardholder_name,
      cardNumber: `**** **** **** ${payment.last_four}`,
      expiryMonth: payment.expiry_month,
      expiryYear: payment.expiry_year,
      cvv: '',
      savePayment: true,
      isDefault: payment.is_default,
    });
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };
  
  const handleBillingAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSameAsShipping(e.target.checked);
    if (e.target.checked && shippingAddress) {
      setBillingAddress(shippingAddress);
    } else {
      // If unchecked, we could show a form to enter a different billing address
      // For simplicity, we'll just set it to null for now
      setBillingAddress(null);
    }
  };
  
  const formatCardNumber = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Add space after every 4 digits
    const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    
    return formatted;
  };
  
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setFormData(prev => ({ ...prev, cardNumber: formatted }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) return;
    
    setSaving(true);
    
    try {
      // Validate payment information
      if (!formData.cardholderName || !formData.cardNumber || 
          !formData.expiryMonth || !formData.expiryYear || !formData.cvv) {
        toast.error('Please fill in all required fields');
        setSaving(false);
        return;
      }
      
      // Validate card number format (only for new cards)
      if (isNewPayment) {
        const cardDigits = formData.cardNumber.replace(/\D/g, '');
        if (cardDigits.length < 13 || cardDigits.length > 19) {
          toast.error('Please enter a valid card number');
          setSaving(false);
          return;
        }
      }
      
      // Validate expiry date
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      const expiryYear = parseInt(formData.expiryYear);
      const expiryMonth = parseInt(formData.expiryMonth);
      
      if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
        toast.error('Card has expired');
        setSaving(false);
        return;
      }
      
      // Validate CVV
      if (formData.cvv.length < 3 || formData.cvv.length > 4) {
        toast.error('Please enter a valid CVV');
        setSaving(false);
        return;
      }
      
      let savedPaymentMethod;
      
      // Determine card type based on first digit
      let cardType = 'unknown';
      if (isNewPayment) {
        const cardDigits = formData.cardNumber.replace(/\D/g, '');
        const firstDigit = cardDigits.charAt(0);
        if (firstDigit === '4') cardType = 'visa';
        else if (firstDigit === '5') cardType = 'mastercard';
        else if (firstDigit === '3') cardType = 'amex';
        else if (firstDigit === '6') cardType = 'discover';
      }
      
      if (isNewPayment) {
        // Create new payment method
        if (formData.savePayment) {
          savedPaymentMethod = await createPaymentMethod(userId, {
            cardholderName: formData.cardholderName,
            cardNumber: formData.cardNumber,
            cardType,
            expiryMonth: formData.expiryMonth,
            expiryYear: formData.expiryYear,
            isDefault: formData.isDefault,
          });
          toast.success('Payment method saved successfully');
        } else {
          // If not saving to payment methods, create a temporary payment object
          const cardDigits = formData.cardNumber.replace(/\D/g, '');
          const lastFour = cardDigits.slice(-4);
          
          savedPaymentMethod = {
            id: 'temp-' + Date.now(),
            user_id: userId,
            cardholder_name: formData.cardholderName,
            last_four: lastFour,
            card_type: cardType,
            expiry_month: formData.expiryMonth,
            expiry_year: formData.expiryYear,
            is_default: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
        }
      } else {
        // Update existing payment method
        if (!selectedPaymentId) {
          toast.error('No payment method selected for update');
          setSaving(false);
          return;
        }
        
        savedPaymentMethod = await updatePaymentMethod(selectedPaymentId, userId, {
          cardholderName: formData.cardholderName,
          expiryMonth: formData.expiryMonth,
          expiryYear: formData.expiryYear,
          isDefault: formData.isDefault,
        });
        toast.success('Payment method updated successfully');
      }
      
      // Update payment methods list
      if (formData.savePayment) {
        const updatedMethods = isNewPayment 
          ? [...paymentMethods, savedPaymentMethod]
          : paymentMethods.map(method => method.id === savedPaymentMethod.id ? savedPaymentMethod : method);
        
        setPaymentMethods(updatedMethods);
      }
      
      // Set as selected payment method
      setSelectedPaymentId(savedPaymentMethod.id);
      setPaymentMethod(savedPaymentMethod);
      
      // Hide form
      setShowPaymentForm(false);
    } catch (error) {
      console.error('Error saving payment method:', error);
      toast.error('Failed to save payment method');
    } finally {
      setSaving(false);
    }
  };
  
  const handleContinue = () => {
    if (!selectedPaymentId) {
      toast.error('Please select a payment method');
      return;
    }
    
    if (!billingAddress) {
      toast.error('Please provide a billing address');
      return;
    }
    
    // Navigate to review page
    router.push('/checkout/review');
  };
  
  const getCardIcon = (cardType: string) => {
    switch (cardType) {
      case 'visa':
        return 'fab fa-cc-visa';
      case 'mastercard':
        return 'fab fa-cc-mastercard';
      case 'amex':
        return 'fab fa-cc-amex';
      case 'discover':
        return 'fab fa-cc-discover';
      default:
        return 'fas fa-credit-card';
    }
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Payment Method</h2>
          </div>
          
          {loading ? (
            <div className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          ) : showPaymentForm ? (
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                {isNewPayment ? 'Add New Payment Method' : 'Edit Payment Method'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-700 mb-1">
                    Cardholder Name *
                  </label>
                  <input
                    type="text"
                    id="cardholderName"
                    name="cardholderName"
                    value={formData.cardholderName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                    Card Number *
                  </label>
                  <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleCardNumberChange}
                    required
                    maxLength={19}
                    disabled={!isNewPayment}
                    className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                      !isNewPayment ? 'bg-gray-100' : ''
                    }`}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Expiry Date *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        id="expiryMonth"
                        name="expiryMonth"
                        value={formData.expiryMonth}
                        onChange={handleChange}
                        required
                        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="">MM</option>
                        {Array.from({ length: 12 }, (_, i) => {
                          const month = (i + 1).toString().padStart(2, '0');
                          return (
                            <option key={month} value={month}>
                              {month}
                            </option>
                          );
                        })}
                      </select>
                      
                      <select
                        id="expiryYear"
                        name="expiryYear"
                        value={formData.expiryYear}
                        onChange={handleChange}
                        required
                        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="">YYYY</option>
                        {Array.from({ length: 10 }, (_, i) => {
                          const year = (new Date().getFullYear() + i).toString();
                          return (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                      CVV *
                    </label>
                    <input
                      type="password"
                      id="cvv"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleChange}
                      required
                      maxLength={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="savePayment"
                    name="savePayment"
                    checked={formData.savePayment}
                    onChange={handleChange}
                    className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                  />
                  <label htmlFor="savePayment" className="ml-2 block text-sm text-gray-700">
                    Save payment method for future purchases
                  </label>
                </div>
                
                {formData.savePayment && (
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
                      Set as default payment method
                    </label>
                  </div>
                )}
                
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowPaymentForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className={`bg-amber-600 text-white px-6 py-2 rounded-md hover:bg-amber-700 font-medium ${
                      saving ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {saving ? 'Saving...' : 'Save Payment Method'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-800">Select Payment Method</h3>
                <button
                  onClick={handleAddNewPayment}
                  className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                >
                  + Add New Payment Method
                </button>
              </div>
              
              {paymentMethods.length === 0 ? (
                <div className="bg-gray-50 p-6 rounded-md text-center">
                  <p className="text-gray-600 mb-4">You don't have any saved payment methods.</p>
                  <button
                    onClick={handleAddNewPayment}
                    className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700"
                  >
                    Add New Payment Method
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {paymentMethods.map((payment) => (
                    <div
                      key={payment.id}
                      className={`border rounded-lg p-4 relative cursor-pointer ${
                        selectedPaymentId === payment.id
                          ? 'border-amber-600 bg-amber-50'
                          : 'border-gray-200 hover:border-amber-300'
                      }`}
                      onClick={() => handlePaymentSelect(payment.id)}
                    >
                      <div className="flex items-start">
                        <div className="mr-3 mt-1">
                          <input
                            type="radio"
                            checked={selectedPaymentId === payment.id}
                            onChange={() => handlePaymentSelect(payment.id)}
                            className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300"
                          />
                        </div>
                        <div className="flex-grow">
                          <div className="flex justify-between">
                            <div className="flex items-center">
                              <i className={`${getCardIcon(payment.card_type)} text-gray-600 text-xl mr-2`}></i>
                              <h4 className="font-medium text-gray-800">
                                {payment.card_type.charAt(0).toUpperCase() + payment.card_type.slice(1)} •••• {payment.last_four}
                              </h4>
                            </div>
                            {payment.is_default && (
                              <span className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600">
                            {payment.cardholder_name} | Expires {payment.expiry_month}/{payment.expiry_year.slice(-2)}
                          </p>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditPayment(payment);
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
            <h2 className="text-xl font-bold text-gray-800">Billing Address</h2>
          </div>
          
          <div className="p-6">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="sameAsShipping"
                checked={sameAsShipping}
                onChange={handleBillingAddressChange}
                className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
              />
              <label htmlFor="sameAsShipping" className="ml-2 block text-sm text-gray-700">
                Same as shipping address
              </label>
            </div>
            
            {sameAsShipping && shippingAddress && (
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium text-gray-800">{shippingAddress.full_name}</h4>
                <p className="text-gray-600">{shippingAddress.address_line1}</p>
                {shippingAddress.address_line2 && (
                  <p className="text-gray-600">{shippingAddress.address_line2}</p>
                )}
                <p className="text-gray-600">
                  {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postal_code}
                </p>
                <p className="text-gray-600">{shippingAddress.country}</p>
                <p className="text-gray-600">{shippingAddress.phone}</p>
              </div>
            )}
            
            {!sameAsShipping && (
              <div className="bg-gray-50 p-6 rounded-md text-center">
                <p className="text-gray-600 mb-4">Please select a different billing address.</p>
                <Link
                  href="/account/addresses"
                  className="text-amber-600 hover:text-amber-700 font-medium"
                >
                  Manage Addresses
                </Link>
              </div>
            )}
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
                Review Order
              </button>
              
              <Link
                href="/checkout/shipping"
                className="block text-center text-amber-600 hover:text-amber-700 mt-4"
              >
                Return to Shipping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
