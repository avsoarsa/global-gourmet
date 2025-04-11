'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuthStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { PaymentMethod } from '@/types/database.types';
import AccountSidebar from '@/components/account/AccountSidebar';
import { toast } from 'react-hot-toast';

export default function PaymentMethodsPage() {
  const router = useRouter();
  const { isAuthenticated, userId } = useAuthStore();
  
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [isEditingPayment, setIsEditingPayment] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    cardholderName: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    isDefault: false,
  });
  
  useEffect(() => {
    if (!isAuthenticated || !userId) {
      router.push('/auth/signin?redirect=/account/payment-methods');
      return;
    }
    
    const loadPaymentMethods = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('payment_methods')
          .select('*')
          .eq('user_id', userId)
          .order('is_default', { ascending: false });
        
        if (error) throw error;
        setPaymentMethods(data || []);
      } catch (err) {
        console.error('Error loading payment methods:', err);
        setError('Failed to load payment methods');
      } finally {
        setLoading(false);
      }
    };
    
    loadPaymentMethods();
  }, [isAuthenticated, userId, router]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };
  
  const resetForm = () => {
    setFormData({
      cardholderName: '',
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      isDefault: false,
    });
  };
  
  const handleAddPayment = () => {
    setIsAddingPayment(true);
    setIsEditingPayment(null);
    resetForm();
  };
  
  const handleEditPayment = (payment: PaymentMethod) => {
    setIsEditingPayment(payment.id);
    setIsAddingPayment(false);
    
    // Only show last 4 digits of card number for security
    const lastFour = payment.last_four || '****';
    
    setFormData({
      cardholderName: payment.cardholder_name || '',
      cardNumber: `**** **** **** ${lastFour}`,
      expiryMonth: payment.expiry_month || '',
      expiryYear: payment.expiry_year || '',
      cvv: '',
      isDefault: payment.is_default || false,
    });
  };
  
  const handleCancelForm = () => {
    setIsAddingPayment(false);
    setIsEditingPayment(null);
    resetForm();
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
      // In a real application, you would use a secure payment processor like Stripe
      // This is a simplified example for demonstration purposes
      
      // Extract last 4 digits of card number
      const cardDigits = formData.cardNumber.replace(/\D/g, '');
      const lastFour = cardDigits.slice(-4);
      
      // Get card type based on first digit
      let cardType = 'unknown';
      const firstDigit = cardDigits.charAt(0);
      if (firstDigit === '4') cardType = 'visa';
      else if (firstDigit === '5') cardType = 'mastercard';
      else if (firstDigit === '3') cardType = 'amex';
      else if (firstDigit === '6') cardType = 'discover';
      
      // If setting as default, update all other payment methods to not be default
      if (formData.isDefault) {
        await supabase
          .from('payment_methods')
          .update({ is_default: false })
          .eq('user_id', userId);
      }
      
      if (isEditingPayment) {
        // Update existing payment method
        const { error } = await supabase
          .from('payment_methods')
          .update({
            cardholder_name: formData.cardholderName,
            expiry_month: formData.expiryMonth,
            expiry_year: formData.expiryYear,
            is_default: formData.isDefault,
            updated_at: new Date().toISOString(),
          })
          .eq('id', isEditingPayment);
        
        if (error) throw error;
        toast.success('Payment method updated successfully');
      } else {
        // Add new payment method
        const { error } = await supabase
          .from('payment_methods')
          .insert({
            user_id: userId,
            cardholder_name: formData.cardholderName,
            last_four: lastFour,
            card_type: cardType,
            expiry_month: formData.expiryMonth,
            expiry_year: formData.expiryYear,
            is_default: formData.isDefault,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        
        if (error) throw error;
        toast.success('Payment method added successfully');
      }
      
      // Reload payment methods
      const { data } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false });
      
      setPaymentMethods(data || []);
      setIsAddingPayment(false);
      setIsEditingPayment(null);
      resetForm();
    } catch (err) {
      console.error('Error saving payment method:', err);
      toast.error('Failed to save payment method');
    } finally {
      setSaving(false);
    }
  };
  
  const handleDeletePayment = async (paymentId: string) => {
    if (!confirm('Are you sure you want to delete this payment method?')) return;
    
    try {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', paymentId);
      
      if (error) throw error;
      
      setPaymentMethods(paymentMethods.filter(payment => payment.id !== paymentId));
      toast.success('Payment method deleted successfully');
    } catch (err) {
      console.error('Error deleting payment method:', err);
      toast.error('Failed to delete payment method');
    }
  };
  
  const handleSetDefault = async (paymentId: string) => {
    try {
      // First, set all payment methods to not default
      await supabase
        .from('payment_methods')
        .update({ is_default: false })
        .eq('user_id', userId);
      
      // Then set the selected payment method as default
      const { error } = await supabase
        .from('payment_methods')
        .update({ is_default: true })
        .eq('id', paymentId);
      
      if (error) throw error;
      
      // Update local state
      setPaymentMethods(paymentMethods.map(payment => ({
        ...payment,
        is_default: payment.id === paymentId
      })));
      
      toast.success('Default payment method updated');
    } catch (err) {
      console.error('Error setting default payment method:', err);
      toast.error('Failed to update default payment method');
    }
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
  
  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }
  
  return (
    <div className="font-sans bg-gray-50 min-h-screen">
      <Header />
      <main className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}
          
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <div className="md:w-1/4 lg:w-1/5">
              <AccountSidebar activePage="payment-methods" />
            </div>
            
            {/* Main Content */}
            <div className="md:w-3/4 lg:w-4/5">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-800">Payment Methods</h2>
                  
                  {!isAddingPayment && !isEditingPayment && (
                    <button
                      onClick={handleAddPayment}
                      className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 text-sm font-medium"
                    >
                      Add New Payment Method
                    </button>
                  )}
                </div>
                
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-600 mb-2"></div>
                    <p className="text-gray-600">Loading payment methods...</p>
                  </div>
                ) : isAddingPayment || isEditingPayment ? (
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">
                      {isEditingPayment ? 'Edit Payment Method' : 'Add New Payment Method'}
                    </h3>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <label htmlFor="cardholderName" className="block text-sm font-medium text-gray-700 mb-1">
                          Cardholder Name
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
                          Card Number
                        </label>
                        <input
                          type="text"
                          id="cardNumber"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleCardNumberChange}
                          required
                          maxLength={19}
                          disabled={!!isEditingPayment}
                          className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500 ${
                            isEditingPayment ? 'bg-gray-100' : ''
                          }`}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                            Expiry Date
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
                            CVV
                          </label>
                          <input
                            type="password"
                            id="cvv"
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleChange}
                            required={!isEditingPayment}
                            maxLength={4}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                      </div>
                      
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
                      
                      <div className="flex justify-end space-x-4">
                        <button
                          type="button"
                          onClick={handleCancelForm}
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
                ) : paymentMethods.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-credit-card text-gray-400 text-xl"></i>
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-1">No Payment Methods Found</h3>
                    <p className="text-gray-600 mb-4">
                      Add a payment method to make checkout faster.
                    </p>
                    <button
                      onClick={handleAddPayment}
                      className="inline-block bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700"
                    >
                      Add New Payment Method
                    </button>
                  </div>
                ) : (
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {paymentMethods.map((payment) => (
                      <div
                        key={payment.id}
                        className={`border rounded-lg p-4 relative ${
                          payment.is_default ? 'border-amber-300 bg-amber-50' : 'border-gray-200'
                        }`}
                      >
                        {payment.is_default && (
                          <div className="absolute top-2 right-2 bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
                            Default
                          </div>
                        )}
                        
                        <div className="flex items-center mb-4">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                            <i className={`${getCardIcon(payment.card_type)} text-gray-600 text-xl`}></i>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-800">
                              {payment.card_type.charAt(0).toUpperCase() + payment.card_type.slice(1)} •••• {payment.last_four}
                            </h3>
                            <p className="text-gray-600 text-sm">
                              Expires {payment.expiry_month}/{payment.expiry_year.slice(-2)}
                            </p>
                          </div>
                        </div>
                        
                        <p className="text-gray-700 mb-4">{payment.cardholder_name}</p>
                        
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleEditPayment(payment)}
                            className="text-sm text-amber-600 hover:text-amber-700"
                          >
                            Edit
                          </button>
                          <span className="text-gray-300 mx-1">|</span>
                          <button
                            onClick={() => handleDeletePayment(payment.id)}
                            className="text-sm text-red-600 hover:text-red-700"
                          >
                            Delete
                          </button>
                          {!payment.is_default && (
                            <>
                              <span className="text-gray-300 mx-1">|</span>
                              <button
                                onClick={() => handleSetDefault(payment.id)}
                                className="text-sm text-amber-600 hover:text-amber-700"
                              >
                                Set as Default
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
