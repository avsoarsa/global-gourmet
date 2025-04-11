'use client';

import Link from 'next/link';
import Image from 'next/image';
import { UserProfile, Order } from '@/types/database.types';

type AccountOverviewProps = {
  profile: UserProfile | null;
  recentOrders: Order[];
};

export default function AccountOverview({ profile, recentOrders }: AccountOverviewProps) {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Account Overview</h2>
        </div>
        
        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center">
            <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6">
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                <span className="text-2xl font-bold">
                  {profile?.first_name ? profile.first_name.charAt(0).toUpperCase() : ''}
                  {profile?.last_name ? profile.last_name.charAt(0).toUpperCase() : ''}
                </span>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-800">
                {profile?.first_name} {profile?.last_name}
              </h3>
              <p className="text-gray-600">{profile?.email}</p>
              
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href="/account/settings"
                  className="inline-flex items-center text-sm text-amber-600 hover:text-amber-700"
                >
                  <i className="fas fa-edit mr-1"></i> Edit Profile
                </Link>
                <span className="text-gray-300 mx-1">|</span>
                <Link
                  href="/account/settings#password"
                  className="inline-flex items-center text-sm text-amber-600 hover:text-amber-700"
                >
                  <i className="fas fa-key mr-1"></i> Change Password
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Recent Orders</h2>
          <Link
            href="/account/orders"
            className="text-sm text-amber-600 hover:text-amber-700 font-medium"
          >
            View All Orders
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          {recentOrders.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
              <Link
                href="/products"
                className="inline-block bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700"
              >
                Start Shopping
              </Link>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.order_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                          order.status === 'processing' ? 'bg-blue-100 text-blue-800' : 
                          order.status === 'shipped' ? 'bg-purple-100 text-purple-800' : 
                          'bg-gray-100 text-gray-800'}`}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Link
                        href={`/account/orders/${order.id}`}
                        className="text-amber-600 hover:text-amber-700"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 flex items-start">
            <div className="flex-shrink-0 mr-4">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                <i className="fas fa-heart"></i>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-1">Wishlist</h3>
              <p className="text-gray-600 text-sm mb-3">View and manage your saved items</p>
              <Link
                href="/account/wishlist"
                className="text-sm text-amber-600 hover:text-amber-700 font-medium"
              >
                View Wishlist
              </Link>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 flex items-start">
            <div className="flex-shrink-0 mr-4">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                <i className="fas fa-map-marker-alt"></i>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-1">Address Book</h3>
              <p className="text-gray-600 text-sm mb-3">Manage your shipping addresses</p>
              <Link
                href="/account/addresses"
                className="text-sm text-amber-600 hover:text-amber-700 font-medium"
              >
                Manage Addresses
              </Link>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 flex items-start">
            <div className="flex-shrink-0 mr-4">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                <i className="fas fa-credit-card"></i>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-1">Payment Methods</h3>
              <p className="text-gray-600 text-sm mb-3">Manage your saved payment methods</p>
              <Link
                href="/account/payment-methods"
                className="text-sm text-amber-600 hover:text-amber-700 font-medium"
              >
                Manage Payments
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
