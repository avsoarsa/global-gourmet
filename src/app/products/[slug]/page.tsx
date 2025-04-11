'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
// Using Font Awesome icons instead of React icons
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ImageGallery from '@/components/ImageGallery';
import ProductNutrition from '@/components/ProductNutrition';
import RelatedProducts from '@/components/RelatedProducts';
import RecentlyViewed from '@/components/RecentlyViewed';
import ProductSizeSelector from '@/components/ProductSizeSelector';
import ProductRecipes from '@/components/ProductRecipes';
import BulkOrderFeatures from '@/components/BulkOrderFeatures';
import { Product, Review } from '@/types/database.types';
import {
  getProductBySlug,
  getProductReviews,
  getProductImages,
  getProductNutrition,
  trackProductView,
  getRelatedProducts
} from '@/lib/api';
import { useCartStore, useWishlistStore, useAuthStore } from '@/lib/store';

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
  const [activeTab, setActiveTab] = useState<'description' | 'nutrition' | 'reviews' | 'recipes'>('description');
  const [selectedSize, setSelectedSize] = useState<{id: string; label: string; weight: string; price: number; stock: number}>(
    {id: 'medium', label: 'Medium Pack', weight: '500g', price: 0, stock: 0}
  );
  const [displayPrice, setDisplayPrice] = useState<number>(0);
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

        // Initialize price and selected size
        setDisplayPrice(productData.price);
        setSelectedSize({
          id: 'medium',
          label: 'Medium Pack',
          weight: '500g',
          price: productData.price,
          stock: productData.stock_quantity
        });

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
  }, [slug]);

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setQuantity(value);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    setAddingToCart(true);

    // Create a modified product with the selected size and price
    const sizedProduct = {
      ...product,
      name: `${product.name} - ${selectedSize.weight}`,
      price: selectedSize.price,
      stock_quantity: selectedSize.stock
    };

    // Add to cart
    addItem(sizedProduct, quantity);

    setTimeout(() => {
      setAddingToCart(false);
    }, 1000);
  };

  const handleSizeChange = (option: {id: string; label: string; weight: string; price: number; stock: number}) => {
    setSelectedSize(option);
    setDisplayPrice(option.price);

    // Reset quantity if it's more than available stock
    if (quantity > option.stock) {
      setQuantity(option.stock > 0 ? 1 : 0);
    }
  };

  const handleToggleWishlist = () => {
    if (!product || !isAuthenticated) return;

    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };

  // Render stars based on rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<i key={`star-${i}`} className="fas fa-star text-amber-400"></i>);
    }

    if (hasHalfStar) {
      stars.push(<i key="half-star" className="fas fa-star-half-alt text-amber-400"></i>);
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<i key={`empty-star-${i}`} className="far fa-star text-amber-400"></i>);
    }

    return stars;
  };

  if (loading) {
    return (
      <div className="font-sans bg-gray-50">
        <Header />
        <main className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex justify-center py-12">
              <div className="animate-pulse text-center">
                <p className="text-gray-500">Loading product details...</p>
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
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
              <p className="text-gray-700 mb-6">{error || 'Product not found'}</p>
              <Link
                href="/products"
                className="bg-amber-600 text-white px-6 py-3 rounded-md hover:bg-amber-700 font-medium"
              >
                Back to Products
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
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row -mx-4">
              {/* Product Image */}
              <div className="md:w-1/2 px-4 mb-8 md:mb-0">
                {productImages.length > 0 ? (
                  <div className="relative">
                    <ImageGallery images={productImages} alt={product.name} />
                    {product.is_bestseller && (
                      <div className="absolute top-4 right-4 bg-amber-600 text-white text-xs font-bold px-3 py-1 rounded-full z-10">
                        BESTSELLER
                      </div>
                    )}
                    {product.is_organic && (
                      <div className="absolute top-4 left-4 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full z-10">
                        ORGANIC
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative h-96 md:h-[500px] rounded-lg overflow-hidden">
                    <Image
                      src={product.image_url || 'https://via.placeholder.com/600x600'}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                      priority
                    />
                    {product.is_bestseller && (
                      <div className="absolute top-4 right-4 bg-amber-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                        BESTSELLER
                      </div>
                    )}
                    {product.is_organic && (
                      <div className="absolute top-4 left-4 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                        ORGANIC
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Product Details */}
              <div className="md:w-1/2 px-4">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>

                <div className="flex items-center mb-4">
                  <div className="flex mr-2">
                    {renderStars(product.rating)}
                  </div>
                  <span className="text-gray-600">
                    {product.rating.toFixed(1)} ({product.review_count} reviews)
                  </span>
                </div>

                <div className="mb-6">
                  <span className="text-2xl font-bold text-gray-800">
                    ${displayPrice.toFixed(2)}
                  </span>
                  {product.sale_price && (
                    <span className="text-gray-500 text-lg line-through ml-2">
                      ${(displayPrice * (product.price / product.sale_price)).toFixed(2)}
                    </span>
                  )}
                </div>

                <div className="mb-6">
                  {/* Product tabs */}
                  <div className="border-b border-gray-200 mb-4">
                    <div className="flex space-x-4 overflow-x-auto pb-1">
                      <button
                        onClick={() => setActiveTab('description')}
                        className={`py-2 px-4 font-medium whitespace-nowrap ${activeTab === 'description'
                          ? 'text-amber-600 border-b-2 border-amber-600'
                          : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        Description
                      </button>
                      <button
                        onClick={() => setActiveTab('nutrition')}
                        className={`py-2 px-4 font-medium whitespace-nowrap ${activeTab === 'nutrition'
                          ? 'text-amber-600 border-b-2 border-amber-600'
                          : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        Nutrition
                      </button>
                      <button
                        onClick={() => setActiveTab('reviews')}
                        className={`py-2 px-4 font-medium whitespace-nowrap ${activeTab === 'reviews'
                          ? 'text-amber-600 border-b-2 border-amber-600'
                          : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        Reviews ({reviews.length})
                      </button>
                      <button
                        onClick={() => setActiveTab('recipes')}
                        className={`py-2 px-4 font-medium whitespace-nowrap ${activeTab === 'recipes'
                          ? 'text-amber-600 border-b-2 border-amber-600'
                          : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        Recipes
                      </button>
                    </div>
                  </div>

                  {/* Tab content */}
                  <div className="py-2">
                    {activeTab === 'description' && (
                      <div>
                        <p className="text-gray-600 mb-6">{product.description || 'No description available.'}</p>

                        {/* Product details */}
                        <div className="bg-gray-50 p-4 rounded-lg mb-6">
                          <h4 className="font-bold text-gray-800 mb-3">Product Details</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex">
                              <div className="w-32 text-gray-600">Origin:</div>
                              <div className="font-medium">Premium Quality</div>
                            </div>
                            <div className="flex">
                              <div className="w-32 text-gray-600">Category:</div>
                              <div className="font-medium">{category}</div>
                            </div>
                            <div className="flex">
                              <div className="w-32 text-gray-600">Storage:</div>
                              <div className="font-medium">Store in a cool, dry place</div>
                            </div>
                            <div className="flex">
                              <div className="w-32 text-gray-600">Shelf Life:</div>
                              <div className="font-medium">12 months</div>
                            </div>
                            {product.is_organic && (
                              <div className="flex">
                                <div className="w-32 text-gray-600">Certification:</div>
                                <div className="font-medium">Certified Organic</div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Bulk order features */}
                        <BulkOrderFeatures />
                      </div>
                    )}

                    {activeTab === 'nutrition' && (
                      <ProductNutrition nutrition={nutrition} />
                    )}

                    {activeTab === 'reviews' && (
                      <div className="space-y-4">
                        {reviews.length === 0 ? (
                          <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
                        ) : (
                          reviews.map((review) => (
                            <div key={review.id} className="border-b border-gray-200 pb-4">
                              <div className="flex items-center mb-2">
                                <div className="flex text-amber-400">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <i
                                      key={star}
                                      className={star <= review.rating ? 'fas fa-star' : 'far fa-star'}
                                    ></i>
                                  ))}
                                </div>
                                <span className="text-gray-600 text-sm ml-2">
                                  {new Date(review.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              {review.comment && (
                                <p className="text-gray-700">{review.comment}</p>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    )}

                    {activeTab === 'recipes' && (
                      <ProductRecipes productName={product.name} />
                    )}
                  </div>
                </div>

                {/* Size selector */}
                <ProductSizeSelector
                  basePrice={product.price}
                  onSizeChange={handleSizeChange}
                  initialSize="medium"
                />

                <div className="mb-6">
                  <div className="flex items-center mb-2">
                    <span className="text-gray-700 mr-3">Quantity:</span>
                    <div className="flex items-center">
                      <button
                        onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                        disabled={selectedSize.stock <= 0}
                        className="bg-gray-200 text-gray-700 px-3 py-1 rounded-l-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={selectedSize.stock}
                        value={quantity}
                        onChange={handleQuantityChange}
                        disabled={selectedSize.stock <= 0}
                        className="w-16 text-center border-t border-b border-gray-200 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        disabled={selectedSize.stock <= 0 || quantity >= selectedSize.stock}
                        className="bg-gray-200 text-gray-700 px-3 py-1 rounded-r-md disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 mb-2">
                    {selectedSize.stock > 0 ?
                      `${selectedSize.stock} ${selectedSize.weight} packs available` :
                      'Out of stock in this size'}
                  </p>

                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <span className={product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'}>
                      {product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                    {product.stock_quantity > 0 && (
                      <span className="ml-2">({product.stock_quantity} available)</span>
                    )}
                  </div>
                </div>

                <div className="flex space-x-4 mb-8">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock_quantity === 0 || addingToCart}
                    className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-md font-medium ${
                      product.stock_quantity === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-amber-600 text-white hover:bg-amber-700'
                    } ${addingToCart ? 'animate-pulse' : ''}`}
                  >
                    <i className="fas fa-shopping-cart"></i>
                    <span>{addingToCart ? 'Adding...' : 'Add to Cart'}</span>
                  </button>

                  <button
                    onClick={handleToggleWishlist}
                    disabled={!isAuthenticated}
                    className={`flex items-center justify-center space-x-2 px-6 py-3 rounded-md font-medium ${
                      !isAuthenticated
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : inWishlist
                        ? 'bg-gray-200 text-amber-600'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {inWishlist ? <i className="fas fa-heart"></i> : <i className="far fa-heart"></i>}
                    <span>{inWishlist ? 'In Wishlist' : 'Add to Wishlist'}</span>
                  </button>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h3 className="font-bold text-gray-800 mb-2">Product Details</h3>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    <li>Premium quality</li>
                    <li>Sourced from the finest farms</li>
                    <li>100% natural</li>
                    <li>Rich in nutrients</li>
                    {product.is_organic && <li>Certified organic</li>}
                  </ul>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Customer Reviews</h2>

              {reviews.length === 0 ? (
                <p className="text-gray-600">No reviews yet. Be the first to review this product!</p>
              ) : (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-200 pb-6">
                      <div className="flex items-center mb-2">
                        <div className="flex mr-2">
                          {renderStars(review.rating)}
                        </div>
                        <span className="font-bold text-gray-800">
                          {review.rating.toFixed(1)}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{review.comment || 'No comment provided.'}</p>
                      <p className="text-sm text-gray-500">
                        Posted on {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {isAuthenticated ? (
                <div className="mt-8">
                  <Link
                    href={`/products/${slug}/review`}
                    className="bg-amber-600 text-white px-6 py-3 rounded-md hover:bg-amber-700 font-medium inline-block"
                  >
                    Write a Review
                  </Link>
                </div>
              ) : (
                <div className="mt-8">
                  <p className="text-gray-600 mb-2">Please sign in to write a review.</p>
                  <Link
                    href={`/auth/signin?redirect=/products/${slug}`}
                    className="text-amber-600 hover:underline"
                  >
                    Sign in now
                  </Link>
                </div>
              )}
            </div>

            {/* Related Products Section */}
            {product.category_id && (
              <div className="mt-16">
                <RelatedProducts productId={product.id} categoryId={product.category_id} />
              </div>
            )}

            {/* Recently Viewed Section */}
            {isAuthenticated && userId && (
              <div className="mt-16">
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
