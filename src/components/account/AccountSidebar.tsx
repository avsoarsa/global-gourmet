'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { useAuth } from '@/lib/auth-context';

type AccountSidebarProps = {
  activePage: string;
};

export default function AccountSidebar({ activePage }: AccountSidebarProps) {
  const router = useRouter();
  const { signOut } = useAuth();
  
  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const menuItems = [
    { id: 'overview', label: 'Account Overview', icon: 'fas fa-user', href: '/account' },
    { id: 'orders', label: 'Order History', icon: 'fas fa-shopping-bag', href: '/account/orders' },
    { id: 'wishlist', label: 'Wishlist', icon: 'fas fa-heart', href: '/account/wishlist' },
    { id: 'addresses', label: 'Address Book', icon: 'fas fa-map-marker-alt', href: '/account/addresses' },
    { id: 'payment-methods', label: 'Payment Methods', icon: 'fas fa-credit-card', href: '/account/payment-methods' },
    { id: 'settings', label: 'Account Settings', icon: 'fas fa-cog', href: '/account/settings' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 bg-amber-50 border-b border-amber-100">
        <h2 className="text-lg font-medium text-gray-800">My Account</h2>
      </div>
      
      <nav className="p-2">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                  activePage === item.id
                    ? 'bg-amber-100 text-amber-800'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <i className={`${item.icon} w-5 text-center mr-3 ${
                  activePage === item.id ? 'text-amber-600' : 'text-gray-500'
                }`}></i>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
          
          <li className="pt-2 mt-2 border-t border-gray-100">
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-4 py-3 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <i className="fas fa-sign-out-alt w-5 text-center mr-3 text-gray-500"></i>
              <span>Sign Out</span>
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
