'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CouponCode from '@/components/CouponCode';
import { useCartStore, useAuthStore } from '@/lib/store';
import { createOrder, addOrderItems, validateCoupon } from '@/lib/api';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, products, totalPrice, clearCart } = useCartStore();
  const { isAuthenticated, userId } = useAuthStore();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    paymentMethod: 'credit-card',
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCvc: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponType, setCouponType] = useState<'percentage' | 'fixed' | null>(null);
  const [couponCode, setCouponCode] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyCoupon = async (discount: number, discountType: string, code: string, id: string) => {
    setCouponDiscount(discount);
    setCouponType(discountType as 'percentage' | 'fixed');
    setCouponCode(code);
    setCouponId(id);

    // Log the applied coupon for debugging
    console.log(`Applied coupon: ${code}, type: ${discountType}, value: ${discount}, id: ${id}`);
  };

  const handleRemoveCoupon = () => {
    setCouponDiscount(0);
    setCouponType(null);
    setCouponCode(null);
    setCouponId(null);
  };

  const [couponId, setCouponId] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);

  // Validate form fields
  const validateForm = () => {
    // Basic validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone ||
        !formData.address || !formData.city || !formData.state || !formData.postalCode ||
        !formData.country) {
      setError('Please fill in all required fields');
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Phone validation - basic check for numbers and common separators
    const phoneRegex = /^[0-9\-\+\(\)\s]+$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('Please enter a valid phone number');
      return false;
    }

    // Credit card validation if payment method is credit card
    if (formData.paymentMethod === 'credit-card') {
      // Basic credit card number validation (numbers only, 13-19 digits)
      const cardNumberRegex = /^[0-9]{13,19}$/;
      if (!cardNumberRegex.test(formData.cardNumber.replace(/\s/g, ''))) {
        setError('Please enter a valid credit card number');
        return false;
      }

      // Expiry date validation (MM/YY format)
      const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
      if (!expiryRegex.test(formData.cardExpiry)) {
        setError('Please enter a valid expiry date (MM/YY)');
        return false;
      }

      // CVC validation (3-4 digits)
      const cvcRegex = /^[0-9]{3,4}$/;
      if (!cvcRegex.test(formData.cardCvc)) {
        setError('Please enter a valid CVC code');
        return false;
      }
    }

    return true;
  };

  // Process payment (simulated)
  const processPayment = async () => {
    setProcessingPayment(true);

    // Simulate payment processing delay
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        // Simulate successful payment (in a real app, this would call a payment gateway API)
        const success = true;
        setProcessingPayment(false);
        resolve(success);
      }, 1500);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !userId) {
      setError('You must be logged in to complete checkout');
      return;
    }

    if (items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Process payment
      const paymentSuccessful = await processPayment();

      if (!paymentSuccessful) {
        throw new Error('Payment processing failed');
      }

      // 2. Create order
      const order = await createOrder(
        userId,
        subtotal, // Original subtotal before discount
        discount, // Discount amount
        tax, // Tax amount
        0, // Shipping amount (free shipping for now)
        {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
        },
        formData.paymentMethod,
        couponCode, // Pass the coupon code if applied
        couponId // Pass the coupon ID if available
      );

      // 3. Add order items
      const orderItems = items.map((item) => ({
        productId: item.product_id,
        quantity: item.quantity,
        price: products[item.product_id]?.price || 0,
      }));

      await addOrderItems(order.id, orderItems);

      // 4. Clear cart
      clearCart();

      // 5. Redirect to success page
      router.push(`/checkout/success?orderId=${order.id}`);
    } catch (err) {
      console.error('Error processing checkout:', err);
      setError('Failed to process your order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate totals
  const subtotal = totalPrice();

  // Calculate discount
  const discount = couponType === 'percentage'
    ? subtotal * (couponDiscount / 100)
    : couponType === 'fixed'
    ? couponDiscount
    : 0;

  const discountedSubtotal = Math.max(0, subtotal - discount);
  const tax = discountedSubtotal * 0.1;
  const total = discountedSubtotal + tax;

  if (!isAuthenticated) {
    return (
      <div className="font-sans bg-gray-50">
        <Header />
        <main className="py-12">
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">Sign In Required</h1>
              <p className="text-gray-600 mb-6">
                You need to sign in to complete your purchase.
              </p>
              <button
                onClick={() => router.push('/auth/signin?redirect=/checkout')}
                className="bg-amber-600 text-white px-6 py-3 rounded-md hover:bg-amber-700 font-medium"
              >
                Sign In
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="font-sans bg-gray-50">
        <Header />
        <main className="py-12">
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">Your Cart is Empty</h1>
              <p className="text-gray-600 mb-6">
                Add some products to your cart before proceeding to checkout.
              </p>
              <button
                onClick={() => router.push('/products')}
                className="bg-amber-600 text-white px-6 py-3 rounded-md hover:bg-amber-700 font-medium"
              >
                Shop Now
              </button>
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
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Checkout</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Checkout Form */}
            <div className="lg:w-2/3">
              <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800">Shipping Information</h2>
                </div>

                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-gray-700 mb-1">First Name</label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-gray-700 mb-1">Last Name</label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="email" className="block text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-gray-700 mb-1">Phone</label>
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
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-gray-700 mb-1">Address</label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-gray-700 mb-1">City</label>
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
                      <label htmlFor="state" className="block text-gray-700 mb-1">State/Province</label>
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
                    <div>
                      <label htmlFor="postalCode" className="block text-gray-700 mb-1">Postal Code</label>
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
                  </div>

                  <div>
                    <label htmlFor="country" className="block text-gray-700 mb-1">Country</label>
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

                <div className="p-6 border-t border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800 mb-4">Payment Method</h2>

                  <div className="space-y-4">
                    <div>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="credit-card"
                          checked={formData.paymentMethod === 'credit-card'}
                          onChange={handleChange}
                          className="mr-2"
                        />
                        <span>Credit Card</span>
                      </label>
                    </div>

                    {formData.paymentMethod === 'credit-card' && (
                      <div className="pl-6 space-y-4">
                        <div>
                          <label htmlFor="cardNumber" className="block text-gray-700 mb-1">Card Number</label>
                          <input
                            type="text"
                            id="cardNumber"
                            name="cardNumber"
                            value={formData.cardNumber}
                            onChange={handleChange}
                            placeholder="1234 5678 9012 3456"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </div>

                        <div>
                          <label htmlFor="cardName" className="block text-gray-700 mb-1">Name on Card</label>
                          <input
                            type="text"
                            id="cardName"
                            name="cardName"
                            value={formData.cardName}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="cardExpiry" className="block text-gray-700 mb-1">Expiry Date</label>
                            <input
                              type="text"
                              id="cardExpiry"
                              name="cardExpiry"
                              value={formData.cardExpiry}
                              onChange={handleChange}
                              placeholder="MM/YY"
                              required
                              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                          </div>
                          <div>
                            <label htmlFor="cardCvc" className="block text-gray-700 mb-1">CVC</label>
                            <input
                              type="text"
                              id="cardCvc"
                              name="cardCvc"
                              value={formData.cardCvc}
                              onChange={handleChange}
                              placeholder="123"
                              required
                              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="paypal"
                          checked={formData.paymentMethod === 'paypal'}
                          onChange={handleChange}
                          className="mr-2"
                        />
                        <span>PayPal</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full bg-amber-600 text-white px-6 py-3 rounded-md hover:bg-amber-700 font-medium ${
                      loading ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? (
                      processingPayment ? 'Processing Payment...' : 'Creating Order...'
                    ) : 'Place Order'}
                  </button>
                </div>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">Order Summary</h2>

                <div className="space-y-4 mb-6">
                  {items.map((item) => {
                    const product = products[item.product_id];
                    if (!product) return null;

                    return (
                      <div key={item.id} className="flex items-center">
                        <div className="w-16 h-16 relative flex-shrink-0">
                          <img
                            src={product.image_url || 'https://via.placeholder.com/64'}
                            alt={product.name}
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                        <div className="ml-4 flex-1">
                          <h3 className="text-sm font-medium text-gray-800">{product.name}</h3>
                          <p className="text-sm text-gray-600">
                            {item.quantity} x ${product.price.toFixed(2)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-800">
                            ${(product.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <CouponCode
                  onApply={handleApplyCoupon}
                  onRemove={handleRemoveCoupon}
                  subtotal={subtotal}
                />

                <div className="border-t border-gray-200 pt-4 space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount {couponType === 'percentage' ? `(${couponDiscount}%)` : ''}</span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">$0.00</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax (10%)</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>

                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
