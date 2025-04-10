'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
// Using Font Awesome icons instead of React icons
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useCartStore } from '@/lib/store';

export default function CartPage() {
  const { items, products, removeItem, updateQuantity, totalItems, totalPrice } = useCartStore();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const handleQuantityChange = (id: string, quantity: number) => {
    if (quantity > 0) {
      updateQuantity(id, quantity);
    }
  };

  const handleRemoveItem = (id: string) => {
    removeItem(id);
  };

  const handleCheckout = () => {
    setCheckoutLoading(true);

    // Simulate checkout process
    setTimeout(() => {
      setCheckoutLoading(false);
      window.location.href = '/checkout';
    }, 1000);
  };

  if (items.length === 0) {
    return (
      <div className="font-sans bg-gray-50">
        <Header />
        <main className="py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Your Cart</h1>

            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="text-gray-500 mb-6">
                <i className="fas fa-shopping-cart mx-auto text-5xl mb-4 text-gray-300"></i>
                <p className="text-xl">Your cart is empty</p>
                <p className="mt-2">Add some products to your cart and come back here to complete your purchase.</p>
              </div>

              <Link
                href="/products"
                className="bg-amber-600 text-white px-6 py-3 rounded-md hover:bg-amber-700 font-medium inline-block"
              >
                Continue Shopping
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
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Your Cart</h1>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="lg:w-2/3">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800">
                    Cart Items ({totalItems()})
                  </h2>
                </div>

                <div className="divide-y divide-gray-200">
                  {items.map((item) => {
                    const product = products[item.product_id];
                    if (!product) return null;

                    return (
                      <div key={item.id} className="p-6 flex flex-col sm:flex-row items-center">
                        <div className="sm:w-20 sm:h-20 w-32 h-32 relative mb-4 sm:mb-0">
                          <Image
                            src={product.image_url || 'https://via.placeholder.com/80'}
                            alt={product.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 80px"
                            className="object-cover rounded"
                          />
                        </div>

                        <div className="sm:ml-6 flex-1">
                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                            <h3 className="text-lg font-bold text-gray-800 mb-2 sm:mb-0">
                              {product.name}
                            </h3>
                            <p className="font-bold text-gray-800">
                              ${(product.price * item.quantity).toFixed(2)}
                            </p>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-4">
                            <div className="flex items-center mb-4 sm:mb-0">
                              <span className="text-gray-600 mr-3">Quantity:</span>
                              <div className="flex items-center">
                                <button
                                  onClick={() => item.quantity > 1 && handleQuantityChange(item.id, item.quantity - 1)}
                                  className="bg-gray-200 text-gray-700 px-3 py-1 rounded-l-md"
                                >
                                  -
                                </button>
                                <input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                                  className="w-12 text-center border-t border-b border-gray-200 py-1"
                                />
                                <button
                                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                  className="bg-gray-200 text-gray-700 px-3 py-1 rounded-r-md"
                                >
                                  +
                                </button>
                              </div>
                            </div>

                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-red-500 hover:text-red-700 flex items-center"
                            >
                              <i className="fas fa-trash mr-1"></i>
                              <span>Remove</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-6 border-t border-gray-200">
                  <Link
                    href="/products"
                    className="text-amber-600 hover:text-amber-700 flex items-center"
                  >
                    <i className="fas fa-arrow-left mr-2"></i>
                    <span>Continue Shopping</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h2>

                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${totalPrice().toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">$0.00</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">${(totalPrice() * 0.1).toFixed(2)}</span>
                  </div>

                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>${(totalPrice() + totalPrice() * 0.1).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={checkoutLoading}
                  className={`w-full mt-6 bg-amber-600 text-white px-6 py-3 rounded-md hover:bg-amber-700 font-medium ${
                    checkoutLoading ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {checkoutLoading ? 'Processing...' : 'Proceed to Checkout'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
