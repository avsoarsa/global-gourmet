'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
// Using regular img tags instead of next/image
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getGiftBoxes } from '@/lib/api';
import { GiftBox } from '@/types/database.types';

export default function GiftBoxesPage() {
  const [giftBoxes, setGiftBoxes] = useState<GiftBox[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGiftBoxes = async () => {
      setLoading(true);
      try {
        const boxes = await getGiftBoxes();
        setGiftBoxes(boxes);
      } catch (err) {
        console.error('Error loading gift boxes:', err);
        setError('Failed to load gift boxes. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadGiftBoxes();
  }, []);

  return (
    <div className="font-sans bg-gray-50">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-r from-amber-50 to-amber-100">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Premium Gift Boxes</h1>
            <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
              Thoughtfully curated gift boxes featuring our finest dry fruits, nuts, and spices.
              Perfect for special occasions, corporate gifting, or treating yourself.
            </p>
            <Link
              href="/gift-boxes/create"
              className="bg-amber-600 text-white px-6 py-3 rounded-md hover:bg-amber-700 font-medium inline-block"
            >
              Create Your Own Gift Box
            </Link>
          </div>
        </section>

        {/* Gift Boxes Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Our Curated Gift Boxes</h2>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-pulse text-center">
                  <p className="text-gray-500">Loading gift boxes...</p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-12">
                <p>{error}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {giftBoxes.map((box) => (
                  <div key={box.id} className="bg-white rounded-lg shadow-md overflow-hidden transition duration-300 hover:shadow-lg">
                    <div className="w-full h-64">
                      <img
                        src={box.image_url || 'https://via.placeholder.com/400x300'}
                        alt={box.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-xl text-gray-800 mb-2">{box.name}</h3>
                      <p className="text-gray-600 mb-4">{box.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-800">${box.base_price.toFixed(2)}</span>
                        <Link
                          href={`/gift-boxes/${box.id}`}
                          className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 font-medium"
                        >
                          Customize
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Custom Gift Box Section */}
        <section className="py-12 bg-gray-100">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-8 md:mb-0 md:pr-12">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Create Your Own Gift Box</h2>
                <p className="text-gray-600 mb-6">
                  Design a personalized gift box by selecting from our premium range of dry fruits, nuts, and spices.
                  Choose your favorites, add a personal message, and we'll package it beautifully for you or your loved ones.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center">
                    <span className="bg-amber-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2">1</span>
                    <span>Select your box size and style</span>
                  </li>
                  <li className="flex items-center">
                    <span className="bg-amber-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2">2</span>
                    <span>Choose your favorite products</span>
                  </li>
                  <li className="flex items-center">
                    <span className="bg-amber-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2">3</span>
                    <span>Add a personalized message</span>
                  </li>
                  <li className="flex items-center">
                    <span className="bg-amber-600 text-white rounded-full w-6 h-6 flex items-center justify-center mr-2">4</span>
                    <span>We'll package and deliver it beautifully</span>
                  </li>
                </ul>
                <Link
                  href="/gift-boxes/create"
                  className="bg-amber-600 text-white px-6 py-3 rounded-md hover:bg-amber-700 font-medium inline-block"
                >
                  Start Creating
                </Link>
              </div>
              <div className="md:w-1/2">
                <div className="w-full h-96 rounded-lg overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1606787366850-de6330128bfc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
                    alt="Custom gift box"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Corporate Gifting Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Corporate Gifting</h2>

            <div className="bg-white rounded-lg shadow-md p-8 mb-8">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-2/3 md:pr-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Perfect for Business Gifting</h3>
                  <p className="text-gray-600 mb-6">
                    Make a lasting impression with our premium corporate gift solutions. Our gift boxes are perfect for:
                  </p>
                  <ul className="space-y-2 mb-6">
                    <li className="flex items-center">
                      <span className="text-amber-600 mr-2">•</span>
                      <span>Client appreciation gifts</span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-amber-600 mr-2">•</span>
                      <span>Employee recognition</span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-amber-600 mr-2">•</span>
                      <span>Holiday gifting</span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-amber-600 mr-2">•</span>
                      <span>Event giveaways</span>
                    </li>
                    <li className="flex items-center">
                      <span className="text-amber-600 mr-2">•</span>
                      <span>Custom branded packaging</span>
                    </li>
                  </ul>
                  <Link
                    href="/contact?subject=Corporate%20Gifting"
                    className="bg-amber-600 text-white px-6 py-3 rounded-md hover:bg-amber-700 font-medium inline-block"
                  >
                    Inquire About Corporate Orders
                  </Link>
                </div>
                <div className="md:w-1/3 mt-6 md:mt-0">
                  <div className="w-full h-64 rounded-lg overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1600348759200-5b94753c5a4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80"
                      alt="Corporate gift boxes"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <p className="text-gray-600 mb-6">
                For bulk orders or custom corporate gifting solutions, please contact our dedicated corporate sales team.
              </p>
              <Link
                href="/bulk-orders"
                className="border border-amber-600 text-amber-600 px-6 py-3 rounded-md hover:bg-amber-50 font-medium inline-block"
              >
                Learn About Bulk Orders
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
