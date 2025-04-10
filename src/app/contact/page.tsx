'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaCheckCircle } from 'react-icons/fa';

export default function ContactPage() {
  const searchParams = useSearchParams();
  const subjectParam = searchParams.get('subject');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: subjectParam || '',
    message: '',
  });
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
  
  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.name) {
      errors.name = 'Name is required';
    }
    
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.subject) {
      errors.subject = 'Subject is required';
    }
    
    if (!formData.message) {
      errors.message = 'Message is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setSubmitting(false);
      setSubmitSuccess(true);
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    }, 1500);
  };
  
  return (
    <div className="font-sans bg-gray-50">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-r from-amber-50 to-amber-100">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Contact Us</h1>
            <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
              Have questions or feedback? We'd love to hear from you. Get in touch with our team.
            </p>
          </div>
        </section>
        
        {/* Contact Form Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Contact Information */}
              <div className="lg:w-1/3">
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Contact Information</h2>
                  
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="text-amber-600 mt-1 mr-3">
                        <FaMapMarkerAlt />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">Address</h3>
                        <p className="text-gray-600">
                          123 Gourmet Street<br />
                          San Francisco, CA 94103<br />
                          United States
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="text-amber-600 mt-1 mr-3">
                        <FaPhone />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">Phone</h3>
                        <p className="text-gray-600">
                          +1 (555) 123-4567
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="text-amber-600 mt-1 mr-3">
                        <FaEnvelope />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">Email</h3>
                        <p className="text-gray-600">
                          info@globalgourmet.com
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="text-amber-600 mt-1 mr-3">
                        <FaClock />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-800">Business Hours</h3>
                        <p className="text-gray-600">
                          Monday - Friday: 9:00 AM - 6:00 PM<br />
                          Saturday: 10:00 AM - 4:00 PM<br />
                          Sunday: Closed
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Follow Us</h2>
                  
                  <div className="flex space-x-4">
                    <a href="#" className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                      </svg>
                    </a>
                    <a href="#" className="bg-blue-400 text-white p-2 rounded-full hover:bg-blue-500">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                      </svg>
                    </a>
                    <a href="#" className="bg-pink-600 text-white p-2 rounded-full hover:bg-pink-700">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    </a>
                    <a href="#" className="bg-blue-700 text-white p-2 rounded-full hover:bg-blue-800">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
              
              {/* Contact Form */}
              <div className="lg:w-2/3">
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-bold text-gray-800 mb-6">Send Us a Message</h2>
                  
                  {submitSuccess ? (
                    <div className="text-center py-8">
                      <div className="text-green-500 mb-4">
                        <FaCheckCircle className="mx-auto text-5xl" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-4">Message Sent Successfully!</h3>
                      <p className="text-gray-600 mb-6">
                        Thank you for contacting us. We'll get back to you as soon as possible.
                      </p>
                      <button
                        onClick={() => setSubmitSuccess(false)}
                        className="bg-amber-600 text-white px-6 py-3 rounded-md hover:bg-amber-700 font-medium"
                      >
                        Send Another Message
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Your Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border ${
                              formErrors.name ? 'border-red-500' : 'border-gray-300'
                            } rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500`}
                          />
                          {formErrors.name && (
                            <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
                          )}
                        </div>
                        
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Your Email <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`w-full px-4 py-2 border ${
                              formErrors.email ? 'border-red-500' : 'border-gray-300'
                            } rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500`}
                          />
                          {formErrors.email && (
                            <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                          Subject <span className="text-red-500">*</span>
                        </label>
                        <select
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          className={`w-full px-4 py-2 border ${
                            formErrors.subject ? 'border-red-500' : 'border-gray-300'
                          } rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500`}
                        >
                          <option value="">Select a subject</option>
                          <option value="General Inquiry">General Inquiry</option>
                          <option value="Product Information">Product Information</option>
                          <option value="Order Status">Order Status</option>
                          <option value="Bulk Orders">Bulk Orders</option>
                          <option value="Corporate Gifting">Corporate Gifting</option>
                          <option value="Feedback">Feedback</option>
                          <option value="Other">Other</option>
                        </select>
                        {formErrors.subject && (
                          <p className="mt-1 text-sm text-red-500">{formErrors.subject}</p>
                        )}
                      </div>
                      
                      <div className="mb-6">
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                          Message <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          rows={6}
                          className={`w-full px-4 py-2 border ${
                            formErrors.message ? 'border-red-500' : 'border-gray-300'
                          } rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500`}
                        />
                        {formErrors.message && (
                          <p className="mt-1 text-sm text-red-500">{formErrors.message}</p>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <button
                          type="submit"
                          disabled={submitting}
                          className={`bg-amber-600 text-white px-6 py-3 rounded-md hover:bg-amber-700 font-medium ${
                            submitting ? 'opacity-70 cursor-not-allowed' : ''
                          }`}
                        >
                          {submitting ? 'Sending...' : 'Send Message'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Map Section */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Find Us</h2>
            
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="aspect-w-16 aspect-h-9">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.0968870204824!2d-122.41941548468204!3d37.77492997975903!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8085809c6c8f4459%3A0xb10ed6d9b5050fa5!2sMarket%20St%2C%20San%20Francisco%2C%20CA!5e0!3m2!1sen!2sus!4v1626285417326!5m2!1sen!2sus"
                  width="100%"
                  height="450"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  title="Global Gourmet Location"
                ></iframe>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
