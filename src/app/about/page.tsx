'use client';

// Using regular img tags instead of next/image
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AboutPage() {
  return (
    <div className="font-sans bg-gray-50">
      <Header />
      <main>
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-r from-amber-50 to-amber-100">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">About Global Gourmet</h1>
            <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
              Premium quality dry fruits, nuts, spices, and whole foods sourced from the finest farms and orchards around the world.
            </p>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-12 bg-white" id="our-story">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
                <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Story</h2>
                <p className="text-gray-600 mb-4">
                  Founded in 2010, Global Gourmet has grown from a small family business to an internationally
                  recognized supplier of premium dry fruits, spices, and whole foods.
                </p>
                <p className="text-gray-600 mb-4">
                  Our journey began when our founder, Sarah Johnson, discovered her passion for high-quality,
                  nutritious foods during her travels across Asia and the Middle East. Inspired by the rich
                  flavors and health benefits of traditional dry fruits and spices, she decided to bring these
                  premium products to a global audience.
                </p>
                <p className="text-gray-600 mb-6">
                  We work directly with farmers and producers across the globe to bring you the finest quality
                  products while ensuring fair trade practices and sustainable sourcing.
                </p>
                <div className="flex space-x-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-amber-600">13+</div>
                    <div className="text-gray-600">Years in Business</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-amber-600">50+</div>
                    <div className="text-gray-600">Countries Served</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-amber-600">1000+</div>
                    <div className="text-gray-600">Happy Clients</div>
                  </div>
                </div>
              </div>
              <div className="md:w-1/2">
                <div className="w-full">
                  <img
                    src="https://images.unsplash.com/photo-1606787366850-de6330128bfc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
                    alt="Our team working"
                    className="rounded-lg shadow-lg w-full h-96 object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Mission Section */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Mission</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              To provide the highest quality natural foods that nourish the body, delight the senses,
              and support sustainable farming practices around the world.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-16 h-16 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="font-bold text-xl text-gray-800 mb-2">Quality</h3>
                <p className="text-gray-600">
                  We source only the finest products, rigorously testing for quality, freshness, and nutritional value.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-16 h-16 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-xl text-gray-800 mb-2">Sustainability</h3>
                <p className="text-gray-600">
                  We partner with farmers who use sustainable practices to protect our planet for future generations.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="w-16 h-16 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
                <h3 className="font-bold text-xl text-gray-800 mb-2">Fair Trade</h3>
                <p className="text-gray-600">
                  We ensure fair compensation for farmers and workers throughout our supply chain.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Sustainability Section */}
        <section className="py-12 bg-white" id="sustainability">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Our Commitment to Sustainability</h2>

            <div className="flex flex-col md:flex-row items-center mb-12">
              <div className="md:w-1/2 mb-8 md:mb-0 md:pr-10 order-2 md:order-1">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Sustainable Sourcing</h3>
                <p className="text-gray-600 mb-4">
                  We carefully select our partner farms based on their commitment to sustainable agricultural practices.
                  This includes organic farming methods, water conservation, and biodiversity preservation.
                </p>
                <p className="text-gray-600">
                  By working directly with farmers, we ensure transparency throughout our supply chain and
                  support communities that are dedicated to protecting our environment.
                </p>
              </div>
              <div className="md:w-1/2 order-1 md:order-2">
                <div className="w-full">
                  <img
                    src="https://images.unsplash.com/photo-1601493700518-42b241a914d2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80"
                    alt="Sustainable farming"
                    className="rounded-lg shadow-lg w-full h-64 md:h-80 object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-8 md:mb-0">
                <div className="w-full">
                  <img
                    src="https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=735&q=80"
                    alt="Eco-friendly packaging"
                    className="rounded-lg shadow-lg w-full h-64 md:h-80 object-cover"
                  />
                </div>
              </div>
              <div className="md:w-1/2 md:pl-10">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Eco-Friendly Packaging</h3>
                <p className="text-gray-600 mb-4">
                  We're committed to reducing our environmental footprint through sustainable packaging solutions.
                  Our packaging materials are either recyclable, biodegradable, or made from recycled content.
                </p>
                <p className="text-gray-600">
                  By 2025, we aim to make 100% of our packaging sustainable, further reducing our impact on the planet.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Meet Our Team</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Team Member 1 */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="w-full h-64">
                  <img
                    src="https://randomuser.me/api/portraits/women/43.jpg"
                    alt="Sarah Johnson - Founder & CEO"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 text-center">
                  <h3 className="font-bold text-xl text-gray-800 mb-1">Sarah Johnson</h3>
                  <p className="text-amber-600 mb-4">Founder & CEO</p>
                  <p className="text-gray-600 text-sm">
                    With a passion for quality foods and sustainable practices, Sarah founded Global Gourmet in 2010.
                  </p>
                </div>
              </div>

              {/* Team Member 2 */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="w-full h-64">
                  <img
                    src="https://randomuser.me/api/portraits/men/32.jpg"
                    alt="Michael Chen - Head of Operations"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 text-center">
                  <h3 className="font-bold text-xl text-gray-800 mb-1">Michael Chen</h3>
                  <p className="text-amber-600 mb-4">Head of Operations</p>
                  <p className="text-gray-600 text-sm">
                    Michael oversees our global supply chain, ensuring quality and efficiency at every step.
                  </p>
                </div>
              </div>

              {/* Team Member 3 */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="w-full h-64">
                  <img
                    src="https://randomuser.me/api/portraits/women/65.jpg"
                    alt="Elena Rodriguez - Quality Assurance"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 text-center">
                  <h3 className="font-bold text-xl text-gray-800 mb-1">Elena Rodriguez</h3>
                  <p className="text-amber-600 mb-4">Quality Assurance</p>
                  <p className="text-gray-600 text-sm">
                    With a background in food science, Elena ensures all our products meet the highest standards.
                  </p>
                </div>
              </div>

              {/* Team Member 4 */}
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="w-full h-64">
                  <img
                    src="https://randomuser.me/api/portraits/men/75.jpg"
                    alt="David Patel - Sustainability Director"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 text-center">
                  <h3 className="font-bold text-xl text-gray-800 mb-1">David Patel</h3>
                  <p className="text-amber-600 mb-4">Sustainability Director</p>
                  <p className="text-gray-600 text-sm">
                    David leads our sustainability initiatives, working with farmers to implement eco-friendly practices.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 bg-amber-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-6">Experience the Global Gourmet Difference</h2>
            <p className="text-xl mb-8 max-w-3xl mx-auto">
              Discover our premium selection of dry fruits, nuts, spices, and whole foods sourced from around the world.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                href="/products"
                className="bg-white text-amber-600 px-6 py-3 rounded-md hover:bg-gray-100 font-medium"
              >
                Shop Now
              </Link>
              <Link
                href="/contact"
                className="border border-white text-white px-6 py-3 rounded-md hover:bg-amber-700 font-medium"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
