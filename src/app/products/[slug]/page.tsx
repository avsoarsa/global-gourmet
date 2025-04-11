'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RelatedProducts from '@/components/RelatedProducts';
import RecentlyViewed from '@/components/RecentlyViewed';
import PremiumProductDetails from '@/components/PremiumProductDetails';
import { Product, Review } from '@/types/database.types';
import {
  getProductBySlug,
  getProductReviews,
  getProductImages,
  getProductNutrition,
  trackProductView,
  getCategoryBySlug
} from '@/lib/api';
import { useCartStore, useWishlistStore, useAuthStore } from '@/lib/store';
import { toast } from 'react-hot-toast';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);
  const [productImages, setProductImages] = useState<string[]>([]);
  const [nutrition, setNutrition] = useState<any>(null);
  const [category, setCategory] = useState<string>('');

  const { addItem } = useCartStore();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore();
  const { isAuthenticated, userId } = useAuthStore();

  useEffect(() => {
    const loadProductData = async () => {
      setLoading(true);
      try {
        const productData = await getProductBySlug(slug);
        if (!productData) {
          setError('Product not found');
          return;
        }

        setProduct(productData);

        // Track product view for logged-in users
        if (isAuthenticated && userId) {
          trackProductView(userId, productData.id);
        }

        // Get category information
        if (productData.category_id) {
          try {
            const categoryData = await getCategoryBySlug(productData.category_id);
            if (categoryData) {
              setCategory(categoryData.name);
            }
          } catch (error) {
            console.error('Error fetching category:', error);
          }
        }

        // Load reviews
        const reviewsData = await getProductReviews(productData.id);
        setReviews(reviewsData);

        // Load product images
        const images = await getProductImages(productData.id);
        setProductImages(images);

        // Load nutrition information
        const nutritionData = await getProductNutrition(productData.id);
        setNutrition(nutritionData);
      } catch (err) {
        console.error('Error loading product data:', err);
        setError('Failed to load product details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadProductData();
  }, [slug, isAuthenticated, userId]);

  const handleAddToCart = () => {
    if (!product) return;

    setAddingToCart(true);

    // Add to cart
    addItem(product, quantity);

    // Show success message
    toast.success(`${quantity} ${quantity > 1 ? 'items' : 'item'} added to cart`);

    setTimeout(() => {
      setAddingToCart(false);
    }, 1000);
  };

  const handleToggleWishlist = () => {
    if (!product) return;

    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      toast.success('Removed from wishlist');
    } else {
      addToWishlist(product.id);
      toast.success('Added to wishlist');
    }
  };

  if (loading) {
    return (
      <div className="font-sans bg-gray-50">
        <Header />
        <main className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex justify-center items-center min-h-[60vh]">
              <div className="animate-pulse flex flex-col items-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                  <i className="fas fa-spinner text-amber-600 text-2xl"></i>
                </div>
                <p className="text-gray-600 font-medium">Loading product details...</p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="font-sans bg-gray-50">
        <Header />
        <main className="py-12">
          <div className="container mx-auto px-4">
            <div className="text-center py-12 max-w-lg mx-auto">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-exclamation-triangle text-red-500 text-xl"></i>
              </div>
              <h1 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h1>
              <p className="text-gray-600 mb-8">{error || 'The product you are looking for does not exist or has been removed.'}</p>
              <Link
                href="/products"
                className="bg-amber-600 text-white px-6 py-3 rounded-md hover:bg-amber-700 font-medium inline-block"
              >
                Browse All Products
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const inWishlist = isInWishlist(product.id);

  return (
    <div className="font-sans bg-gray-50">
      <Header />
      <main>
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center text-sm text-gray-500">
            <Link href="/" className="hover:text-amber-600">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/products" className="hover:text-amber-600">Products</Link>
            {category && category.length > 0 && (
              <>
                <span className="mx-2">/</span>
                <Link href={`/categories/${category.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-amber-600">{category}</Link>
              </>
            )}
            {product.name && (
              <>
                <span className="mx-2">/</span>
                <span className="text-gray-900 font-medium truncate">{product.name}</span>
              </>
            )}
          </div>
        </div>

        {/* Product Details Section */}
        <section className="py-6 lg:py-12">
          <div className="container mx-auto px-4">
            <PremiumProductDetails
              product={product}
              reviews={reviews}
              nutrition={nutrition}
              productImages={productImages}
              category={category}
              onAddToCart={handleAddToCart}
              onToggleWishlist={handleToggleWishlist}
              inWishlist={inWishlist}
              isAddingToCart={addingToCart}
            />

            {/* Related Products Section */}
            {product.category_id && (
              <div className="mt-16">
                <h2 className="text-2xl font-bold text-gray-800 mb-8">You May Also Like</h2>
                <RelatedProducts productId={product.id} categoryId={product.category_id} />
              </div>
            )}

            {/* Recently Viewed Section */}
            {isAuthenticated && userId && (
              <div className="mt-16">
                <h2 className="text-2xl font-bold text-gray-800 mb-8">Recently Viewed</h2>
                <RecentlyViewed currentProductId={product.id} />
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
