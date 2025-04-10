'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Category } from '@/types/database.types';
import { useCategoryStore } from '@/lib/store';

interface CategoryFilterProps {
  categories: Category[];
}

export default function CategoryFilter({ categories }: CategoryFilterProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { selectedCategory, setSelectedCategory, setCategories } = useCategoryStore();
  
  const categoryParam = searchParams.get('category');
  
  useEffect(() => {
    setCategories(categories);
    
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    } else {
      setSelectedCategory(null);
    }
  }, [categories, categoryParam, setCategories, setSelectedCategory]);
  
  const handleCategoryClick = (slug: string | null) => {
    setSelectedCategory(slug);
    
    if (slug) {
      router.push(`/products?category=${slug}`);
    } else {
      router.push('/products');
    }
  };
  
  return (
    <div className="flex overflow-x-auto pb-4 mb-8 hide-scrollbar space-x-2 md:space-x-4 justify-center">
      <button
        className={`category-tab px-4 py-2 font-medium text-gray-700 whitespace-nowrap ${
          !selectedCategory ? 'active border-b-2 border-amber-600 text-amber-600' : ''
        }`}
        onClick={() => handleCategoryClick(null)}
      >
        All Products
      </button>
      
      {categories.map((category) => (
        <button
          key={category.id}
          className={`category-tab px-4 py-2 font-medium text-gray-700 whitespace-nowrap ${
            selectedCategory === category.slug ? 'active border-b-2 border-amber-600 text-amber-600' : ''
          }`}
          onClick={() => handleCategoryClick(category.slug)}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
