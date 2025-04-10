'use client';

import { useState } from 'react';
import { subscribeToProductNotifications } from '@/lib/api';

interface ProductNotificationFormProps {
  productId: string;
  productName: string;
}

export default function ProductNotificationForm({ productId, productName }: ProductNotificationFormProps) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const result = await subscribeToProductNotifications(email, productId);
      if (result) {
        setSuccess(true);
        setEmail('');
      } else {
        setError('Failed to subscribe. Please try again.');
      }
    } catch (err) {
      console.error('Error subscribing to notifications:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="font-bold text-green-800 mb-2">Thank You!</h3>
        <p className="text-green-700">
          We'll notify you at when {productName} is back in stock.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <h3 className="font-bold text-gray-800 mb-2">Get Notified</h3>
      <p className="text-gray-600 mb-4">
        We'll let you know when this product is back in stock.
      </p>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        <button
          type="submit"
          disabled={submitting}
          className={`bg-amber-600 text-white px-4 py-2 rounded-r-md hover:bg-amber-700 ${
            submitting ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {submitting ? 'Submitting...' : 'Notify Me'}
        </button>
      </form>
    </div>
  );
}
