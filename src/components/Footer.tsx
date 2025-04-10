'use client';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Column 1 */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <i className="fas fa-seedling text-amber-400 text-2xl"></i>
              <h3 className="text-xl font-bold">Global Gourmet</h3>
            </div>
            <p className="text-gray-400 mb-4">Premium quality dry fruits, spices, and whole foods sourced from around the world.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-amber-400">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-amber-400">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-amber-400">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-amber-400">
                <i className="fab fa-linkedin-in"></i>
              </a>
            </div>
          </div>

          {/* Column 2 */}
          <div>
            <h4 className="font-bold text-lg mb-4">Shop</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-amber-400">Dry Fruits</a></li>
              <li><a href="#" className="text-gray-400 hover:text-amber-400">Nuts & Seeds</a></li>
              <li><a href="#" className="text-gray-400 hover:text-amber-400">Spices</a></li>
              <li><a href="#" className="text-gray-400 hover:text-amber-400">Whole Foods</a></li>
              <li><a href="#" className="text-gray-400 hover:text-amber-400">Sprouts</a></li>
              <li><a href="#" className="text-gray-400 hover:text-amber-400">Superfoods</a></li>
            </ul>
          </div>

          {/* Column 3 */}
          <div>
            <h4 className="font-bold text-lg mb-4">Company</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-amber-400">About Us</a></li>
              <li><a href="#" className="text-gray-400 hover:text-amber-400">Our Story</a></li>
              <li><a href="#" className="text-gray-400 hover:text-amber-400">Sustainability</a></li>
              <li><a href="#" className="text-gray-400 hover:text-amber-400">Blog</a></li>
              <li><a href="#" className="text-gray-400 hover:text-amber-400">Careers</a></li>
              <li><a href="#" className="text-gray-400 hover:text-amber-400">Contact Us</a></li>
            </ul>
          </div>

          {/* Column 4 */}
          <div>
            <h4 className="font-bold text-lg mb-4">Customer Service</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-amber-400">FAQs</a></li>
              <li><a href="#" className="text-gray-400 hover:text-amber-400">Shipping Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-amber-400">Return Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-amber-400">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-400 hover:text-amber-400">Terms of Service</a></li>
              <li><a href="#" className="text-gray-400 hover:text-amber-400">Bulk Orders</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 mb-4 md:mb-0">© 2023 Global Gourmet. All rights reserved.</p>
          <div className="flex space-x-6">
            <img src="https://via.placeholder.com/40x25" alt="Visa" className="h-6" />
            <img src="https://via.placeholder.com/40x25" alt="Mastercard" className="h-6" />
            <img src="https://via.placeholder.com/40x25" alt="Amex" className="h-6" />
            <img src="https://via.placeholder.com/40x25" alt="PayPal" className="h-6" />
          </div>
        </div>
      </div>
    </footer>
  );
}
