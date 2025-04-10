'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaUsers, FaBoxes, FaShoppingCart, FaChartLine, FaTachometerAlt, FaSignOutAlt, FaTicketAlt } from 'react-icons/fa';
import Header from '@/components/Header';
import { useAuthStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAuthStore();
  const { signOut } = useAuth();

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      router.push('/auth/signin?redirect=/admin');
      return;
    }

    const loadStats = async () => {
      setLoading(true);
      try {
        // Get total users
        const { count: userCount } = await supabase
          .from('user_profiles')
          .select('*', { count: 'exact', head: true });

        // Get total products
        const { count: productCount } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });

        // Get total orders
        const { count: orderCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true });

        // Get pending orders
        const { count: pendingOrderCount } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');

        setStats({
          totalUsers: userCount || 0,
          totalProducts: productCount || 0,
          totalOrders: orderCount || 0,
          pendingOrders: pendingOrderCount || 0,
        });
      } catch (err) {
        console.error('Error loading admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [isAuthenticated, isAdmin, router]);

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  if (!isAuthenticated || !isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 text-white admin-sidebar">
          <div className="p-4">
            <h2 className="text-xl font-bold">Admin Dashboard</h2>
          </div>
          <nav className="mt-4">
            <Link
              href="/admin"
              className="flex items-center px-4 py-3 bg-gray-900 text-white"
            >
              <FaTachometerAlt className="mr-3" />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/admin/products"
              className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700"
            >
              <FaBoxes className="mr-3" />
              <span>Products</span>
            </Link>
            <Link
              href="/admin/orders"
              className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700"
            >
              <FaShoppingCart className="mr-3" />
              <span>Orders</span>
            </Link>
            <Link
              href="/admin/users"
              className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700"
            >
              <FaUsers className="mr-3" />
              <span>Users</span>
            </Link>
            <Link
              href="/admin/coupons"
              className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700"
            >
              <FaTicketAlt className="mr-3" />
              <span>Coupons</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 w-full text-left"
            >
              <FaSignOutAlt className="mr-3" />
              <span>Sign Out</span>
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-pulse text-center">
                <p className="text-gray-500">Loading dashboard data...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow-md p-6 dashboard-card">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-amber-100 text-amber-600 mr-4">
                      <FaUsers className="text-xl" />
                    </div>
                    <div>
                      <p className="text-gray-500">Total Users</p>
                      <p className="text-2xl font-bold text-gray-800">{stats.totalUsers}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 dashboard-card">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                      <FaBoxes className="text-xl" />
                    </div>
                    <div>
                      <p className="text-gray-500">Total Products</p>
                      <p className="text-2xl font-bold text-gray-800">{stats.totalProducts}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 dashboard-card">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                      <FaShoppingCart className="text-xl" />
                    </div>
                    <div>
                      <p className="text-gray-500">Total Orders</p>
                      <p className="text-2xl font-bold text-gray-800">{stats.totalOrders}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 dashboard-card">
                  <div className="flex items-center">
                    <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
                      <FaChartLine className="text-xl" />
                    </div>
                    <div>
                      <p className="text-gray-500">Pending Orders</p>
                      <p className="text-2xl font-bold text-gray-800">{stats.pendingOrders}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>

                <div className="border-t border-gray-200 pt-4">
                  <p className="text-gray-600 text-center py-4">
                    This is a simplified admin dashboard. In a real application, this would show recent orders, user registrations, and other important activities.
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
