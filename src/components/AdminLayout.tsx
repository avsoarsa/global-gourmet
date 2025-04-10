'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store';
import Header from './Header';
import Footer from './Footer';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/signin?redirect=/admin');
      return;
    }

    if (!isAdmin) {
      router.push('/');
      return;
    }
  }, [isAuthenticated, isAdmin, router]);

  return (
    <div className="font-sans bg-gray-50 min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Admin Sidebar */}
        <aside className="bg-gray-800 text-white w-full md:w-64 md:min-h-screen">
          <div className="p-6">
            <h2 className="text-xl font-bold">Admin Dashboard</h2>
          </div>
          <nav className="px-4 pb-6">
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/admin" 
                  className="block px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link 
                  href="/admin/products" 
                  className="block px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                >
                  Products
                </Link>
              </li>
              <li>
                <Link 
                  href="/admin/categories" 
                  className="block px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                >
                  Categories
                </Link>
              </li>
              <li>
                <Link 
                  href="/admin/orders" 
                  className="block px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                >
                  Orders
                </Link>
              </li>
              <li>
                <Link 
                  href="/admin/coupons" 
                  className="block px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                >
                  Coupons
                </Link>
              </li>
              <li>
                <Link 
                  href="/admin/users" 
                  className="block px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                >
                  Users
                </Link>
              </li>
              <li>
                <Link 
                  href="/admin/gift-boxes" 
                  className="block px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                >
                  Gift Boxes
                </Link>
              </li>
              <li>
                <Link 
                  href="/admin/bulk-orders" 
                  className="block px-4 py-2 rounded hover:bg-gray-700 transition-colors"
                >
                  Bulk Orders
                </Link>
              </li>
            </ul>
          </nav>
        </aside>
        
        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
      
      <Footer />
    </div>
  );
}
