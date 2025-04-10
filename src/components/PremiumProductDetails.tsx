'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Product, Review } from '@/types/database.types';
import ProductSizeSelector from './ProductSizeSelector';
import ProductNutrition from './ProductNutrition';
import ProductRecipes from './ProductRecipes';

interface PremiumProductDetailsProps {
  product: Product;
  reviews: Review[];
  nutrition: any;
  productImages: string[];
  category: string;
  onAddToCart: () => void;
  onToggleWishlist: () => void;
  inWishlist: boolean;
  isAddingToCart: boolean;
}

export default function PremiumProductDetails({
  product,
  reviews,
  nutrition,
  productImages,
  category,
  onAddToCart,
  onToggleWishlist,
  inWishlist,
  isAddingToCart
}: PremiumProductDetailsProps) {
  const [activeTab, setActiveTab] = useState<'description' | 'nutrition' | 'reviews' | 'recipes'>('description');
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<{id: string; label: string; weight: string; price: number; stock: number}>(
    {id: 'medium', label: 'Medium Pack', weight: '500g', price: product.price, stock: product.stock_quantity}
  );
  const [basePrice, setBasePrice] = useState<number>(product.price);

  // Calculate display price based on quantity and selected size
  const displayPrice = selectedSize.price * quantity;

  const handleSizeChange = (option: {id: string; label: string; weight: string; price: number; stock: number}) => {
    setSelectedSize(option);
    setBasePrice(option.price);

    // Reset quantity if it's more than available stock
    if (quantity > option.stock) {
      setQuantity(option.stock > 0 ? 1 : 0);
    }
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= selectedSize.stock) {
      setQuantity(value);
    }
  };

  // Render stars based on rating
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<i key={i} className="fas fa-star text-amber-400"></i>);
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(<i key={i} className="fas fa-star-half-alt text-amber-400"></i>);
      } else {
        stars.push(<i key={i} className="far fa-star text-amber-400"></i>);
      }
    }

    return stars;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="flex flex-col lg:flex-row">
        {/* Left column - Product Images */}
        <div className="lg:w-1/2 relative">
          {productImages.length > 0 ? (
            <div className="sticky top-24">
              <div className="relative">
                <div className="aspect-square">
                  <Image
                    src={productImages[0]}
                    alt={product.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                    priority
                  />
                </div>
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

              {/* Thumbnails */}
              {productImages.length > 1 && (
                <div className="flex mt-4 space-x-2 px-4">
                  {productImages.slice(0, 4).map((image, index) => (
                    <div key={index} className="w-20 h-20 rounded-md overflow-hidden border border-gray-200">
                      <Image
                        src={image}
                        alt={`${product.name} - ${index + 1}`}
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="aspect-square relative">
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

        {/* Right column - Product Details */}
        <div className="lg:w-1/2 p-6 lg:p-8 lg:border-l border-gray-100">
          {/* Breadcrumbs */}
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <span>Home</span>
            <span className="mx-2">/</span>
            <span>{category}</span>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">{product.name}</span>
          </div>

          {/* Product Title */}
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>

          {/* Rating */}
          <div className="flex items-center mb-4">
            <div className="flex mr-2">
              {renderStars(product.rating)}
            </div>
            <span className="text-gray-600">
              {product.rating.toFixed(1)} ({product.review_count} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="mb-6">
            <div className="flex items-baseline">
              <span className="text-3xl font-bold text-gray-800">
                ${displayPrice.toFixed(2)}
              </span>
              {product.sale_price && (
                <span className="text-gray-500 text-lg line-through ml-2">
                  ${(displayPrice * (product.price / product.sale_price)).toFixed(2)}
                </span>
              )}
              <span className="ml-2 text-sm text-gray-700">
                ${basePrice.toFixed(2)} per {selectedSize.weight}
              </span>
            </div>
            {quantity > 1 && (
              <div className="text-sm text-gray-700 mt-1">
                ${basePrice.toFixed(2)} × {quantity} {quantity > 1 ? 'items' : 'item'}
              </div>
            )}
          </div>

          {/* Short Description */}
          <p className="text-gray-700 mb-6 leading-relaxed">
            {product.description.split('.')[0]}. Premium quality, sourced from the finest orchards.
          </p>

          {/* Size Selector */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">SELECT SIZE</h3>
            <div className="grid grid-cols-4 gap-2">
              <button
                onClick={() => handleSizeChange({id: 'small', label: 'Small Pack', weight: '250g', price: product.price * 0.5, stock: product.stock_quantity})}
                className={`border rounded-md p-2 text-center transition-all ${selectedSize.id === 'small' ? 'border-amber-600 bg-amber-50 text-amber-600' : 'border-gray-300 hover:border-gray-400'}`}
              >
                <div className="text-sm font-medium">250g</div>
                <div className="text-xs text-gray-500 mt-1">${(product.price * 0.5).toFixed(2)}</div>
              </button>
              <button
                onClick={() => handleSizeChange({id: 'medium', label: 'Medium Pack', weight: '500g', price: product.price, stock: product.stock_quantity})}
                className={`border rounded-md p-2 text-center transition-all ${selectedSize.id === 'medium' ? 'border-amber-600 bg-amber-50 text-amber-600' : 'border-gray-300 hover:border-gray-400'}`}
              >
                <div className="text-sm font-medium">500g</div>
                <div className="text-xs text-gray-500 mt-1">${product.price.toFixed(2)}</div>
              </button>
              <button
                onClick={() => handleSizeChange({id: 'large', label: 'Large Pack', weight: '1kg', price: product.price * 1.8, stock: product.stock_quantity})}
                className={`border rounded-md p-2 text-center transition-all ${selectedSize.id === 'large' ? 'border-amber-600 bg-amber-50 text-amber-600' : 'border-gray-300 hover:border-gray-400'}`}
              >
                <div className="text-sm font-medium">1kg</div>
                <div className="text-xs text-gray-500 mt-1">${(product.price * 1.8).toFixed(2)}</div>
              </button>
              <button
                onClick={() => handleSizeChange({id: 'bulk', label: 'Bulk Pack', weight: '5kg', price: product.price * 8, stock: product.stock_quantity})}
                className={`border rounded-md p-2 text-center transition-all ${selectedSize.id === 'bulk' ? 'border-amber-600 bg-amber-50 text-amber-600' : 'border-gray-300 hover:border-gray-400'}`}
              >
                <div className="text-sm font-medium">5kg</div>
                <div className="text-xs text-gray-500 mt-1">${(product.price * 8).toFixed(2)}</div>
              </button>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">QUANTITY</h3>
            <div className="flex items-center">
              <button
                onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                disabled={selectedSize.stock <= 0}
                className="bg-gray-100 text-gray-700 h-10 w-10 flex items-center justify-center rounded-l-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fas fa-minus text-sm"></i>
              </button>
              <input
                type="number"
                min="1"
                max={selectedSize.stock}
                value={quantity}
                onChange={handleQuantityChange}
                disabled={selectedSize.stock <= 0}
                className="h-10 w-16 text-center border-t border-b border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                onClick={() => setQuantity(quantity + 1)}
                disabled={selectedSize.stock <= 0 || quantity >= selectedSize.stock}
                className="bg-gray-100 text-gray-700 h-10 w-10 flex items-center justify-center rounded-r-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <i className="fas fa-plus text-sm"></i>
              </button>
              <span className="ml-4 text-sm text-gray-500">
                {selectedSize.stock > 0 ?
                  `${selectedSize.stock} available` :
                  'Out of stock'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mb-8">
            <button
              onClick={onAddToCart}
              disabled={isAddingToCart || selectedSize.stock <= 0}
              className="flex-1 bg-amber-600 text-white py-3 px-6 rounded-md hover:bg-amber-700 font-medium flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
            >
              {isAddingToCart ? (
                <span className="flex items-center">
                  <i className="fas fa-spinner fa-spin mr-2"></i> Adding...
                </span>
              ) : selectedSize.stock <= 0 ? (
                'Out of Stock'
              ) : (
                <span className="flex items-center">
                  <i className="fas fa-shopping-cart mr-2"></i> Add to Cart
                </span>
              )}
            </button>

            <button
              onClick={onToggleWishlist}
              className={`w-14 h-12 flex items-center justify-center rounded-md border transition-colors ${
                inWishlist
                  ? 'bg-red-50 border-red-200 text-red-500'
                  : 'border-gray-300 text-gray-500 hover:bg-gray-50'
              }`}
              aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
              title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <i className={inWishlist ? 'fas fa-heart' : 'far fa-heart'}></i>
            </button>
          </div>

          {/* Product Features */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                <i className="fas fa-leaf text-amber-600"></i>
              </div>
              <div>
                <h4 className="font-medium text-gray-800">100% Natural</h4>
                <p className="text-xs text-gray-700">No additives or preservatives</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                <i className="fas fa-truck text-amber-600"></i>
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Free Shipping</h4>
                <p className="text-xs text-gray-700">On orders over $50</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                <i className="fas fa-shield-alt text-amber-600"></i>
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Quality Guarantee</h4>
                <p className="text-xs text-gray-700">100% satisfaction guaranteed</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                <i className="fas fa-undo text-amber-600"></i>
              </div>
              <div>
                <h4 className="font-medium text-gray-800">Easy Returns</h4>
                <p className="text-xs text-gray-700">30-day return policy</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Tabs */}
      <div className="border-t border-gray-100">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-center md:justify-start overflow-x-auto">
            <div className="inline-flex bg-gray-100 rounded-lg p-1 mb-6">
              <button
                onClick={() => setActiveTab('description')}
                className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                  activeTab === 'description'
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Details
              </button>
              <button
                onClick={() => setActiveTab('nutrition')}
                className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                  activeTab === 'nutrition'
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Nutrition
              </button>
              <button
                onClick={() => setActiveTab('reviews')}
                className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                  activeTab === 'reviews'
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Reviews ({reviews.length})
              </button>
              <button
                onClick={() => setActiveTab('recipes')}
                className={`px-4 py-2 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
                  activeTab === 'recipes'
                    ? 'bg-white text-gray-800 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Recipes
              </button>
            </div>
          </div>

          <div className="pb-8">
            {activeTab === 'description' && (
              <div className="max-w-3xl mx-auto">
                <div className="prose prose-amber">
                  <p className="text-gray-700 mb-6 leading-relaxed">{product.description}</p>

                  <h3 className="text-xl font-bold text-gray-800 mb-4">Product Details</h3>
                  <div className="bg-gray-50 p-6 rounded-lg mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4">
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

                  <h3 className="text-xl font-bold text-gray-800 mb-4">Health Benefits</h3>
                  <ul className="list-disc pl-5 space-y-2 text-gray-700 mb-6">
                    <li>Rich in essential nutrients and antioxidants</li>
                    <li>Supports heart health and reduces inflammation</li>
                    <li>Excellent source of plant-based protein</li>
                    <li>Contains omega-3 fatty acids for brain health</li>
                    <li>Helps maintain healthy cholesterol levels</li>
                  </ul>

                  <h3 className="text-xl font-bold text-gray-800 mb-4">How to Use</h3>
                  <p className="text-gray-700 mb-4">
                    Enjoy as a nutritious snack on their own, or incorporate into your favorite recipes:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-gray-700">
                    <li>Add to breakfast cereals, oatmeal, or yogurt</li>
                    <li>Mix into salads for extra crunch and nutrition</li>
                    <li>Use in baking for cookies, breads, and muffins</li>
                    <li>Blend into smoothies for added protein</li>
                    <li>Create homemade trail mix with dried fruits</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'nutrition' && (
              <div className="max-w-3xl mx-auto">
                <ProductNutrition nutrition={nutrition} />
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="max-w-3xl mx-auto">
                <div className="space-y-6">
                  {reviews.length === 0 ? (
                    <div className="text-center py-8 bg-white rounded-lg shadow-sm">
                      <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="far fa-comment-dots text-2xl text-amber-500"></i>
                      </div>
                      <h3 className="text-lg font-medium text-gray-800 mb-2">No Reviews Yet</h3>
                      <p className="text-gray-700 mb-6">Be the first to review this product!</p>
                      <button className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-md font-medium transition-colors">
                        Write a Review
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <h3 className="text-lg font-medium text-gray-800">Customer Reviews</h3>
                          <div className="flex items-center mt-1">
                            <div className="flex text-amber-400 mr-2">
                              {renderStars(product.rating)}
                            </div>
                            <span className="text-gray-700">
                              Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                            </span>
                          </div>
                        </div>
                        <button className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                          Write a Review
                        </button>
                      </div>

                      {reviews.map((review) => (
                        <div key={review.id} className="bg-white p-6 rounded-lg shadow-sm mb-4 border border-gray-100">
                          <div className="flex items-center mb-4">
                            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 font-bold mr-3">
                              {review.user_name ? review.user_name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-800">{review.user_name || 'Anonymous'}</h4>
                              <div className="flex items-center">
                                <div className="flex text-amber-400 mr-2">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <i
                                      key={star}
                                      className={star <= review.rating ? 'fas fa-star text-sm' : 'far fa-star text-sm'}
                                    ></i>
                                  ))}
                                </div>
                                <span className="text-gray-700 text-sm">
                                  {new Date(review.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                            <div className="ml-auto">
                              <span className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full">
                                Verified Purchase
                              </span>
                            </div>
                          </div>
                          {review.comment && (
                            <p className="text-gray-700">{review.comment}</p>
                          )}
                          <div className="mt-3 flex items-center text-sm">
                            <button className="text-gray-500 hover:text-gray-700 flex items-center mr-4">
                              <i className="far fa-thumbs-up mr-1"></i> Helpful (0)
                            </button>
                            <button className="text-gray-500 hover:text-gray-700 flex items-center">
                              <i className="far fa-flag mr-1"></i> Report
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'recipes' && (
              <div className="max-w-6xl mx-auto">
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-800 mb-2">Delicious Recipes with {product.name}</h3>
                  <p className="text-gray-700">Try these chef-curated recipes featuring our premium {product.name}.</p>
                </div>
                <ProductRecipes productName={product.name} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
