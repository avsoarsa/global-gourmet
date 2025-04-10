'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/types/database.types';
import { getRecentlyViewedProducts } from '@/lib/api';
import { useAuthStore } from '@/lib/store';
import ProductCard from './ProductCard';

interface RecentlyViewedProps {
  currentProductId: string;
}

export default function RecentlyViewed({ currentProductId }: RecentlyViewedProps) {
  const { userId, isAuthenticated } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentlyViewed = async () => {
      if (!isAuthenticated || !userId) {
        // For anonymous users, we could get from localStorage
        setLoading(false);
        return;
      }

      try {
        const recentProducts = await getRecentlyViewedProducts(userId);
        // Filter out the current product
        const filteredProducts = recentProducts.filter(p => p.id !== currentProductId);
        setProducts(filteredProducts);
      } catch (error) {
        console.error('Error fetching recently viewed products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentlyViewed();
  }, [userId, isAuthenticated, currentProductId]);

  if (loading) {
    return (
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Recently Viewed</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-gray-200 animate-pulse h-64 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Recently Viewed</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
