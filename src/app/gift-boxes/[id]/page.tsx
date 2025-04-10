'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
// Using Font Awesome icons instead of React icons
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { getGiftBoxById, getProducts } from '@/lib/api';
import { GiftBox, Product } from '@/types/database.types';
import { useCartStore } from '@/lib/store';

interface SelectedProduct {
  product: Product;
  quantity: number;
}

export default function GiftBoxDetailPage() {
  const params = useParams();
  const router = useRouter();
  const giftBoxId = params.id as string;

  const [giftBox, setGiftBox] = useState<GiftBox | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addingToCart, setAddingToCart] = useState(false);

  const { addItem } = useCartStore();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load gift box
        const boxData = await getGiftBoxById(giftBoxId);

        if (!boxData) {
          setError('Gift box not found');
          setLoading(false);
          return;
        }

        setGiftBox(boxData);

        // Load available products
        const productsData = await getProducts();
        setProducts(productsData);
      } catch (err) {
        console.error('Error loading gift box data:', err);
        setError('Failed to load gift box details');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [giftBoxId]);

  const handleAddProduct = (product: Product) => {
    setSelectedProducts((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);

      if (existingIndex >= 0) {
        // Product already exists, increment quantity
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1,
        };
        return updated;
      } else {
        // Add new product
        return [...prev, { product, quantity: 1 }];
      }
    });
  };

  const handleRemoveProduct = (productId: string) => {
    setSelectedProducts((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveProduct(productId);
      return;
    }

    setSelectedProducts((prev) => {
      return prev.map((item) => {
        if (item.product.id === productId) {
          return { ...item, quantity };
        }
        return item;
      });
    });
  };

  const calculateTotalPrice = () => {
    const productsTotal = selectedProducts.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );

    return (giftBox?.base_price || 0) + productsTotal;
  };

  const handleAddToCart = () => {
    if (!giftBox) return;

    setAddingToCart(true);

    // Create a custom product for the gift box
    const customGiftBox: Product = {
      id: `gift-box-${giftBox.id}`,
      name: `Custom ${giftBox.name}`,
      slug: `custom-${giftBox.id}`,
      description: `Custom gift box with ${selectedProducts.length} items. ${message ? `Message: ${message}` : ''}`,
      price: calculateTotalPrice(),
      sale_price: null,
      stock_quantity: 1,
      is_featured: false,
      is_bestseller: false,
      is_organic: false,
      category_id: '',
      image_url: giftBox.image_url,
      rating: 5,
      review_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Add to cart
    addItem(customGiftBox, 1);

    setTimeout(() => {
      setAddingToCart(false);
      router.push('/cart');
    }, 1000);
  };

  if (loading) {
    return (
      <div className="font-sans bg-gray-50">
        <Header />
        <main className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex justify-center py-12">
              <div className="animate-pulse text-center">
                <p className="text-gray-500">Loading gift box details...</p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !giftBox) {
    return (
      <div className="font-sans bg-gray-50">
        <Header />
        <main className="py-12">
          <div className="container mx-auto px-4">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">Error</h1>
              <p className="text-gray-600 mb-6">{error || 'Gift box not found'}</p>
              <Link
                href="/gift-boxes"
                className="bg-amber-600 text-white px-6 py-3 rounded-md hover:bg-amber-700 font-medium inline-block"
              >
                Back to Gift Boxes
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="font-sans bg-gray-50">
      <Header />
      <main className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Gift Box Details */}
            <div className="lg:w-1/2">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="relative w-full h-96">
                  <img
                    src={giftBox.image_url || 'https://via.placeholder.com/600x400'}
                    alt={giftBox.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">{giftBox.name}</h1>
                  <p className="text-gray-600 mb-4">{giftBox.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-800">
                      Base Price: ${giftBox.base_price.toFixed(2)}
                    </span>
                    {giftBox.is_customizable && (
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        Customizable
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Available Products */}
              <div className="mt-8 bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800">Add Products to Your Gift Box</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {products.slice(0, 8).map((product) => (
                      <div key={product.id} className="border border-gray-200 rounded-md p-4 flex items-center">
                        <div className="relative w-16 h-16 flex-shrink-0">
                          <img
                            src={product.image_url || 'https://via.placeholder.com/64'}
                            alt={product.name}
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                        <div className="ml-4 flex-1">
                          <h3 className="font-medium text-gray-800">{product.name}</h3>
                          <p className="text-sm text-gray-500">${product.price.toFixed(2)}</p>
                        </div>
                        <button
                          onClick={() => handleAddProduct(product)}
                          className="ml-2 bg-amber-600 text-white p-2 rounded-full hover:bg-amber-700"
                          aria-label={`Add ${product.name} to gift box`}
                        >
                          <i className="fas fa-plus"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Gift Box Configuration */}
            <div className="lg:w-1/2">
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800">Your Custom Gift Box</h2>
                </div>

                <div className="p-6">
                  <h3 className="font-bold text-gray-800 mb-4">Selected Products</h3>

                  {selectedProducts.length === 0 ? (
                    <div className="text-center py-8 border border-dashed border-gray-300 rounded-md">
                      <p className="text-gray-500">
                        No products selected yet. Add some products to your gift box.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 mb-6">
                      {selectedProducts.map(({ product, quantity }) => (
                        <div key={product.id} className="flex items-center border-b border-gray-200 pb-4">
                          <div className="relative w-16 h-16 flex-shrink-0">
                            <img
                              src={product.image_url || 'https://via.placeholder.com/64'}
                              alt={product.name}
                              className="w-full h-full object-cover rounded"
                            />
                          </div>
                          <div className="ml-4 flex-1">
                            <h4 className="font-medium text-gray-800">{product.name}</h4>
                            <p className="text-sm text-gray-500">${product.price.toFixed(2)} each</p>
                          </div>
                          <div className="flex items-center">
                            <button
                              onClick={() => handleUpdateQuantity(product.id, quantity - 1)}
                              className="text-gray-500 hover:text-gray-700 p-1"
                            >
                              <i className="fas fa-minus"></i>
                            </button>
                            <span className="mx-2 w-8 text-center">{quantity}</span>
                            <button
                              onClick={() => handleUpdateQuantity(product.id, quantity + 1)}
                              className="text-gray-500 hover:text-gray-700 p-1"
                            >
                              <i className="fas fa-plus"></i>
                            </button>
                          </div>
                          <div className="ml-4 text-right">
                            <p className="font-medium">${(product.price * quantity).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-8">
                    <h3 className="font-bold text-gray-800 mb-4">Add a Personal Message</h3>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Enter your personal message here..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                      rows={4}
                    />
                  </div>

                  <div className="mt-8 border-t border-gray-200 pt-6">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Base Price:</span>
                      <span className="font-medium">${giftBox.base_price.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Products:</span>
                      <span className="font-medium">
                        ${selectedProducts.reduce((total, { product, quantity }) => total + product.price * quantity, 0).toFixed(2)}
                      </span>
                    </div>

                    <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-4 mt-4">
                      <span>Total:</span>
                      <span>${calculateTotalPrice().toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="mt-8">
                    <button
                      onClick={handleAddToCart}
                      disabled={selectedProducts.length === 0 || addingToCart}
                      className={`w-full flex items-center justify-center space-x-2 bg-amber-600 text-white px-6 py-3 rounded-md hover:bg-amber-700 font-medium ${
                        selectedProducts.length === 0 || addingToCart ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      <i className="fas fa-shopping-cart"></i>
                      <span>{addingToCart ? 'Adding to Cart...' : 'Add to Cart'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
