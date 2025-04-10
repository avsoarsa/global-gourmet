'use client';

export default function Newsletter() {
  return (
    <section className="py-12 bg-amber-600 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Join Our Newsletter</h2>
        <p className="mb-6 max-w-2xl mx-auto">Subscribe to receive updates on new products, special offers, and health tips from our nutrition experts.</p>
        <div className="flex flex-col sm:flex-row max-w-md mx-auto sm:max-w-xl">
          <input type="email" 
                 placeholder="Your email address" 
                 className="px-4 py-3 rounded-l-md sm:rounded-r-none rounded-r-md mb-2 sm:mb-0 w-full text-gray-800" />
          <button className="bg-gray-800 text-white px-6 py-3 rounded-r-md sm:rounded-l-none rounded-l-md hover:bg-gray-900 font-medium whitespace-nowrap">
            Subscribe
          </button>
        </div>
      </div>
    </section>
  );
}
