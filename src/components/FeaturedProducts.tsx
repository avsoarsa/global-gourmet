'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getProductsByCategory } from '@/lib/api';
import { Product } from '@/types/database.types';

export default function FeaturedProducts() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const fetchedProducts = await getProductsByCategory(activeCategory === 'all' ? null : activeCategory);
        setProducts(fetchedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [activeCategory]);
  return (
    <section className="py-12 bg-white" id="products">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Our Premium Categories</h2>

        <div className="flex overflow-x-auto pb-4 mb-8 hide-scrollbar space-x-2 md:space-x-4 justify-center">
          <button
            onClick={() => setActiveCategory('all')}
            className={`category-tab px-4 py-2 font-medium whitespace-nowrap ${activeCategory === 'all' ? 'active text-amber-600 border-b-2 border-amber-600' : 'text-gray-700'}`}
          >
            All Products
          </button>
          <button
            onClick={() => setActiveCategory('dry-fruits')}
            className={`category-tab px-4 py-2 font-medium whitespace-nowrap ${activeCategory === 'dry-fruits' ? 'active text-amber-600 border-b-2 border-amber-600' : 'text-gray-700'}`}
          >
            Dry Fruits
          </button>
          <button
            onClick={() => setActiveCategory('nuts-seeds')}
            className={`category-tab px-4 py-2 font-medium whitespace-nowrap ${activeCategory === 'nuts-seeds' ? 'active text-amber-600 border-b-2 border-amber-600' : 'text-gray-700'}`}
          >
            Nuts & Seeds
          </button>
          <button
            onClick={() => setActiveCategory('spices')}
            className={`category-tab px-4 py-2 font-medium whitespace-nowrap ${activeCategory === 'spices' ? 'active text-amber-600 border-b-2 border-amber-600' : 'text-gray-700'}`}
          >
            Spices
          </button>
          <button
            onClick={() => setActiveCategory('whole-foods')}
            className={`category-tab px-4 py-2 font-medium whitespace-nowrap ${activeCategory === 'whole-foods' ? 'active text-amber-600 border-b-2 border-amber-600' : 'text-gray-700'}`}
          >
            Whole Foods
          </button>
          <button
            onClick={() => setActiveCategory('sprouts')}
            className={`category-tab px-4 py-2 font-medium whitespace-nowrap ${activeCategory === 'sprouts' ? 'active text-amber-600 border-b-2 border-amber-600' : 'text-gray-700'}`}
          >
            Sprouts
          </button>
          <button
            onClick={() => setActiveCategory('superfoods')}
            className={`category-tab px-4 py-2 font-medium whitespace-nowrap ${activeCategory === 'superfoods' ? 'active text-amber-600 border-b-2 border-amber-600' : 'text-gray-700'}`}
          >
            Superfoods
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading ? (
            // Loading skeleton
            [...Array(4)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="w-full h-48 bg-gray-200 animate-pulse"></div>
                <div className="p-4">
                  <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-2/3"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3"></div>
                </div>
              </div>
            ))
          ) : products.length > 0 ? (
            // Display products
            products.slice(0, 8).map((product) => (
              <div key={product.id} className="product-card bg-white rounded-lg shadow-md overflow-hidden transition duration-300">
                <Link href={`/products/${product.slug}`}>
                  <div className="relative">
                    <img
                      src={product.image_url || 'https://via.placeholder.com/400x300'}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                    {product.is_bestseller && (
                      <div className="absolute top-2 right-2 bg-amber-600 text-white text-xs font-bold px-2 py-1 rounded-full">BESTSELLER</div>
                    )}
                    {product.is_organic && (
                      <div className="absolute top-2 right-2 bg-green-600 text-white text-xs font-bold px-2 py-1 rounded-full">ORGANIC</div>
                    )}
                    {product.sale_price && (
                      <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">SALE</div>
                    )}
                  </div>
                </Link>
                <div className="p-4">
                  <Link href={`/products/${product.slug}`}>
                    <h3 className="font-bold text-gray-800 mb-1">{product.name}</h3>
                  </Link>
                  <div className="flex items-center mb-2">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, i) => {
                        if (i < Math.floor(product.rating)) {
                          return <i key={i} className="fas fa-star"></i>;
                        } else if (i === Math.floor(product.rating) && product.rating % 1 >= 0.5) {
                          return <i key={i} className="fas fa-star-half-alt"></i>;
                        } else {
                          return <i key={i} className="far fa-star"></i>;
                        }
                      })}
                    </div>
                    <span className="text-gray-600 text-sm ml-2">({product.review_count})</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      {product.sale_price ? (
                        <div className="flex items-center">
                          <span className="font-bold text-gray-800">${product.sale_price.toFixed(2)}</span>
                          <span className="text-gray-500 text-sm line-through ml-2">${product.price.toFixed(2)}</span>
                        </div>
                      ) : (
                        <span className="font-bold text-gray-800">${product.price.toFixed(2)}</span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button className="text-gray-400 hover:text-amber-600">
                        <i className="far fa-heart"></i>
                      </button>
                      <button className="text-gray-400 hover:text-amber-600">
                        <i className="fas fa-shopping-cart"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            // No products found
            <div className="col-span-4 text-center py-8">
              <p className="text-gray-500">No products found in this category.</p>
            </div>
          )}
        </div>

        <div className="text-center mt-10">
          <Link href={`/products${activeCategory !== 'all' ? `?category=${activeCategory}` : ''}`} className="border border-amber-600 text-amber-600 px-6 py-2 rounded-md hover:bg-amber-50 font-medium inline-block">
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
}
