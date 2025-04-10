'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
// Using Font Awesome icons instead of React icons
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getOrderById, getOrderItems, getProductById } from '@/lib/api';
import { Order, OrderItem, Product } from '@/types/database.types';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { useAuthStore } from '@/lib/store';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const { user } = useAuthStore();

  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    const loadOrderData = async () => {
      if (!orderId) {
        setError('Order ID not found');
        setLoading(false);
        return;
      }

      try {
        // Load order details
        const orderData = await getOrderById(orderId);
        setOrder(orderData);

        // Load order items
        const items = await getOrderItems(orderId);
        setOrderItems(items);

        // Load product details for each order item
        const productDetails: Record<string, Product> = {};
        for (const item of items) {
          try {
            const product = await getProductById(item.product_id);
            if (product) {
              productDetails[item.product_id] = product;
            }
          } catch (err) {
            console.error(`Error loading product ${item.product_id}:`, err);
          }
        }
        setProducts(productDetails);

        // Send order confirmation email if not already sent
        if (orderData && !emailSent && user?.email) {
          try {
            await sendOrderConfirmationEmail(
              user.email,
              orderData,
              items,
              productDetails,
              user.firstName || 'Valued Customer'
            );
            setEmailSent(true);
          } catch (err) {
            console.error('Error sending order confirmation email:', err);
            // Don't set an error for the user - the order was still successful
          }
        }
      } catch (err) {
        console.error('Error loading order:', err);
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    loadOrderData();
  }, [orderId, emailSent, user]);

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
              <p className="text-gray-600 mb-6">
                {error || 'Order not found. Please check your order history.'}
              </p>
              <Link
                href="/account/orders"
                className="bg-amber-600 text-white px-6 py-3 rounded-md hover:bg-amber-700 font-medium inline-block"
              >
                View Orders
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
          <div className="bg-white rounded-lg shadow-md p-8 text-center max-w-2xl mx-auto">
            <div className="text-green-500 mb-4">
              <i className="fas fa-check-circle mx-auto text-5xl"></i>
            </div>

            <h1 className="text-3xl font-bold text-gray-800 mb-4">Order Confirmed!</h1>

            <p className="text-gray-600 mb-6">
              Thank you for your purchase. Your order has been received and is being processed.
            </p>

            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <div className="flex justify-between mb-2">
                <span className="font-medium">Order Number:</span>
                <span>{order.id.substring(0, 8).toUpperCase()}</span>
              </div>

              <div className="flex justify-between mb-2">
                <span className="font-medium">Date:</span>
                <span>{new Date(order.created_at).toLocaleDateString()}</span>
              </div>

              <div className="flex justify-between mb-2">
                <span className="font-medium">Total:</span>
                <span>${order.total_amount.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span className="font-medium">Payment Method:</span>
                <span>{order.payment_method}</span>
              </div>
            </div>

            <p className="text-gray-600 mb-6">
              We'll send you a shipping confirmation email once your order ships.
            </p>

            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                href="/account/orders"
                className="bg-amber-600 text-white px-6 py-3 rounded-md hover:bg-amber-700 font-medium"
              >
                View Order
              </Link>

              <Link
                href="/products"
                className="border border-amber-600 text-amber-600 px-6 py-3 rounded-md hover:bg-amber-50 font-medium"
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
