'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuthStore, useWishlistStore, useCartStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types/database.types';
import AccountSidebar from '@/components/account/AccountSidebar';
import { toast } from 'react-hot-toast';

export default function WishlistPage() {
  const router = useRouter();
  const { isAuthenticated, userId } = useAuthStore();
  const { items: wishlistItems, removeItem } = useWishlistStore();
  const { addItem: addToCart } = useCartStore();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState<{[key: string]: boolean}>({});
  
  useEffect(() => {
    if (!isAuthenticated && wishlistItems.length === 0) {
      router.push('/auth/signin?redirect=/account/wishlist');
      return;
    }
    
    const loadWishlistProducts = async () => {
      setLoading(true);
      try {
        if (wishlistItems.length === 0) {
          setProducts([]);
          return;
        }
        
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .in('id', wishlistItems);
        
        if (error) throw error;
        setProducts(data || []);
      } catch (err) {
        console.error('Error loading wishlist products:', err);
        setError('Failed to load wishlist items');
      } finally {
        setLoading(false);
      }
    };
    
    loadWishlistProducts();
  }, [isAuthenticated, userId, router, wishlistItems]);
  
  const handleRemoveFromWishlist = (productId: string) => {
    removeItem(productId);
    toast.success('Item removed from wishlist');
  };
  
  const handleAddToCart = (product: Product) => {
    setAddingToCart(prev => ({ ...prev, [product.id]: true }));
    
    // Add to cart
    addToCart(product, 1);
    
    // Show success message
    toast.success('Added to cart');
    
    setTimeout(() => {
      setAddingToCart(prev => ({ ...prev, [product.id]: false }));
    }, 1000);
  };
  
  const handleMoveAllToCart = () => {
    products.forEach(product => {
      addToCart(product, 1);
    });
    
    toast.success('All items added to cart');
  };
  
  return (
    <div className="font-sans bg-gray-50 min-h-screen">
      <Header />
      <main className="py-8 md:py-12">
        <div className="container mx-auto px-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}
          
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <div className="md:w-1/4 lg:w-1/5">
              <AccountSidebar activePage="wishlist" />
            </div>
            
            {/* Main Content */}
            <div className="md:w-3/4 lg:w-4/5">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-800">My Wishlist</h2>
                  
                  {products.length > 0 && (
                    <button
                      onClick={handleMoveAllToCart}
                      className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 text-sm font-medium"
                    >
                      Add All to Cart
                    </button>
                  )}
                </div>
                
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-600 mb-2"></div>
                    <p className="text-gray-600">Loading wishlist...</p>
                  </div>
                ) : products.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="far fa-heart text-gray-400 text-xl"></i>
                    </div>
                    <h3 className="text-lg font-medium text-gray-800 mb-1">Your Wishlist is Empty</h3>
                    <p className="text-gray-600 mb-4">
                      Add items to your wishlist to save them for later.
                    </p>
                    <Link
                      href="/products"
                      className="inline-block bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700"
                    >
                      Browse Products
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                    {products.map((product) => (
                      <div key={product.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                        <div className="relative">
                          <Link href={`/products/${product.slug}`}>
                            <div className="aspect-square relative">
                              <Image
                                src={product.image_url || '/images/products/placeholder.jpg'}
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          </Link>
                          <button
                            onClick={() => handleRemoveFromWishlist(product.id)}
                            className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-red-500 hover:text-red-600"
                            aria-label="Remove from wishlist"
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                        
                        <div className="p-4">
                          <Link href={`/products/${product.slug}`}>
                            <h3 className="text-gray-800 font-medium mb-2 hover:text-amber-600 transition-colors">
                              {product.name}
                            </h3>
                          </Link>
                          
                          <div className="flex items-center mb-3">
                            <div className="flex text-amber-400 mr-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <i
                                  key={star}
                                  className={star <= product.rating ? 'fas fa-star text-xs' : 'far fa-star text-xs'}
                                ></i>
                              ))}
                            </div>
                            <span className="text-gray-600 text-xs">
                              ({product.review_count || 0})
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-gray-800 font-bold">
                              ${product.price.toFixed(2)}
                            </span>
                            
                            <button
                              onClick={() => handleAddToCart(product)}
                              disabled={addingToCart[product.id]}
                              className={`bg-amber-600 text-white px-3 py-1 rounded-md hover:bg-amber-700 text-sm ${
                                addingToCart[product.id] ? 'opacity-70 cursor-not-allowed' : ''
                              }`}
                            >
                              {addingToCart[product.id] ? (
                                <span className="flex items-center">
                                  <i className="fas fa-spinner fa-spin mr-1"></i> Adding...
                                </span>
                              ) : (
                                <span className="flex items-center">
                                  <i className="fas fa-shopping-cart mr-1"></i> Add to Cart
                                </span>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
