'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore, useCartStore, useCheckoutStore } from '@/lib/store';
import { createOrder, addOrderItems, getProductById } from '@/lib/api';
import { Product } from '@/types/database.types';
import { toast } from 'react-hot-toast';
import { calculateTax, TaxLocation } from '@/lib/tax-calculation';
import { checkInventory, reserveInventory } from '@/lib/inventory';
import { validateDiscountCode, applyDiscountToOrder } from '@/lib/discounts';

export default function ReviewPage() {
  const router = useRouter();
  const { userId } = useAuthStore();
  const { items: cartItems, clearCart } = useCartStore();
  const {
    shippingAddress,
    shippingMethod,
    paymentMethod,
    billingAddress,
    setOrderId
  } = useCheckoutStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [taxRate, setTaxRate] = useState(0);
  const [discountCode, setDiscountCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [discountMessage, setDiscountMessage] = useState<string | null>(null);
  const [applyingDiscount, setApplyingDiscount] = useState(false);
  const [inventoryStatus, setInventoryStatus] = useState<{success: boolean; message: string | null}>({success: true, message: null});
  const [total, setTotal] = useState(0);

  useEffect(() => {
    // Check if all required information is available
    if (!shippingAddress || !shippingMethod || !paymentMethod || !billingAddress) {
      router.push('/checkout/shipping');
      return;
    }

    const loadProducts = async () => {
      setLoading(true);
      try {
        // Load product details for all cart items
        const productPromises = cartItems.map(item => getProductById(item.productId));
        const productResults = await Promise.all(productPromises);
        const validProducts = productResults.filter(p => p !== null) as Product[];
        setProducts(validProducts);

        // Calculate subtotal
        const calculatedSubtotal = cartItems.reduce((sum, item) => {
          const product = validProducts.find(p => p.id === item.productId);
          return sum + (product ? (product.sale_price || product.price) * item.quantity : 0);
        }, 0);
        setSubtotal(calculatedSubtotal);

        // Check inventory
        const inventoryCheckResult = await checkInventory(
          cartItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity
          }))
        );

        setInventoryStatus({
          success: inventoryCheckResult.success,
          message: inventoryCheckResult.message || null
        });

        // Calculate tax based on shipping address
        const taxLocation: TaxLocation = {
          city: shippingAddress.city,
          state: shippingAddress.state,
          zipCode: shippingAddress.postal_code,
          country: shippingAddress.country
        };

        const taxResult = await calculateTax(taxLocation, calculatedSubtotal);
        setTax(taxResult.taxAmount);
        setTaxRate(taxResult.taxRate);

        // Calculate total
        const calculatedTotal = calculatedSubtotal + taxResult.taxAmount + (shippingMethod?.price || 0) - discount;
        setTotal(calculatedTotal);
      } catch (error) {
        console.error('Error loading products:', error);
        toast.error('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [cartItems, shippingAddress, shippingMethod, paymentMethod, billingAddress, router, discount]);

  const handleApplyDiscount = async () => {
    if (!discountCode.trim()) {
      setDiscountMessage('Please enter a discount code');
      return;
    }

    setApplyingDiscount(true);
    setDiscountMessage(null);

    try {
      const result = await validateDiscountCode(discountCode, subtotal);

      if (result.valid && result.discount) {
        setDiscount(result.discountAmount);
        setDiscountMessage(result.message || 'Discount applied successfully');

        // Recalculate total
        const newTotal = subtotal + tax + (shippingMethod?.price || 0) - result.discountAmount;
        setTotal(newTotal);
      } else {
        setDiscountMessage(result.message || 'Invalid discount code');
        setDiscount(0);
      }
    } catch (error) {
      console.error('Error applying discount:', error);
      setDiscountMessage('Failed to apply discount code');
    } finally {
      setApplyingDiscount(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!userId || !shippingAddress || !shippingMethod || !paymentMethod || !billingAddress) {
      toast.error('Missing required information');
      return;
    }

    if (!inventoryStatus.success) {
      toast.error(inventoryStatus.message || 'Some items are out of stock');
      return;
    }

    setPlacingOrder(true);

    try {
      // Reserve inventory
      const inventoryReserved = await reserveInventory(
        cartItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity
        }))
      );

      if (!inventoryReserved) {
        toast.error('Failed to reserve inventory. Some items may have become unavailable.');
        setPlacingOrder(false);
        return;
      }

      // Create order
      const order = await createOrder(
        userId,
        subtotal,
        discount, // discount amount
        tax,
        shippingMethod.price,
        {
          address: shippingAddress.address_line1,
          city: shippingAddress.city,
          state: shippingAddress.state,
          postalCode: shippingAddress.postal_code,
          country: shippingAddress.country,
        },
        paymentMethod.card_type
      );

      // Add order items
      const orderItems = cartItems.map(item => {
        const product = products.find(p => p.id === item.productId);
        return {
          productId: item.productId,
          quantity: item.quantity,
          price: product ? (product.sale_price || product.price) : 0,
        };
      });

      await addOrderItems(order.id, orderItems);

      // Apply discount if any
      if (discount > 0 && discountCode) {
        const discountResult = await validateDiscountCode(discountCode, subtotal);
        if (discountResult.valid && discountResult.discount) {
          await applyDiscountToOrder(order.id, discountResult.discount.id, discount);
        }
      }

      // Save order ID to checkout store
      setOrderId(order.id);

      // Clear cart
      clearCart();

      // Send order confirmation email (this would be handled by a server function in a real app)
      // For now, we'll just simulate it
      console.log('Sending order confirmation email...');

      // Navigate to confirmation page
      router.push('/checkout/confirmation');
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error('Failed to place order');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-pulse text-center">
          <p className="text-gray-500">Loading order details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Review Your Order</h2>
          </div>

          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Items</h3>

            <div className="space-y-4">
              {cartItems.map((item) => {
                const product = products.find(p => p.id === item.productId);
                if (!product) return null;

                return (
                  <div key={item.id} className="flex border-b border-gray-200 pb-4">
                    <div className="w-20 h-20 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden relative">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <i className="fas fa-image text-2xl"></i>
                        </div>
                      )}
                    </div>

                    <div className="ml-4 flex-grow">
                      <div className="flex justify-between">
                        <h4 className="font-medium text-gray-800">{product.name}</h4>
                        <span className="font-medium text-gray-800">
                          ${((product.sale_price || product.price) * item.quantity).toFixed(2)}
                        </span>
                      </div>

                      <p className="text-gray-600">
                        ${(product.sale_price || product.price).toFixed(2)} x {item.quantity}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-medium text-gray-800">Shipping Information</h3>
            </div>

            <div className="p-4">
              <h4 className="font-medium text-gray-800">{shippingAddress?.full_name}</h4>
              <p className="text-gray-600">{shippingAddress?.address_line1}</p>
              {shippingAddress?.address_line2 && (
                <p className="text-gray-600">{shippingAddress.address_line2}</p>
              )}
              <p className="text-gray-600">
                {shippingAddress?.city}, {shippingAddress?.state} {shippingAddress?.postal_code}
              </p>
              <p className="text-gray-600">{shippingAddress?.country}</p>
              <p className="text-gray-600">{shippingAddress?.phone}</p>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-800">Shipping Method</h4>
                <p className="text-gray-600">{shippingMethod?.name} - ${shippingMethod?.price.toFixed(2)}</p>
                <p className="text-gray-600 text-sm">{shippingMethod?.description}</p>
              </div>

              <Link
                href="/checkout/shipping"
                className="text-sm text-amber-600 hover:text-amber-700 mt-4 inline-block"
              >
                Edit
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-medium text-gray-800">Payment Information</h3>
            </div>

            <div className="p-4">
              <div className="flex items-center">
                <i className={`fas fa-credit-card text-gray-600 mr-2`}></i>
                <h4 className="font-medium text-gray-800">
                  {paymentMethod?.card_type.charAt(0).toUpperCase() + paymentMethod?.card_type.slice(1)} •••• {paymentMethod?.last_four}
                </h4>
              </div>
              <p className="text-gray-600">
                {paymentMethod?.cardholder_name} | Expires {paymentMethod?.expiry_month}/{paymentMethod?.expiry_year.slice(-2)}
              </p>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="font-medium text-gray-800">Billing Address</h4>
                <p className="text-gray-600">{billingAddress?.full_name}</p>
                <p className="text-gray-600">{billingAddress?.address_line1}</p>
                {billingAddress?.address_line2 && (
                  <p className="text-gray-600">{billingAddress.address_line2}</p>
                )}
                <p className="text-gray-600">
                  {billingAddress?.city}, {billingAddress?.state} {billingAddress?.postal_code}
                </p>
                <p className="text-gray-600">{billingAddress?.country}</p>
              </div>

              <Link
                href="/checkout/payment"
                className="text-sm text-amber-600 hover:text-amber-700 mt-4 inline-block"
              >
                Edit
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Order Summary */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden sticky top-6">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Order Summary</h2>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>${shippingMethod?.price.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-gray-600">
              <span>Tax ({(taxRate * 100).toFixed(2)}%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>

            <div className="mt-4">
              <div className="flex">
                <input
                  type="text"
                  placeholder="Discount code"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  disabled={applyingDiscount}
                />
                <button
                  type="button"
                  onClick={handleApplyDiscount}
                  disabled={applyingDiscount || !discountCode.trim()}
                  className={`bg-amber-600 text-white px-4 py-2 rounded-r-md hover:bg-amber-700 ${applyingDiscount ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {applyingDiscount ? 'Applying...' : 'Apply'}
                </button>
              </div>
              {discountMessage && (
                <p className={`text-sm mt-1 ${discount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {discountMessage}
                </p>
              )}
            </div>

            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex justify-between font-bold text-gray-800">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {inventoryStatus.message && !inventoryStatus.success && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {inventoryStatus.message}
              </div>
            )}

            <div className="pt-4">
              <button
                onClick={handlePlaceOrder}
                disabled={placingOrder || !inventoryStatus.success}
                className={`w-full bg-amber-600 text-white py-3 rounded-md hover:bg-amber-700 font-medium ${
                  (placingOrder || !inventoryStatus.success) ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {placingOrder ? 'Processing...' : 'Place Order'}
              </button>

              <Link
                href="/checkout/payment"
                className="block text-center text-amber-600 hover:text-amber-700 mt-4"
              >
                Return to Payment
              </Link>
            </div>

            <div className="text-center text-sm text-gray-500 mt-4">
              <p>By placing your order, you agree to our</p>
              <div className="flex justify-center space-x-2 mt-1">
                <Link href="/terms" className="text-amber-600 hover:text-amber-700">
                  Terms of Service
                </Link>
                <span>and</span>
                <Link href="/privacy" className="text-amber-600 hover:text-amber-700">
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
