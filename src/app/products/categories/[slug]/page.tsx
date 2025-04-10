'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getProductsByCategory, getCategory } from '@/lib/api';
import { Product, Category } from '@/types/database.types';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';

export default function CategoryPage() {
  const { slug } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch category details
        const categoryData = await getCategory(slug as string);
        setCategory(categoryData);

        // Fetch products in this category
        const productsData = await getProductsByCategory(slug as string);
        setProducts(productsData);
      } catch (error) {
        console.error('Error fetching category data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchData();
    }
  }, [slug]);

  return (
    <div className="font-sans bg-gray-50">
      <Header />
      <main>
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <Link href="/products" className="text-amber-600 hover:text-amber-700">
                <i className="fas fa-arrow-left mr-2"></i>
                Back to All Products
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-amber-600 border-r-transparent"></div>
                <p className="mt-4 text-gray-600">Loading category...</p>
              </div>
            ) : category ? (
              <>
                <h1 className="text-3xl font-bold text-gray-800 mb-4">{category.name}</h1>
                {category.description && (
                  <p className="text-gray-600 mb-8 max-w-3xl">{category.description}</p>
                )}

                {products.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <i className="fas fa-box-open text-gray-400 text-5xl mb-4"></i>
                    <h3 className="text-xl font-medium text-gray-700 mb-2">No Products Found</h3>
                    <p className="text-gray-500">
                      We couldn't find any products in this category.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <i className="fas fa-exclamation-circle text-gray-400 text-5xl mb-4"></i>
                <h3 className="text-xl font-medium text-gray-700 mb-2">Category Not Found</h3>
                <p className="text-gray-500">
                  The category you're looking for doesn't exist or has been removed.
                </p>
                <Link
                  href="/products"
                  className="mt-4 inline-block bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700"
                >
                  Browse All Products
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
