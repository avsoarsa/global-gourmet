'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Product } from '@/types/database.types';
import { getRelatedProducts } from '@/lib/api';
import ProductCard from './ProductCard';

interface RelatedProductsProps {
  productId: string;
  categoryId: string;
}

export default function RelatedProducts({ productId, categoryId }: RelatedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        const relatedProducts = await getRelatedProducts(productId, categoryId);
        setProducts(relatedProducts);
      } catch (error) {
        console.error('Error fetching related products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [productId, categoryId]);

  if (loading) {
    return (
      <div className="mt-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="bg-gray-200 animate-pulse h-64 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    // Show placeholder products when no related products are found
    const placeholderProducts = [
      {
        id: 'placeholder-1',
        name: 'Premium Almonds',
        slug: 'premium-almonds',
        price: 12.99,
        image_url: 'https://images.unsplash.com/photo-1574570068036-e97e8c8c257c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        rating: 4.8,
        is_bestseller: true,
        is_organic: true,
        stock_quantity: 50
      },
      {
        id: 'placeholder-2',
        name: 'Organic Cashews',
        slug: 'organic-cashews',
        price: 14.99,
        image_url: 'https://images.unsplash.com/photo-1574570068036-e97e8c8c257c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        rating: 4.7,
        is_bestseller: false,
        is_organic: true,
        stock_quantity: 35
      },
      {
        id: 'placeholder-3',
        name: 'Dried Cranberries',
        slug: 'dried-cranberries',
        price: 8.99,
        image_url: 'https://images.unsplash.com/photo-1574570068036-e97e8c8c257c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        rating: 4.5,
        is_bestseller: false,
        is_organic: false,
        stock_quantity: 60
      },
      {
        id: 'placeholder-4',
        name: 'Pistachios',
        slug: 'pistachios',
        price: 16.99,
        image_url: 'https://images.unsplash.com/photo-1574570068036-e97e8c8c257c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
        rating: 4.9,
        is_bestseller: true,
        is_organic: false,
        stock_quantity: 25
      }
    ];

    return (
      <div className="mt-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {placeholderProducts.map((product) => (
            <ProductCard key={product.id} product={product as Product} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">You May Also Like</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
