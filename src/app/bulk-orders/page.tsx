'use client';

import { useState } from 'react';
// Using regular img tags instead of next/image
import Link from 'next/link';
// Using Font Awesome icons instead of React icons
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuthStore } from '@/lib/store';
import { createBulkOrderRequest } from '@/lib/api';

export default function BulkOrdersPage() {
  const { isAuthenticated, userId } = useAuthStore();

  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    productDetails: '',
    quantity: '',
    customPackaging: false,
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!formData.productDetails) {
      errors.productDetails = 'Product details are required';
    }

    if (!formData.quantity) {
      errors.quantity = 'Quantity is required';
    } else if (isNaN(Number(formData.quantity)) || Number(formData.quantity) <= 0) {
      errors.quantity = 'Quantity must be a positive number';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      if (!isAuthenticated || !userId) {
        throw new Error('You must be logged in to submit a bulk order request');
      }

      await createBulkOrderRequest(userId, {
        companyName: formData.companyName,
        contactName: formData.contactName,
        email: formData.email,
        phone: formData.phone,
        productDetails: formData.productDetails,
        quantity: parseInt(formData.quantity),
        customPackaging: formData.customPackaging,
      });

      setSubmitSuccess(true);

      // Reset form
      setFormData({
        companyName: '',
        contactName: '',
        email: '',
        phone: '',
        productDetails: '',
        quantity: '',
        customPackaging: false,
      });
    } catch (err) {
      console.error('Error submitting bulk order request:', err);
      setSubmitError('Failed to submit your request. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="font-sans bg-gray-50">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-r from-amber-50 to-amber-100">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Bulk Orders for Businesses</h1>
            <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
              Premium quality dry fruits, nuts, and spices at competitive wholesale prices for restaurants,
              hotels, retailers, and other businesses.
            </p>
            <a
              href="#request-quote"
              className="bg-amber-600 text-white px-6 py-3 rounded-md hover:bg-amber-700 font-medium inline-block"
            >
              Request a Quote
            </a>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-8 mb-12">
              <div className="md:w-1/2 mb-8 md:mb-0">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Wholesale Pricing for Businesses</h2>
                <p className="text-gray-700 mb-6">
                  We offer competitive wholesale pricing for restaurants, hotels, retailers, and other businesses.
                  Our bulk orders come with customized packaging options and flexible delivery schedules.
                </p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center">
                    <i className="fas fa-check-circle text-amber-600 mr-2"></i>
                    <span>Minimum order: 10kg per product</span>
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check-circle text-amber-600 mr-2"></i>
                    <span>Custom packaging available</span>
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check-circle text-amber-600 mr-2"></i>
                    <span>Dedicated account manager</span>
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check-circle text-amber-600 mr-2"></i>
                    <span>Global shipping available</span>
                  </li>
                </ul>
              </div>
              <div className="md:w-1/2 flex justify-center">
                <img
                  src="https://images.unsplash.com/photo-1606787366850-de6330128bfc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
                  alt="Bulk order packaging"
                  className="rounded-lg shadow-lg w-full max-w-md h-64 object-cover"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Bulk Benefit 1 */}
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <div className="text-amber-600 text-4xl mb-4">
                  <i className="fas fa-boxes"></i>
                </div>
                <h3 className="font-bold text-xl text-gray-800 mb-2">Volume Discounts</h3>
                <p className="text-gray-600">
                  Significant savings on large quantity orders with tiered pricing structure.
                </p>
              </div>

              {/* Bulk Benefit 2 */}
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <div className="text-amber-600 text-4xl mb-4">
                  <i className="fas fa-truck"></i>
                </div>
                <h3 className="font-bold text-xl text-gray-800 mb-2">Flexible Delivery</h3>
                <p className="text-gray-600">
                  Schedule deliveries according to your business needs with our logistics network.
                </p>
              </div>

              {/* Bulk Benefit 3 */}
              <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <div className="text-amber-600 text-4xl mb-4">
                  <i className="fas fa-tags"></i>
                </div>
                <h3 className="font-bold text-xl text-gray-800 mb-2">Private Labeling</h3>
                <p className="text-gray-600">
                  Custom branding options available for retailers and distributors.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Industries We Serve */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Industries We Serve</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Industry 1 */}
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-16 h-16 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
                  </svg>
                </div>
                <h3 className="font-bold text-xl text-gray-800 mb-2">Restaurants & Cafes</h3>
                <p className="text-gray-600">
                  High-quality ingredients for your culinary creations.
                </p>
              </div>

              {/* Industry 2 */}
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-16 h-16 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="font-bold text-xl text-gray-800 mb-2">Retailers</h3>
                <p className="text-gray-600">
                  Premium products to enhance your store's offerings.
                </p>
              </div>

              {/* Industry 3 */}
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-16 h-16 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="font-bold text-xl text-gray-800 mb-2">Hotels & Resorts</h3>
                <p className="text-gray-600">
                  Luxury ingredients for your hospitality services.
                </p>
              </div>

              {/* Industry 4 */}
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <div className="w-16 h-16 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-bold text-xl text-gray-800 mb-2">Corporate Gifting</h3>
                <p className="text-gray-600">
                  Impressive gift solutions for clients and employees.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Request Quote Form */}
        <section id="request-quote" className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Request a Quote</h2>

            <div className="max-w-3xl mx-auto bg-gray-50 rounded-lg shadow-md p-8">
              {submitSuccess ? (
                <div className="text-center py-8">
                  <div className="text-green-500 mb-4">
                    <i className="fas fa-check-circle mx-auto text-5xl"></i>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Request Submitted Successfully!</h3>
                  <p className="text-gray-600 mb-6">
                    Thank you for your interest in our bulk order services. Our team will review your request
                    and get back to you within 24-48 business hours.
                  </p>
                  <button
                    onClick={() => setSubmitSuccess(false)}
                    className="bg-amber-600 text-white px-6 py-3 rounded-md hover:bg-amber-700 font-medium"
                  >
                    Submit Another Request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  {submitError && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                      {submitError}
                    </div>
                  )}

                  {!isAuthenticated && (
                    <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-6">
                      <p className="mb-2">You are not signed in. Please sign in to submit a bulk order request.</p>
                      <Link
                        href="/auth/signin?redirect=/bulk-orders"
                        className="font-medium underline"
                      >
                        Sign in now
                      </Link>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                        Company Name
                      </label>
                      <input
                        type="text"
                        id="companyName"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="contactName" className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Name
                      </label>
                      <input
                        type="text"
                        id="contactName"
                        name="contactName"
                        value={formData.contactName}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className={`w-full px-4 py-2 border ${
                          formErrors.email ? 'border-red-500' : 'border-gray-300'
                        } rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500`}
                      />
                      {formErrors.email && (
                        <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label htmlFor="productDetails" className="block text-sm font-medium text-gray-700 mb-1">
                      Product Details <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="productDetails"
                      name="productDetails"
                      value={formData.productDetails}
                      onChange={handleChange}
                      required
                      placeholder="Please specify the products you're interested in and any special requirements."
                      rows={4}
                      className={`w-full px-4 py-2 border ${
                        formErrors.productDetails ? 'border-red-500' : 'border-gray-300'
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500`}
                    />
                    {formErrors.productDetails && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.productDetails}</p>
                    )}
                  </div>

                  <div className="mb-6">
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                      Estimated Quantity (kg) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="quantity"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleChange}
                      required
                      min="1"
                      className={`w-full px-4 py-2 border ${
                        formErrors.quantity ? 'border-red-500' : 'border-gray-300'
                      } rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500`}
                    />
                    {formErrors.quantity && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.quantity}</p>
                    )}
                  </div>

                  <div className="mb-8">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="customPackaging"
                        checked={formData.customPackaging}
                        onChange={handleCheckboxChange}
                        className="h-4 w-4 text-amber-600 focus:ring-amber-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-gray-700">I'm interested in custom packaging options</span>
                    </label>
                  </div>

                  <div className="text-center">
                    <button
                      type="submit"
                      disabled={submitting || !isAuthenticated}
                      className={`bg-amber-600 text-white px-6 py-3 rounded-md hover:bg-amber-700 font-medium ${
                        submitting || !isAuthenticated ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      {submitting ? 'Submitting...' : 'Submit Request'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
