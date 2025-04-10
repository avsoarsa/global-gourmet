'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import CategoryFilter from '@/components/CategoryFilter';
import { Product, Category } from '@/types/database.types';
import { getProducts, getProductsByCategory, getCategories } from '@/lib/api';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const searchParams = useSearchParams();
  const categorySlug = searchParams.get('category');
  
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load categories
        const categoriesData = await getCategories();
        setCategories(categoriesData);
        
        // Load products based on category filter
        let productsData: Product[];
        if (categorySlug) {
          productsData = await getProductsByCategory(categorySlug);
        } else {
          productsData = await getProducts();
        }
        
        setProducts(productsData);
      } catch (err) {
        console.error('Error loading products data:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [categorySlug]);
  
  return (
    <div className="font-sans bg-gray-50">
      <Header />
      <main>
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
              {categorySlug 
                ? `${categories.find(c => c.slug === categorySlug)?.name || 'Products'}`
                : 'All Products'
              }
            </h1>
            
            <CategoryFilter categories={categories} />
            
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-pulse text-center">
                  <p className="text-gray-500">Loading products...</p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-12">
                <p>{error}</p>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500">No products found in this category.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Showing <span className="font-medium">1</span> to <span className="font-medium">{products.length}</span> of <span className="font-medium">{products.length}</span> products
                  </div>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                      Previous
                    </button>
                    <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                      Next
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
