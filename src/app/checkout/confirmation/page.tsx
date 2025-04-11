'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore, useCheckoutStore } from '@/lib/store';
import { getOrderById, getOrderItems, getProductById } from '@/lib/api';
import { Order, OrderItem, Product } from '@/types/database.types';
import { toast } from 'react-hot-toast';

export default function ConfirmationPage() {
  const router = useRouter();
  const { userId } = useAuthStore();
  const { orderId, clearCheckout } = useCheckoutStore();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (!userId) {
      router.push('/auth/signin?redirect=/account/orders');
      return;
    }
    
    if (!orderId) {
      // If no order ID in store, redirect to orders page
      router.push('/account/orders');
      return;
    }
    
    const loadOrderDetails = async () => {
      setLoading(true);
      try {
        // Load order details
        const orderData = await getOrderById(orderId);
        if (!orderData) {
          toast.error('Order not found');
          router.push('/account/orders');
          return;
        }
        setOrder(orderData);
        
        // Load order items
        const items = await getOrderItems(orderId);
        setOrderItems(items);
        
        // Load product details for all order items
        const productPromises = items.map(item => getProductById(item.product_id));
        const productResults = await Promise.all(productPromises);
        const validProducts = productResults.filter(p => p !== null) as Product[];
        setProducts(validProducts);
        
        // Clear checkout data
        clearCheckout();
      } catch (error) {
        console.error('Error loading order details:', error);
        toast.error('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };
    
    loadOrderDetails();
  }, [userId, orderId, router, clearCheckout]);
  
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-pulse text-center">
          <p className="text-gray-500">Loading order confirmation...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
        <div className="p-8 text-center border-b border-gray-200">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-check text-green-600 text-2xl"></i>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Thank You for Your Order!</h2>
          <p className="text-gray-600">
            Your order #{order?.order_number || order?.id.substring(0, 8)} has been placed successfully.
          </p>
          <p className="text-gray-600 mt-2">
            A confirmation email has been sent to your email address.
          </p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3">Order Information</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-gray-600">
                  <span className="font-medium">Order Number:</span> #{order?.order_number || order?.id.substring(0, 8)}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Date:</span> {new Date(order?.created_at || '').toLocaleDateString()}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Status:</span> {order?.status.charAt(0).toUpperCase() + order?.status.slice(1)}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Payment Method:</span> {order?.payment_method}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Payment Status:</span> {order?.payment_status.charAt(0).toUpperCase() + order?.payment_status.slice(1)}
                </p>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3">Shipping Information</h3>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-gray-600">{order?.shipping_address}</p>
                <p className="text-gray-600">
                  {order?.shipping_city}, {order?.shipping_state} {order?.shipping_postal_code}
                </p>
                <p className="text-gray-600">{order?.shipping_country}</p>
              </div>
            </div>
          </div>
          
          <h3 className="text-lg font-medium text-gray-800 mb-3">Order Summary</h3>
          <div className="border rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orderItems.map((item) => {
                  const product = products.find(p => p.id === item.product_id);
                  return (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {product?.name || 'Product'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{item.quantity}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">${item.price.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">${(item.price * item.quantity).toFixed(2)}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={3} className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                    Subtotal
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-500">
                    ${order?.subtotal.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={3} className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                    Shipping
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-500">
                    ${order?.shipping_amount.toFixed(2)}
                  </td>
                </tr>
                {order?.discount_amount > 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                      Discount
                    </td>
                    <td className="px-6 py-3 text-sm text-gray-500">
                      -${order.discount_amount.toFixed(2)}
                    </td>
                  </tr>
                )}
                <tr>
                  <td colSpan={3} className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                    Tax
                  </td>
                  <td className="px-6 py-3 text-sm text-gray-500">
                    ${order?.tax_amount.toFixed(2)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={3} className="px-6 py-3 text-right text-sm font-bold text-gray-800">
                    Total
                  </td>
                  <td className="px-6 py-3 text-sm font-bold text-gray-800">
                    ${order?.total.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
      
      <div className="flex justify-center space-x-4 mb-8">
        <Link
          href="/account/orders"
          className="bg-amber-600 text-white px-6 py-3 rounded-md hover:bg-amber-700 font-medium"
        >
          View All Orders
        </Link>
        <Link
          href="/products"
          className="bg-white text-amber-600 border border-amber-600 px-6 py-3 rounded-md hover:bg-amber-50 font-medium"
        >
          Continue Shopping
        </Link>
      </div>
      
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 text-center">
        <h3 className="text-lg font-medium text-amber-800 mb-2">Need Help?</h3>
        <p className="text-amber-700 mb-4">
          If you have any questions about your order, please contact our customer service team.
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            href="/contact"
            className="text-amber-600 hover:text-amber-700 font-medium"
          >
            Contact Us
          </Link>
          <Link
            href="/faq"
            className="text-amber-600 hover:text-amber-700 font-medium"
          >
            FAQ
          </Link>
        </div>
      </div>
    </div>
  );
}
