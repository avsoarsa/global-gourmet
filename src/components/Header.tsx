'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore, useCartStore, useWishlistStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { isAuthenticated, isAdmin } = useAuthStore();
  const { totalItems } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const { signOut } = useAuth();

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <i className="fas fa-seedling text-amber-600 text-2xl"></i>
          <h1 className="text-xl font-bold text-gray-800">Global Gourmet</h1>
        </div>

        <div className="hidden md:flex space-x-6">
          <Link href="/" className={`text-gray-700 hover:text-amber-600 ${pathname === '/' ? 'text-amber-600' : ''}`}>Home</Link>
          <Link href="/products" className={`text-gray-700 hover:text-amber-600 ${pathname.startsWith('/products') ? 'text-amber-600' : ''}`}>Products</Link>
          <Link href="/gift-boxes" className={`text-gray-700 hover:text-amber-600 ${pathname.startsWith('/gift-boxes') ? 'text-amber-600' : ''}`}>Gift Boxes</Link>
          <Link href="/bulk-orders" className={`text-gray-700 hover:text-amber-600 ${pathname.startsWith('/bulk-orders') ? 'text-amber-600' : ''}`}>Bulk Orders</Link>
          <Link href="/about" className={`text-gray-700 hover:text-amber-600 ${pathname.startsWith('/about') ? 'text-amber-600' : ''}`}>About Us</Link>
        </div>

        <div className="flex items-center space-x-4">
          <Link href="/cart" className="relative text-gray-700 hover:text-amber-600">
            <i className="fas fa-shopping-cart text-xl"></i>
            <span className="absolute -top-2 -right-2 bg-amber-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{totalItems}</span>
          </Link>
          <Link href="/wishlist" className="relative text-gray-700 hover:text-amber-600">
            <i className="fas fa-heart text-xl"></i>
            {wishlistItems.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{wishlistItems.length}</span>
            )}
          </Link>
          {isAuthenticated ? (
            <Link href="/account" className="hidden md:block bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700">
              Account
            </Link>
          ) : (
            <Link href="/auth/signin" className="hidden md:block bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700">
              Sign In
            </Link>
          )}
          <button className="md:hidden text-gray-700" onClick={toggleMobileMenu}>
            <i className="fas fa-bars text-xl"></i>
          </button>
        </div>
      </div>

      {/* Mobile Menu - Hidden by default */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 py-2">
          <div className="container mx-auto px-4">
            <nav className="flex flex-col space-y-3">
              <Link href="/" className={`text-gray-700 hover:text-amber-600 py-2 ${pathname === '/' ? 'text-amber-600' : ''}`} onClick={() => setMobileMenuOpen(false)}>Home</Link>
              <Link href="/products" className={`text-gray-700 hover:text-amber-600 py-2 ${pathname.startsWith('/products') ? 'text-amber-600' : ''}`} onClick={() => setMobileMenuOpen(false)}>Products</Link>
              <Link href="/gift-boxes" className={`text-gray-700 hover:text-amber-600 py-2 ${pathname.startsWith('/gift-boxes') ? 'text-amber-600' : ''}`} onClick={() => setMobileMenuOpen(false)}>Gift Boxes</Link>
              <Link href="/bulk-orders" className={`text-gray-700 hover:text-amber-600 py-2 ${pathname.startsWith('/bulk-orders') ? 'text-amber-600' : ''}`} onClick={() => setMobileMenuOpen(false)}>Bulk Orders</Link>
              <Link href="/about" className={`text-gray-700 hover:text-amber-600 py-2 ${pathname.startsWith('/about') ? 'text-amber-600' : ''}`} onClick={() => setMobileMenuOpen(false)}>About Us</Link>
              <Link href="/auth/signin" className="text-gray-700 hover:text-amber-600 py-2" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
