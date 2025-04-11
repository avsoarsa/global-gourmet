'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuthStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { Address } from '@/types/database.types';
import AccountSidebar from '@/components/account/AccountSidebar';
import { toast } from 'react-hot-toast';

export default function AddressesPage() {
  const router = useRouter();
  const { isAuthenticated, userId } = useAuthStore();
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
    phone: '',
    isDefault: false,
  });
  
  useEffect(() => {
    if (!isAuthenticated || !userId) {
      router.push('/auth/signin?redirect=/account/addresses');
      return;
    }
    
    const loadAddresses = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('addresses')
          .select('*')
          .eq('user_id', userId)
          .order('is_default', { ascending: false });
        
        if (error) throw error;
        setAddresses(data || []);
      } catch (err) {
        console.error('Error loading addresses:', err);
        setError('Failed to load addresses');
      } finally {
        setLoading(false);
      }
    };
    
    loadAddresses();
  }, [isAuthenticated, userId, router]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };
  
  const resetForm = () => {
    setFormData({
      fullName: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US',
      phone: '',
      isDefault: false,
    });
  };
  
  const handleAddAddress = () => {
    setIsAddingAddress(true);
    setIsEditingAddress(null);
    resetForm();
  };
  
  const handleEditAddress = (address: Address) => {
    setIsEditingAddress(address.id);
    setIsAddingAddress(false);
    setFormData({
      fullName: address.full_name || '',
      addressLine1: address.address_line1 || '',
      addressLine2: address.address_line2 || '',
      city: address.city || '',
      state: address.state || '',
      postalCode: address.postal_code || '',
      country: address.country || 'US',
      phone: address.phone || '',
      isDefault: address.is_default || false,
    });
  };
  
  const handleCancelForm = () => {
    setIsAddingAddress(false);
    setIsEditingAddress(null);
    resetForm();
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) return;
    
    setSaving(true);
    
    try {
      // If setting as default, update all other addresses to not be default
      if (formData.isDefault) {
        await supabase
          .from('addresses')
          .update({ is_default: false })
          .eq('user_id', userId);
      }
      
      if (isEditingAddress) {
        // Update existing address
        const { error } = await supabase
          .from('addresses')
          .update({
            full_name: formData.fullName,
            address_line1: formData.addressLine1,
            address_line2: formData.addressLine2,
            city: formData.city,
            state: formData.state,
            postal_code: formData.postalCode,
            country: formData.country,
            phone: formData.phone,
            is_default: formData.isDefault,
            updated_at: new Date().toISOString(),
          })
          .eq('id', isEditingAddress);
        
        if (error) throw error;
        toast.success('Address updated successfully');
      } else {
        // Add new address
        const { error } = await supabase
          .from('addresses')
          .insert({
            user_id: userId,
            full_name: formData.fullName,
            address_line1: formData.addressLine1,
            address_line2: formData.addressLine2,
            city: formData.city,
            state: formData.state,
            postal_code: formData.postalCode,
            country: formData.country,
            phone: formData.phone,
            is_default: formData.isDefault,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        
        if (error) throw error;
        toast.success('Address added successfully');
      }
      
      // Reload addresses
      const { data } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false });
      
      setAddresses(data || []);
      setIsAddingAddress(false);
      setIsEditingAddress(null);
      resetForm();
    } catch (err) {
      console.error('Error saving address:', err);
      toast.error('Failed to save address');
    } finally {
      setSaving(false);
    }
  };
  
  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to delete this address?')) return;
    
    try {
      const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', addressId);
      
      if (error) throw error;
      
      setAddresses(addresses.filter(addr => addr.id !== addressId));
      toast.success('Address deleted successfully');
    } catch (err) {
      console.error('Error deleting address:', err);
      toast.error('Failed to delete address');
    }
  };
  
  const handleSetDefault = async (addressId: string) => {
    try {
      // First, set all addresses to not default
      await supabase
        .from('addresses')
        .update({ is_default: false })
        .eq('user_id', userId);
      
      // Then set the selected address as default
      const { error } = await supabase
        .from('addresses')
        .update({ is_default: true })
        .eq('id', addressId);
      
      if (error) throw error;
      
      // Update local state
      setAddresses(addresses.map(addr => ({
        ...addr,
        is_default: addr.id === addressId
      })));
      
      toast.success('Default address updated');
    } catch (err) {
      console.error('Error setting default address:', err);
      toast.error('Failed to update default address');
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
              <AccountSidebar activePage="addresses" />
            </div>
            
            {/* Main Content */}
            <div className="md:w-3/4 lg:w-4/5">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-800">Address Book</h2>
                  
                  {!isAddingAddress && !isEditingAddress && (
                    <button
                      onClick={handleAddAddress}
                      className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 text-sm font-medium"
                    >
                      Add New Address
                    </button>
                  )}
                </div>
                
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-600 mb-2"></div>
                    <p className="text-gray-600">Loading addresses...</p>
                  </div>
                ) : isAddingAddress || isEditingAddress ? (
                  <div className="p-6">
                    <h3 className="text-lg font-medium text-gray-800 mb-4">
                      {isEditingAddress ? 'Edit Address' : 'Add New Address'}
                    </h3>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
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
                          Address Line 1
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
                            City
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
                            State/Province
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
                            Postal Code
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
                            Country
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
                          Phone Number
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
                          {saving ? 'Saving...' : 'Save Address'}
                        </button>
                      </div>
                    </form>
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="fas fa-map-marker-alt text-gray-400 text-xl"></i>
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-1">No Addresses Found</h3>
                    <p className="text-gray-600 mb-4">
                      Add a shipping address to make checkout faster.
                    </p>
                    <button
                      onClick={handleAddAddress}
                      className="inline-block bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700"
                    >
                      Add New Address
                    </button>
                  </div>
                ) : (
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        className={`border rounded-lg p-4 relative ${
                          address.is_default ? 'border-amber-300 bg-amber-50' : 'border-gray-200'
                        }`}
                      >
                        {address.is_default && (
                          <div className="absolute top-2 right-2 bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
                            Default
                          </div>
                        )}
                        
                        <div className="mb-4">
                          <h3 className="font-medium text-gray-800">{address.full_name}</h3>
                          <p className="text-gray-600">{address.address_line1}</p>
                          {address.address_line2 && (
                            <p className="text-gray-600">{address.address_line2}</p>
                          )}
                          <p className="text-gray-600">
                            {address.city}, {address.state} {address.postal_code}
                          </p>
                          <p className="text-gray-600">{address.country}</p>
                          <p className="text-gray-600 mt-1">{address.phone}</p>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleEditAddress(address)}
                            className="text-sm text-amber-600 hover:text-amber-700"
                          >
                            Edit
                          </button>
                          <span className="text-gray-300 mx-1">|</span>
                          <button
                            onClick={() => handleDeleteAddress(address.id)}
                            className="text-sm text-red-600 hover:text-red-700"
                          >
                            Delete
                          </button>
                          {!address.is_default && (
                            <>
                              <span className="text-gray-300 mx-1">|</span>
                              <button
                                onClick={() => handleSetDefault(address.id)}
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
