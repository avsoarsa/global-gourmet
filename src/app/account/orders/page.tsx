'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuthStore } from '@/lib/store';
import { getUserOrders } from '@/lib/api';
import { Order } from '@/types/database.types';

export default function OrdersPage() {
  const router = useRouter();
  const { isAuthenticated, userId } = useAuthStore();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!isAuthenticated || !userId) {
      router.push('/auth/signin?redirect=/account/orders');
      return;
    }
    
    const loadOrders = async () => {
      setLoading(true);
      try {
        const ordersData = await getUserOrders(userId);
        setOrders(ordersData);
      } catch (err) {
        console.error('Error loading orders:', err);
        setError('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };
    
    loadOrders();
  }, [isAuthenticated, userId, router]);
  
  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }
  
  if (loading) {
    return (
      <div className="font-sans bg-gray-50">
        <Header />
        <main className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex justify-center py-12">
              <div className="animate-pulse text-center">
                <p className="text-gray-500">Loading orders...</p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  return (
    <div className="font-sans bg-gray-50">
      <Header />
      <main className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">My Orders</h1>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}
            
            {orders.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
                <Link
                  href="/products"
                  className="bg-amber-600 text-white px-6 py-3 rounded-md hover:bg-amber-700 font-medium inline-block"
                >
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800">Order History</h2>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {orders.map((order) => (
                    <div key={order.id} className="p-6">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-800">
                            Order #{order.id.substring(0, 8).toUpperCase()}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Placed on {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        
                        <div className="mt-2 md:mt-0">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            order.status === 'delivered'
                              ? 'bg-green-100 text-green-800'
                              : order.status === 'processing'
                              ? 'bg-blue-100 text-blue-800'
                              : order.status === 'shipped'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                        <div>
                          <p className="text-gray-600">
                            <span className="font-medium">Total:</span> ${order.total_amount.toFixed(2)}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-medium">Payment:</span> {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                          </p>
                        </div>
                        
                        <div className="mt-4 md:mt-0">
                          <Link
                            href={`/account/orders/${order.id}`}
                            className="text-amber-600 hover:text-amber-700 font-medium"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
