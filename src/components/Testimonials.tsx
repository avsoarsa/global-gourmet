'use client';

export default function Testimonials() {
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">What Our Customers Say</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Testimonial 1 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="flex text-amber-400 mr-2">
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
              </div>
            </div>
            <p className="text-gray-600 mb-4">"The quality of almonds I received was exceptional. They're now my regular supplier for my health food store."</p>
            <div className="flex items-center">
              <img src="https://randomuser.me/api/portraits/women/43.jpg"
                   alt="Sarah Johnson"
                   className="w-10 h-10 rounded-full mr-3" />
              <div>
                <h4 className="font-bold text-gray-800">Sarah Johnson</h4>
                <p className="text-gray-500 text-sm">Health Food Store Owner</p>
              </div>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="flex text-amber-400 mr-2">
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
              </div>
            </div>
            <p className="text-gray-600 mb-4">"Their corporate gift hampers were a hit with our clients. The packaging was elegant and the products premium quality."</p>
            <div className="flex items-center">
              <img src="https://randomuser.me/api/portraits/men/32.jpg"
                   alt="Michael Chen"
                   className="w-10 h-10 rounded-full mr-3" />
              <div>
                <h4 className="font-bold text-gray-800">Michael Chen</h4>
                <p className="text-gray-500 text-sm">Corporate Client</p>
              </div>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="flex text-amber-400 mr-2">
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star-half-alt"></i>
              </div>
            </div>
            <p className="text-gray-600 mb-4">"As a restaurant owner, I appreciate their consistent quality and reliable bulk delivery service for my kitchen needs."</p>
            <div className="flex items-center">
              <img src="https://randomuser.me/api/portraits/women/65.jpg"
                   alt="Elena Rodriguez"
                   className="w-10 h-10 rounded-full mr-3" />
              <div>
                <h4 className="font-bold text-gray-800">Elena Rodriguez</h4>
                <p className="text-gray-500 text-sm">Restaurant Owner</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
