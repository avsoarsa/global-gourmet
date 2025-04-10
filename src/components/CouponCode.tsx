'use client';

import { useState } from 'react';
import { validateCoupon } from '@/lib/api';

interface CouponCodeProps {
  onApply: (discount: number, discountType: string, code: string, id: string) => void;
  onRemove: () => void;
  subtotal: number;
}

export default function CouponCode({ onApply, onRemove, subtotal }: CouponCodeProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
    discountType: string;
    id: string;
  } | null>(null);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) {
      setError('Please enter a coupon code');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const coupon = await validateCoupon(code, subtotal);

      if (coupon) {
        setAppliedCoupon({
          code: coupon.code,
          discount: coupon.discount_value,
          discountType: coupon.discount_type,
          id: coupon.id
        });

        onApply(
          coupon.discount_value,
          coupon.discount_type,
          coupon.code,
          coupon.id
        );
      } else {
        setError('Invalid coupon code');
      }
    } catch (err) {
      console.error('Error validating coupon:', err);
      setError('Failed to validate coupon');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCode('');
    onRemove();
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-medium text-gray-800 mb-2">Coupon Code</h3>

      {appliedCoupon ? (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-green-700 font-medium">{appliedCoupon.code}</p>
              <p className="text-sm text-green-600">
                {appliedCoupon.discountType === 'percentage'
                  ? `${appliedCoupon.discount}% off`
                  : `$${appliedCoupon.discount.toFixed(2)} off`}
              </p>
            </div>
            <button
              type="button"
              onClick={handleRemoveCoupon}
              className="text-gray-500 hover:text-gray-700"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleApplyCoupon} className="flex space-x-2">
          <div className="flex-1">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter coupon code"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {loading ? 'Applying...' : 'Apply'}
          </button>
        </form>
      )}
    </div>
  );
}
