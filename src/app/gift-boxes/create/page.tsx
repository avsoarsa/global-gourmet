'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getGiftBoxes } from '@/lib/api';
import { GiftBox } from '@/types/database.types';

export default function CreateGiftBoxPage() {
  const router = useRouter();
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
        setError('Failed to load gift box templates. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadGiftBoxes();
  }, []);

  const handleSelectBox = (boxId: string) => {
    router.push(`/gift-boxes/${boxId}`);
  };

  return (
    <div className="font-sans bg-gray-50">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-r from-amber-50 to-amber-100">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Create Your Custom Gift Box</h1>
            <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
              Select a box style below to start creating your personalized gift box filled with our premium products.
            </p>
          </div>
        </section>

        {/* Box Selection Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Choose Your Box Style</h2>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-pulse text-center">
                  <p className="text-gray-500">Loading gift box options...</p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center text-red-500 py-12">
                <p>{error}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {giftBoxes.map((box) => (
                  <div 
                    key={box.id} 
                    className="bg-white rounded-lg shadow-md overflow-hidden transition duration-300 hover:shadow-lg cursor-pointer"
                    onClick={() => handleSelectBox(box.id)}
                  >
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
                        <span className="font-bold text-gray-800">Starting at ${box.base_price.toFixed(2)}</span>
                        <button
                          className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 font-medium"
                        >
                          Select
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-12 bg-gray-100">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">How It Works</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-amber-600">1</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Choose Your Box</h3>
                <p className="text-gray-600">
                  Select from our range of beautifully designed gift box options.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-amber-600">2</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Add Products</h3>
                <p className="text-gray-600">
                  Fill your box with our premium dry fruits, nuts, and spices.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-amber-600">3</span>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Personalize</h3>
                <p className="text-gray-600">
                  Add a custom message and we'll beautifully package your gift.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
