'use client';

import { useState } from 'react';
import { createReview } from '@/lib/api';
import { useAuthStore } from '@/lib/store';

interface ProductReviewFormProps {
  productId: string;
  onReviewSubmitted: () => void;
}

export default function ProductReviewForm({ productId, onReviewSubmitted }: ProductReviewFormProps) {
  const { userId, isAuthenticated } = useAuthStore();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !userId) {
      setError('You must be logged in to submit a review');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await createReview(userId, productId, rating, comment);
      setComment('');
      setRating(5);
      onReviewSubmitted();
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-8 border border-gray-200 rounded-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Write a Review</h3>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="rating" className="block text-gray-700 mb-2">
            Rating
          </label>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="text-2xl focus:outline-none"
              >
                <i
                  className={`${
                    star <= rating ? 'fas fa-star text-amber-400' : 'far fa-star text-gray-300'
                  }`}
                ></i>
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label htmlFor="comment" className="block text-gray-700 mb-2">
            Your Review
          </label>
          <textarea
            id="comment"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="Share your experience with this product..."
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className={`bg-amber-600 text-white px-6 py-3 rounded-md hover:bg-amber-700 font-medium ${
            submitting ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
}
