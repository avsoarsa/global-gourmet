'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuthStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { UserProfile, Order } from '@/types/database.types';
import AccountSidebar from '@/components/account/AccountSidebar';
import AccountOverview from '@/components/account/AccountOverview';

export default function AccountPage() {
  const router = useRouter();
  const { isAuthenticated, userId } = useAuthStore();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !userId) {
      router.push('/auth/signin?redirect=/account');
      return;
    }

    const loadUserData = async () => {
      setLoading(true);
      try {
        // Load user profile
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Load recent orders
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(5);

        if (ordersError) throw ordersError;
        setRecentOrders(ordersData || []);
      } catch (err) {
        console.error('Error loading user data:', err);
        setError('Failed to load account data');
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [isAuthenticated, userId, router]);



  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  if (loading) {
    return (
      <div className="font-sans bg-gray-50 min-h-screen">
        <Header />
        <main className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-1/4 lg:w-1/5">
                <div className="bg-white rounded-lg shadow-sm h-64 animate-pulse"></div>
              </div>
              <div className="md:w-3/4 lg:w-4/5">
                <div className="bg-white rounded-lg shadow-sm h-64 animate-pulse"></div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
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
              <AccountSidebar activePage="overview" />
            </div>

            {/* Main Content */}
            <div className="md:w-3/4 lg:w-4/5">
              <AccountOverview profile={profile} recentOrders={recentOrders} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
