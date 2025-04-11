'use client';

import Link from 'next/link';

export default function BulkOrderFeatures() {
  const features = [
    {
      icon: 'fas fa-box',
      title: 'Minimum order: 10kg per product',
      description: 'Our bulk orders start at 10kg per product to ensure you get the best wholesale pricing.'
    },
    {
      icon: 'fas fa-box-open',
      title: 'Custom packaging available',
      description: 'Get your products in custom branded packaging with your logo and design.'
    },
    {
      icon: 'fas fa-user-tie',
      title: 'Dedicated account manager',
      description: 'Each business client gets a dedicated account manager for personalized service.'
    },
    {
      icon: 'fas fa-globe',
      title: 'Global shipping available',
      description: 'We ship to businesses worldwide with competitive shipping rates and reliable delivery.'
    }
  ];

  return (
    <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg p-6 mb-8">
      <div className="flex items-center mb-4">
        <div className="bg-amber-600 text-white p-2 rounded-full mr-3">
          <i className="fas fa-building"></i>
        </div>
        <h3 className="text-xl font-bold text-gray-800">Business & Bulk Orders</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {features.map((feature, index) => (
          <div key={index} className="flex bg-white p-4 rounded-lg shadow-sm">
            <div className="text-amber-600 text-xl mr-3">
              <i className={feature.icon}></i>
            </div>
            <div>
              <h4 className="font-medium text-gray-800">{feature.title}</h4>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
      
      <Link 
        href="/bulk-orders" 
        className="inline-block bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 font-medium"
      >
        Request Bulk Quote <i className="fas fa-arrow-right ml-1"></i>
      </Link>
    </div>
  );
}
