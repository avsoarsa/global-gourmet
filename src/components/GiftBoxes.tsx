'use client';

export default function GiftBoxes() {
  return (
    <section className="py-12 bg-gray-50" id="gift-boxes">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Premium Gift Boxes</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Gift Box 1 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden transition duration-300 hover:shadow-lg">
            <img src="https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=735&q=80"
                 alt="Gourmet Delight Box"
                 className="w-full h-48 object-cover" />
            <div className="p-6">
              <h3 className="font-bold text-xl text-gray-800 mb-2">Gourmet Delight Box</h3>
              <p className="text-gray-600 mb-4">A carefully curated selection of our finest dry fruits and spices, perfect for gifting.</p>
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-800">$49.99</span>
                <button className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 font-medium">
                  Customize
                </button>
              </div>
            </div>
          </div>

          {/* Gift Box 2 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden transition duration-300 hover:shadow-lg">
            <img src="https://images.unsplash.com/photo-1601493700518-42b241a914d2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=687&q=80"
                 alt="Wellness Package"
                 className="w-full h-48 object-cover" />
            <div className="p-6">
              <h3 className="font-bold text-xl text-gray-800 mb-2">Wellness Package</h3>
              <p className="text-gray-600 mb-4">Organic superfoods and sprouts for health-conscious individuals.</p>
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-800">$59.99</span>
                <button className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 font-medium">
                  Customize
                </button>
              </div>
            </div>
          </div>

          {/* Gift Box 3 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden transition duration-300 hover:shadow-lg">
            <img src="https://images.unsplash.com/photo-1600348759200-5b94753c5a4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=880&q=80"
                 alt="Corporate Gift Hamper"
                 className="w-full h-48 object-cover" />
            <div className="p-6">
              <h3 className="font-bold text-xl text-gray-800 mb-2">Corporate Gift Hamper</h3>
              <p className="text-gray-600 mb-4">Premium selection for corporate gifting with customizable branding options.</p>
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-800">$99.99</span>
                <button className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 font-medium">
                  Customize
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mt-10">
          <button className="bg-amber-600 text-white px-6 py-3 rounded-md hover:bg-amber-700 font-medium">
            Create Your Own Gift Box
          </button>
        </div>
      </div>
    </section>
  );
}
