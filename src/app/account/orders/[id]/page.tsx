'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuthStore } from '@/lib/store';
import { getOrderById, getOrderItems, getProductBySlug } from '@/lib/api';
import { Order, OrderItem, Product } from '@/types/database.types';

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;
  
  const { isAuthenticated, userId } = useAuthStore();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!isAuthenticated || !userId) {
      router.push(`/auth/signin?redirect=/account/orders/${orderId}`);
      return;
    }
    
    const loadOrderDetails = async () => {
      setLoading(true);
      try {
        // Load order
        const orderData = await getOrderById(orderId);
        
        if (!orderData) {
          setError('Order not found');
          setLoading(false);
          return;
        }
        
        // Check if order belongs to current user
        if (orderData.user_id !== userId) {
          setError('You do not have permission to view this order');
          setLoading(false);
          return;
        }
        
        setOrder(orderData);
        
        // Load order items
        const orderItemsData = await getOrderItems(orderId);
        setOrderItems(orderItemsData);
        
        // Load products for each order item
        const productsData: Record<string, Product> = {};
        
        for (const item of orderItemsData) {
          try {
            const product = await getProductBySlug(item.product_id);
            if (product) {
              productsData[item.product_id] = product;
            }
          } catch (err) {
            console.error(`Error loading product ${item.product_id}:`, err);
          }
        }
        
        setProducts(productsData);
      } catch (err) {
        console.error('Error loading order details:', err);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };
    
    loadOrderDetails();
  }, [isAuthenticated, userId, orderId, router]);
  
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
                <p className="text-gray-500">Loading order details...</p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (error || !order) {
    return (
      <div className="font-sans bg-gray-50">
        <Header />
        <main className="py-12">
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">Error</h1>
              <p className="text-gray-600 mb-6">{error || 'Order not found'}</p>
              <Link
                href="/account/orders"
                className="bg-amber-600 text-white px-6 py-3 rounded-md hover:bg-amber-700 font-medium inline-block"
              >
                Back to Orders
              </Link>
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
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-800">Order Details</h1>
              <Link
                href="/account/orders"
                className="text-amber-600 hover:text-amber-700 font-medium"
              >
                Back to Orders
              </Link>
            </div>
            
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
              <div className="p-6 border-b border-gray-200">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      Order #{order.id.substring(0, 8).toUpperCase()}
                    </h2>
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
              </div>
              
              <div className="p-6 border-b border-gray-200">
                <h3 className="font-bold text-gray-800 mb-4">Order Summary</h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order Status</span>
                    <span className="font-medium">
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Status</span>
                    <span className="font-medium">
                      {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment Method</span>
                    <span className="font-medium">{order.payment_method}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Amount</span>
                    <span className="font-medium">${order.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-b border-gray-200">
                <h3 className="font-bold text-gray-800 mb-4">Shipping Address</h3>
                
                <address className="not-italic text-gray-600">
                  {order.shipping_address}<br />
                  {order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}<br />
                  {order.shipping_country}
                </address>
              </div>
              
              <div className="p-6">
                <h3 className="font-bold text-gray-800 mb-4">Order Items</h3>
                
                <div className="divide-y divide-gray-200">
                  {orderItems.map((item) => {
                    const product = products[item.product_id];
                    
                    return (
                      <div key={item.id} className="py-4 flex items-center">
                        <div className="flex-shrink-0 w-16 h-16 relative">
                          {product ? (
                            <Image
                              src={product.image_url || 'https://via.placeholder.com/64'}
                              alt={product.name}
                              fill
                              sizes="64px"
                              className="object-cover rounded"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gray-200 rounded flex items-center justify-center">
                              <span className="text-gray-500 text-xs">No image</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="ml-4 flex-1">
                          <h4 className="font-medium text-gray-800">
                            {product ? product.name : 'Product not available'}
                          </h4>
                          <p className="text-sm text-gray-500">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-medium text-gray-800">
                            ${item.price.toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500">
                            ${(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <Link
                href="/products"
                className="bg-amber-600 text-white px-6 py-3 rounded-md hover:bg-amber-700 font-medium inline-block"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
