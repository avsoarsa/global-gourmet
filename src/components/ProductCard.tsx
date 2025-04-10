'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
// Using Font Awesome icons instead of React icons
import { Product } from '@/types/database.types';
import { useCartStore, useWishlistStore, useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { addItem } = useCartStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsAddingToCart(true);
    addItem(product, 1);

    setTimeout(() => {
      setIsAddingToCart(false);
    }, 500);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push('/auth/signin?redirect=/wishlist');
      return;
    }

    if (inWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };

  // Render stars based on rating
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(product.rating);
    const hasHalfStar = product.rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={`star-${i}`} className="fas fa-star"></i>);
    }

    if (hasHalfStar) {
      stars.push(<i key="half-star" className="fas fa-star-half-alt"></i>);
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-star-${i}`} className="far fa-star"></i>);
    }

    return stars;
  };

  return (
    <Link href={`/products/${product.slug}`}>
      <div className="product-card bg-white rounded-lg shadow-md overflow-hidden transition duration-300 hover:shadow-lg">
        <div className="relative">
          <div className="w-full h-48 relative">
            <Image
              src={product.image_url || 'https://via.placeholder.com/300'}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />
          </div>
          {product.is_bestseller && (
            <div className="absolute top-2 right-2 bg-amber-600 text-white text-xs font-bold px-2 py-1 rounded-full">
              BESTSELLER
            </div>
          )}
          {product.is_organic && (
            <div className="absolute top-2 right-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">
              ORGANIC
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-bold text-gray-800 mb-1">{product.name}</h3>
          <div className="flex items-center mb-2">
            <div className="flex text-amber-400">
              {renderStars()}
            </div>
            <span className="text-gray-600 text-sm ml-2">({product.review_count})</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-bold text-gray-800">
              ${product.price.toFixed(2)}
              {product.sale_price && (
                <span className="text-gray-500 text-sm line-through ml-2">
                  ${product.sale_price.toFixed(2)}
                </span>
              )}
            </span>
            <div className="flex space-x-2">
              <button
                onClick={handleToggleWishlist}
                className={`${
                  inWishlist ? 'text-amber-600' : 'text-gray-400 hover:text-amber-600'
                }`}
                aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                {inWishlist ? <i className="fas fa-heart"></i> : <i className="far fa-heart"></i>}
              </button>
              <button
                onClick={handleAddToCart}
                className={`text-gray-400 hover:text-amber-600 ${
                  isAddingToCart ? 'animate-pulse' : ''
                }`}
                aria-label="Add to cart"
              >
                <i className="fas fa-shopping-cart"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
