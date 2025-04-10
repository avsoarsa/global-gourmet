'use client';

export default function BulkOrderSection() {
  return (
    <section className="py-12 bg-white" id="bulk-orders">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Bulk Orders for Businesses</h2>

        <div className="flex flex-col md:flex-row items-center bg-gradient-to-r from-amber-50 to-amber-100 rounded-xl p-8 mb-12">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Wholesale Pricing for Businesses</h3>
            <p className="text-gray-700 mb-6">We offer competitive wholesale pricing for restaurants, hotels, retailers, and other businesses. Our bulk orders come with customized packaging options and flexible delivery schedules.</p>
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
            <button className="bg-amber-600 text-white px-6 py-3 rounded-md hover:bg-amber-700 font-medium">
              Request Quote
            </button>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <img src="https://images.unsplash.com/photo-1606787366850-de6330128bfc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
                 alt="Bulk order packaging"
                 className="rounded-lg shadow-lg max-w-full h-auto max-h-64" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Bulk Benefit 1 */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <div className="text-amber-600 text-4xl mb-4">
              <i className="fas fa-boxes"></i>
            </div>
            <h3 className="font-bold text-xl text-gray-800 mb-2">Volume Discounts</h3>
            <p className="text-gray-600">Significant savings on large quantity orders with tiered pricing structure.</p>
          </div>

          {/* Bulk Benefit 2 */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <div className="text-amber-600 text-4xl mb-4">
              <i className="fas fa-truck"></i>
            </div>
            <h3 className="font-bold text-xl text-gray-800 mb-2">Flexible Delivery</h3>
            <p className="text-gray-600">Schedule deliveries according to your business needs with our logistics network.</p>
          </div>

          {/* Bulk Benefit 3 */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
            <div className="text-amber-600 text-4xl mb-4">
              <i className="fas fa-tags"></i>
            </div>
            <h3 className="font-bold text-xl text-gray-800 mb-2">Private Labeling</h3>
            <p className="text-gray-600">Custom branding options available for retailers and distributors.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
