'use client';

import { useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore, useCartStore } from '@/lib/store';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface CheckoutLayoutProps {
  children: ReactNode;
}

export default function CheckoutLayout({ children }: CheckoutLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();
  const { items: cartItems } = useCartStore();
  const [loading, setLoading] = useState(true);

  // Define checkout steps
  const steps = [
    { id: 'cart', label: 'Cart', path: '/cart' },
    { id: 'shipping', label: 'Shipping', path: '/checkout/shipping' },
    { id: 'payment', label: 'Payment', path: '/checkout/payment' },
    { id: 'review', label: 'Review', path: '/checkout/review' },
    { id: 'confirmation', label: 'Confirmation', path: '/checkout/confirmation' },
  ];

  // Determine current step
  const getCurrentStep = () => {
    if (pathname === '/cart') return 'cart';
    if (pathname === '/checkout/shipping') return 'shipping';
    if (pathname === '/checkout/payment') return 'payment';
    if (pathname === '/checkout/review') return 'review';
    if (pathname === '/checkout/confirmation') return 'confirmation';
    return '';
  };

  const currentStep = getCurrentStep();
  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  useEffect(() => {
    // Check if user is authenticated and cart has items
    const checkRequirements = async () => {
      setLoading(true);
      
      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        router.push(`/auth/signin?redirect=${pathname}`);
        return;
      }
      
      // If cart is empty and not on confirmation page, redirect to cart
      if (cartItems.length === 0 && currentStep !== 'confirmation') {
        router.push('/cart');
        return;
      }
      
      setLoading(false);
    };
    
    checkRequirements();
  }, [isAuthenticated, cartItems.length, pathname, router, currentStep]);

  if (loading) {
    return (
      <div className="font-sans bg-gray-50 min-h-screen">
        <Header />
        <main className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            <div className="flex justify-center py-12">
              <div className="animate-pulse text-center">
                <p className="text-gray-500">Loading checkout...</p>
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
          {/* Checkout Progress */}
          <div className="mb-8">
            <div className="hidden md:flex items-center justify-center">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  {/* Step Circle */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      index <= currentStepIndex
                        ? 'bg-amber-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {index + 1}
                  </div>
                  
                  {/* Step Label */}
                  <div className="ml-2 mr-6">
                    <span
                      className={`text-sm font-medium ${
                        index <= currentStepIndex ? 'text-gray-800' : 'text-gray-500'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  
                  {/* Connector Line (except for last step) */}
                  {index < steps.length - 1 && (
                    <div
                      className={`w-12 h-1 ${
                        index < currentStepIndex ? 'bg-amber-600' : 'bg-gray-200'
                      }`}
                    ></div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Mobile Progress */}
            <div className="md:hidden">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Step {currentStepIndex + 1} of {steps.length}
                </div>
                <div className="text-sm font-medium text-gray-800">
                  {steps[currentStepIndex]?.label}
                </div>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-amber-600 h-2 rounded-full"
                  style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
}
