'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FaTrash, FaShoppingCart, FaHeart } from 'react-icons/fa';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuthStore, useWishlistStore, useCartStore } from '@/lib/store';
import { getProductBySlug } from '@/lib/api';
import { Product } from '@/types/database.types';

export default function WishlistPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { items: wishlistItems, removeItem } = useWishlistStore();
  const { addItem } = useCartStore();
  
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/signin?redirect=/wishlist');
      return;
    }
    
    const loadProducts = async () => {
      setLoading(true);
      try {
        const productsData: Record<string, Product> = {};
        
        for (const productId of wishlistItems) {
          try {
            const product = await getProductBySlug(productId);
            if (product) {
              productsData[productId] = product;
            }
          } catch (err) {
            console.error(`Error loading product ${productId}:`, err);
          }
        }
        
        setProducts(productsData);
      } catch (err) {
        console.error('Error loading wishlist products:', err);
        setError('Failed to load wishlist products');
      } finally {
        setLoading(false);
      }
    };
    
    loadProducts();
  }, [isAuthenticated, wishlistItems, router]);
  
  const handleRemoveFromWishlist = (productId: string) => {
    removeItem(productId);
  };
  
  const handleAddToCart = (productId: string) => {
    const product = products[productId];
    if (!product) return;
    
    setAddingToCart((prev) => ({ ...prev, [productId]: true }));
    
    addItem(product, 1);
    
    setTimeout(() => {
      setAddingToCart((prev) => ({ ...prev, [productId]: false }));
    }, 1000);
  };
  
  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }
  
  if (loading) {
    return (
      <div className="font-sans bg-gray-50">
        <Header />
        <main className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex justify-center py-12">
              <div className="animate-pulse text-center">
                <p className="text-gray-500">Loading wishlist...</p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  
  if (wishlistItems.length === 0) {
    return (
      <div className="font-sans bg-gray-50">
        <Header />
        <main className="py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">My Wishlist</h1>
            
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="text-gray-500 mb-6">
                <FaHeart className="mx-auto text-5xl mb-4 text-gray-300" />
                <p className="text-xl">Your wishlist is empty</p>
                <p className="mt-2">Add products to your wishlist to save them for later.</p>
              </div>
              
              <Link
                href="/products"
                className="bg-amber-600 text-white px-6 py-3 rounded-md hover:bg-amber-700 font-medium inline-block"
              >
                Browse Products
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
          <h1 className="text-3xl font-bold text-gray-800 mb-8">My Wishlist</h1>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">
                Saved Items ({wishlistItems.length})
              </h2>
            </div>
            
            <div className="divide-y divide-gray-200">
              {wishlistItems.map((productId) => {
                const product = products[productId];
                if (!product) return null;
                
                return (
                  <div key={productId} className="p-6 flex flex-col sm:flex-row items-center">
                    <div className="sm:w-20 sm:h-20 w-32 h-32 relative mb-4 sm:mb-0">
                      <Image
                        src={product.image_url || 'https://via.placeholder.com/80'}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 80px"
                        className="object-cover rounded"
                      />
                    </div>
                    
                    <div className="sm:ml-6 flex-1 text-center sm:text-left">
                      <Link href={`/products/${product.slug}`} className="text-lg font-bold text-gray-800 hover:text-amber-600">
                        {product.name}
                      </Link>
                      
                      <p className="text-gray-600 mt-1">${product.price.toFixed(2)}</p>
                      
                      <div className="flex flex-col sm:flex-row sm:items-center mt-4 space-y-2 sm:space-y-0 sm:space-x-4">
                        <button
                          onClick={() => handleAddToCart(productId)}
                          disabled={addingToCart[productId]}
                          className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-md font-medium ${
                            addingToCart[productId]
                              ? 'bg-green-600 text-white'
                              : 'bg-amber-600 text-white hover:bg-amber-700'
                          }`}
                        >
                          <FaShoppingCart />
                          <span>{addingToCart[productId] ? 'Added!' : 'Add to Cart'}</span>
                        </button>
                        
                        <button
                          onClick={() => handleRemoveFromWishlist(productId)}
                          className="flex items-center justify-center space-x-2 px-4 py-2 rounded-md font-medium border border-gray-300 text-gray-700 hover:bg-gray-100"
                        >
                          <FaTrash />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-between items-center">
              <Link
                href="/products"
                className="text-amber-600 hover:text-amber-700 font-medium"
              >
                Continue Shopping
              </Link>
              
              <button
                onClick={() => {
                  wishlistItems.forEach((productId) => {
                    const product = products[productId];
                    if (product) {
                      addItem(product, 1);
                    }
                  });
                  router.push('/cart');
                }}
                className="bg-amber-600 text-white px-6 py-2 rounded-md hover:bg-amber-700 font-medium"
              >
                Add All to Cart
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
