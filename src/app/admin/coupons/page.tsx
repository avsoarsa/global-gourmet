'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/AdminLayout';
import { useAuthStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { Coupon } from '@/types/database.types';

export default function AdminCouponsPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAuthStore();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 0,
    minimum_order_amount: 0,
    is_active: true,
    start_date: '',
    end_date: '',
    usage_limit: 0
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/signin?redirect=/admin/coupons');
      return;
    }

    if (!isAdmin) {
      router.push('/');
      return;
    }

    fetchCoupons();
  }, [isAuthenticated, isAdmin, router]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (err) {
      console.error('Error fetching coupons:', err);
      setError('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (name === 'discount_value' || name === 'minimum_order_amount' || name === 'usage_limit') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      // Validate form data
      if (!formData.code.trim()) {
        setError('Coupon code is required');
        return;
      }
      
      if (formData.discount_value <= 0) {
        setError('Discount value must be greater than 0');
        return;
      }
      
      if (formData.discount_type === 'percentage' && formData.discount_value > 100) {
        setError('Percentage discount cannot exceed 100%');
        return;
      }
      
      // Format dates
      const formattedData = {
        ...formData,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        usage_limit: formData.usage_limit || null
      };
      
      if (editingCoupon) {
        // Update existing coupon
        const { error } = await supabase
          .from('coupons')
          .update(formattedData)
          .eq('id', editingCoupon.id);
          
        if (error) throw error;
      } else {
        // Create new coupon
        const { error } = await supabase
          .from('coupons')
          .insert({
            ...formattedData,
            usage_count: 0
          });
          
        if (error) throw error;
      }
      
      // Reset form and refresh coupons
      resetForm();
      fetchCoupons();
      setError(null);
    } catch (err) {
      console.error('Error saving coupon:', err);
      setError('Failed to save coupon');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      minimum_order_amount: coupon.minimum_order_amount,
      is_active: coupon.is_active,
      start_date: coupon.start_date ? new Date(coupon.start_date).toISOString().split('T')[0] : '',
      end_date: coupon.end_date ? new Date(coupon.end_date).toISOString().split('T')[0] : '',
      usage_limit: coupon.usage_limit || 0
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;
    
    try {
      setLoading(true);
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Refresh coupons
      fetchCoupons();
    } catch (err) {
      console.error('Error deleting coupon:', err);
      setError('Failed to delete coupon');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: 0,
      minimum_order_amount: 0,
      is_active: true,
      start_date: '',
      end_date: '',
      usage_limit: 0
    });
    setEditingCoupon(null);
    setShowForm(false);
  };

  const toggleCouponStatus = async (coupon: Coupon) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('coupons')
        .update({ is_active: !coupon.is_active })
        .eq('id', coupon.id);
        
      if (error) throw error;
      
      // Refresh coupons
      fetchCoupons();
    } catch (err) {
      console.error('Error updating coupon status:', err);
      setError('Failed to update coupon status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Coupon Management</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700"
          >
            {showForm ? 'Cancel' : 'Add New Coupon'}
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">
              {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="code" className="block text-gray-700 mb-1">Coupon Code*</label>
                  <input
                    type="text"
                    id="code"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="discount_type" className="block text-gray-700 mb-1">Discount Type*</label>
                  <select
                    id="discount_type"
                    name="discount_type"
                    value={formData.discount_type}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="discount_value" className="block text-gray-700 mb-1">
                    Discount Value* ({formData.discount_type === 'percentage' ? '%' : '$'})
                  </label>
                  <input
                    type="number"
                    id="discount_value"
                    name="discount_value"
                    value={formData.discount_value}
                    onChange={handleChange}
                    min="0"
                    max={formData.discount_type === 'percentage' ? 100 : undefined}
                    step="0.01"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="minimum_order_amount" className="block text-gray-700 mb-1">
                    Minimum Order Amount ($)
                  </label>
                  <input
                    type="number"
                    id="minimum_order_amount"
                    name="minimum_order_amount"
                    value={formData.minimum_order_amount}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="usage_limit" className="block text-gray-700 mb-1">
                    Usage Limit (0 = unlimited)
                  </label>
                  <input
                    type="number"
                    id="usage_limit"
                    name="usage_limit"
                    value={formData.usage_limit}
                    onChange={handleChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="start_date" className="block text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    id="start_date"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="end_date" className="block text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    id="end_date"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="description" className="block text-gray-700 mb-1">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label htmlFor="is_active" className="text-gray-700">Active</label>
              </div>
              
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 ${
                    loading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? 'Saving...' : 'Save Coupon'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">All Coupons</h2>
          </div>
          
          {loading && !coupons.length ? (
            <div className="p-6 text-center text-gray-500">Loading coupons...</div>
          ) : coupons.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No coupons found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min. Order</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Validity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usage</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {coupons.map((coupon) => (
                    <tr key={coupon.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{coupon.code}</div>
                        {coupon.description && (
                          <div className="text-sm text-gray-500">{coupon.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {coupon.discount_type === 'percentage'
                          ? `${coupon.discount_value}%`
                          : `$${coupon.discount_value.toFixed(2)}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        ${coupon.minimum_order_amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {coupon.start_date || coupon.end_date ? (
                          <div className="text-sm">
                            {coupon.start_date && (
                              <div>From: {new Date(coupon.start_date).toLocaleDateString()}</div>
                            )}
                            {coupon.end_date && (
                              <div>To: {new Date(coupon.end_date).toLocaleDateString()}</div>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">No date restrictions</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          {coupon.usage_count} / {coupon.usage_limit || '∞'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            coupon.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {coupon.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => toggleCouponStatus(coupon)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          {coupon.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleEdit(coupon)}
                          className="text-amber-600 hover:text-amber-900 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(coupon.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
