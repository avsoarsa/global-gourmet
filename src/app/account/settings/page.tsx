'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuthStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/types/database.types';
import AccountSidebar from '@/components/account/AccountSidebar';
import { toast } from 'react-hot-toast';

export default function AccountSettingsPage() {
  const router = useRouter();
  const { isAuthenticated, userId } = useAuthStore();
  const { signOut } = useAuth();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'notifications' | 'privacy'>('profile');
  const [saving, setSaving] = useState(false);
  
  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [notificationForm, setNotificationForm] = useState({
    emailNewsletter: false,
    emailOrderUpdates: true,
    emailPromotions: false,
    smsOrderUpdates: false,
    smsPromotions: false,
  });
  
  useEffect(() => {
    if (!isAuthenticated || !userId) {
      router.push('/auth/signin?redirect=/account/settings');
      return;
    }
    
    const loadProfile = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (error) throw error;
        
        setProfile(data);
        
        if (data) {
          setProfileForm({
            firstName: data.first_name || '',
            lastName: data.last_name || '',
            email: data.email || '',
            phone: data.phone || '',
          });
          
          setNotificationForm({
            emailNewsletter: data.email_newsletter || false,
            emailOrderUpdates: data.email_order_updates || true,
            emailPromotions: data.email_promotions || false,
            smsOrderUpdates: data.sms_order_updates || false,
            smsPromotions: data.sms_promotions || false,
          });
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    
    loadProfile();
  }, [isAuthenticated, userId, router]);
  
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotificationForm(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) return;
    
    setSaving(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          first_name: profileForm.firstName,
          last_name: profileForm.lastName,
          phone: profileForm.phone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);
      
      if (error) throw error;
      
      toast.success('Profile updated successfully');
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };
  
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      toast.error('New passwords do not match');
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword,
      });
      
      if (error) throw error;
      
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      toast.success('Password updated successfully');
    } catch (err) {
      console.error('Error updating password:', err);
      setError('Failed to update password');
      toast.error('Failed to update password');
    } finally {
      setSaving(false);
    }
  };
  
  const handleNotificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) return;
    
    setSaving(true);
    setError(null);
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          email_newsletter: notificationForm.emailNewsletter,
          email_order_updates: notificationForm.emailOrderUpdates,
          email_promotions: notificationForm.emailPromotions,
          sms_order_updates: notificationForm.smsOrderUpdates,
          sms_promotions: notificationForm.smsPromotions,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);
      
      if (error) throw error;
      
      toast.success('Notification preferences updated');
    } catch (err) {
      console.error('Error updating notification preferences:', err);
      setError('Failed to update notification preferences');
      toast.error('Failed to update notification preferences');
    } finally {
      setSaving(false);
    }
  };
  
  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    
    if (!confirm('All your data will be permanently deleted. Are you absolutely sure?')) {
      return;
    }
    
    try {
      // In a real application, you would implement a secure account deletion process
      // This is a simplified example
      
      // Delete user profile
      await supabase
        .from('user_profiles')
        .delete()
        .eq('id', userId);
      
      // Delete user authentication
      await supabase.auth.admin.deleteUser(userId as string);
      
      // Sign out
      await signOut();
      
      // Redirect to home page
      router.push('/');
      
      toast.success('Your account has been deleted');
    } catch (err) {
      console.error('Error deleting account:', err);
      toast.error('Failed to delete account');
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
              <AccountSidebar activePage="settings" />
            </div>
            
            {/* Main Content */}
            <div className="md:w-3/4 lg:w-4/5">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800">Account Settings</h2>
                </div>
                
                {/* Tabs */}
                <div className="border-b border-gray-200">
                  <div className="flex overflow-x-auto">
                    <button
                      onClick={() => setActiveTab('profile')}
                      className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                        activeTab === 'profile'
                          ? 'border-b-2 border-amber-600 text-amber-600'
                          : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Profile Information
                    </button>
                    <button
                      onClick={() => setActiveTab('password')}
                      className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                        activeTab === 'password'
                          ? 'border-b-2 border-amber-600 text-amber-600'
                          : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Password
                    </button>
                    <button
                      onClick={() => setActiveTab('notifications')}
                      className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                        activeTab === 'notifications'
                          ? 'border-b-2 border-amber-600 text-amber-600'
                          : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Notifications
                    </button>
                    <button
                      onClick={() => setActiveTab('privacy')}
                      className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                        activeTab === 'privacy'
                          ? 'border-b-2 border-amber-600 text-amber-600'
                          : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Privacy & Security
                    </button>
                  </div>
                </div>
                
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-600 mb-2"></div>
                    <p className="text-gray-600">Loading settings...</p>
                  </div>
                ) : (
                  <div className="p-6">
                    {/* Profile Information Tab */}
                    {activeTab === 'profile' && (
                      <form onSubmit={handleProfileSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                              First Name
                            </label>
                            <input
                              type="text"
                              id="firstName"
                              name="firstName"
                              value={profileForm.firstName}
                              onChange={handleProfileChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                          </div>
                          
                          <div>
                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                              Last Name
                            </label>
                            <input
                              type="text"
                              id="lastName"
                              name="lastName"
                              value={profileForm.lastName}
                              onChange={handleProfileChange}
                              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={profileForm.email}
                            disabled
                            className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100"
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            To change your email address, please contact customer support.
                          </p>
                        </div>
                        
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={profileForm.phone}
                            onChange={handleProfileChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                        
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            disabled={saving}
                            className={`bg-amber-600 text-white px-6 py-2 rounded-md hover:bg-amber-700 font-medium ${
                              saving ? 'opacity-70 cursor-not-allowed' : ''
                            }`}
                          >
                            {saving ? 'Saving...' : 'Save Changes'}
                          </button>
                        </div>
                      </form>
                    )}
                    
                    {/* Password Tab */}
                    {activeTab === 'password' && (
                      <form onSubmit={handlePasswordSubmit} className="space-y-6">
                        <div>
                          <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            Current Password
                          </label>
                          <input
                            type="password"
                            id="currentPassword"
                            name="currentPassword"
                            value={passwordForm.currentPassword}
                            onChange={handlePasswordChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                        
                        <div>
                          <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            New Password
                          </label>
                          <input
                            type="password"
                            id="newPassword"
                            name="newPassword"
                            value={passwordForm.newPassword}
                            onChange={handlePasswordChange}
                            required
                            minLength={8}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            Password must be at least 8 characters long and include a mix of letters, numbers, and symbols.
                          </p>
                        </div>
                        
                        <div>
                          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={passwordForm.confirmPassword}
                            onChange={handlePasswordChange}
                            required
                            minLength={8}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                        
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            disabled={saving}
                            className={`bg-amber-600 text-white px-6 py-2 rounded-md hover:bg-amber-700 font-medium ${
                              saving ? 'opacity-70 cursor-not-allowed' : ''
                            }`}
                          >
                            {saving ? 'Updating...' : 'Update Password'}
                          </button>
                        </div>
                      </form>
                    )}
                    
                    {/* Notifications Tab */}
                    {activeTab === 'notifications' && (
                      <form onSubmit={handleNotificationSubmit} className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium text-gray-800 mb-4">Email Notifications</h3>
                          
                          <div className="space-y-4">
                            <div className="flex items-start">
                              <div className="flex items-center h-5">
                                <input
                                  type="checkbox"
                                  id="emailOrderUpdates"
                                  name="emailOrderUpdates"
                                  checked={notificationForm.emailOrderUpdates}
                                  onChange={handleNotificationChange}
                                  className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                                />
                              </div>
                              <div className="ml-3 text-sm">
                                <label htmlFor="emailOrderUpdates" className="font-medium text-gray-700">
                                  Order Updates
                                </label>
                                <p className="text-gray-500">
                                  Receive emails about your order status, shipping, and delivery.
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-start">
                              <div className="flex items-center h-5">
                                <input
                                  type="checkbox"
                                  id="emailNewsletter"
                                  name="emailNewsletter"
                                  checked={notificationForm.emailNewsletter}
                                  onChange={handleNotificationChange}
                                  className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                                />
                              </div>
                              <div className="ml-3 text-sm">
                                <label htmlFor="emailNewsletter" className="font-medium text-gray-700">
                                  Newsletter
                                </label>
                                <p className="text-gray-500">
                                  Receive our weekly newsletter with new products, recipes, and tips.
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-start">
                              <div className="flex items-center h-5">
                                <input
                                  type="checkbox"
                                  id="emailPromotions"
                                  name="emailPromotions"
                                  checked={notificationForm.emailPromotions}
                                  onChange={handleNotificationChange}
                                  className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                                />
                              </div>
                              <div className="ml-3 text-sm">
                                <label htmlFor="emailPromotions" className="font-medium text-gray-700">
                                  Promotions and Offers
                                </label>
                                <p className="text-gray-500">
                                  Receive emails about special offers, discounts, and promotions.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-medium text-gray-800 mb-4">SMS Notifications</h3>
                          
                          <div className="space-y-4">
                            <div className="flex items-start">
                              <div className="flex items-center h-5">
                                <input
                                  type="checkbox"
                                  id="smsOrderUpdates"
                                  name="smsOrderUpdates"
                                  checked={notificationForm.smsOrderUpdates}
                                  onChange={handleNotificationChange}
                                  className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                                />
                              </div>
                              <div className="ml-3 text-sm">
                                <label htmlFor="smsOrderUpdates" className="font-medium text-gray-700">
                                  Order Updates
                                </label>
                                <p className="text-gray-500">
                                  Receive text messages about your order status and delivery.
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-start">
                              <div className="flex items-center h-5">
                                <input
                                  type="checkbox"
                                  id="smsPromotions"
                                  name="smsPromotions"
                                  checked={notificationForm.smsPromotions}
                                  onChange={handleNotificationChange}
                                  className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                                />
                              </div>
                              <div className="ml-3 text-sm">
                                <label htmlFor="smsPromotions" className="font-medium text-gray-700">
                                  Promotions and Offers
                                </label>
                                <p className="text-gray-500">
                                  Receive text messages about special offers and promotions.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            disabled={saving}
                            className={`bg-amber-600 text-white px-6 py-2 rounded-md hover:bg-amber-700 font-medium ${
                              saving ? 'opacity-70 cursor-not-allowed' : ''
                            }`}
                          >
                            {saving ? 'Saving...' : 'Save Preferences'}
                          </button>
                        </div>
                      </form>
                    )}
                    
                    {/* Privacy & Security Tab */}
                    {activeTab === 'privacy' && (
                      <div className="space-y-8">
                        <div>
                          <h3 className="text-lg font-medium text-gray-800 mb-2">Privacy Settings</h3>
                          <p className="text-gray-600 mb-4">
                            Manage how your personal information is used and shared.
                          </p>
                          
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-gray-700 mb-2">
                              Your data is protected in accordance with our Privacy Policy.
                            </p>
                            <a href="/privacy-policy" className="text-amber-600 hover:text-amber-700">
                              View Privacy Policy
                            </a>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-lg font-medium text-gray-800 mb-2">Account Security</h3>
                          <p className="text-gray-600 mb-4">
                            Manage your account security settings.
                          </p>
                          
                          <div className="space-y-4">
                            <div className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                              <div>
                                <h4 className="font-medium text-gray-800">Two-Factor Authentication</h4>
                                <p className="text-gray-600 text-sm">
                                  Add an extra layer of security to your account.
                                </p>
                              </div>
                              <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200">
                                Enable
                              </button>
                            </div>
                            
                            <div className="flex justify-between items-center p-4 border border-gray-200 rounded-lg">
                              <div>
                                <h4 className="font-medium text-gray-800">Login History</h4>
                                <p className="text-gray-600 text-sm">
                                  View your recent login activity.
                                </p>
                              </div>
                              <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200">
                                View
                              </button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="border-t border-gray-200 pt-6">
                          <h3 className="text-lg font-medium text-red-600 mb-2">Danger Zone</h3>
                          <p className="text-gray-600 mb-4">
                            Permanently delete your account and all associated data.
                          </p>
                          
                          <button
                            onClick={handleDeleteAccount}
                            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                          >
                            Delete Account
                          </button>
                        </div>
                      </div>
                    )}
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
