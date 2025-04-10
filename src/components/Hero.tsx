'use client';

import Image from 'next/image';

export default function Hero() {
  return (
    <section className="gradient-bg">
      <div className="container mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 mb-10 md:mb-0">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">Premium Quality Dry Fruits & Spices</h1>
          <p className="text-lg text-gray-600 mb-6">Sourced from the finest orchards and farms across the globe. 100% natural, organic, and packed with nutrients.</p>
          <div className="flex space-x-4">
            <button className="bg-amber-600 text-white px-6 py-3 rounded-md hover:bg-amber-700 font-medium">Shop Now</button>
            <button className="border border-amber-600 text-amber-600 px-6 py-3 rounded-md hover:bg-amber-50 font-medium">Learn More</button>
          </div>
        </div>
        <div className="md:w-1/2 flex justify-center">
          <Image
            src="https://images.unsplash.com/photo-1606787366850-de6330128bfc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
            alt="Assorted dry fruits and spices"
            width={700}
            height={400}
            className="rounded-lg shadow-lg max-w-full h-auto max-h-96"
          />
        </div>
      </div>
    </section>
  );
}
