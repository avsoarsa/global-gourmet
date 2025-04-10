'use client';

export default function AboutSection() {
  return (
    <section className="py-12 bg-white" id="about">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0 md:pr-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Our Story</h2>
            <p className="text-gray-600 mb-4">Founded in 2010, Global Gourmet has grown from a small family business to an internationally recognized supplier of premium dry fruits, spices, and whole foods.</p>
            <p className="text-gray-600 mb-6">We work directly with farmers and producers across the globe to bring you the finest quality products while ensuring fair trade practices and sustainable sourcing.</p>
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
            <img src="https://images.unsplash.com/photo-1606787366850-de6330128bfc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
                 alt="Our team working"
                 className="rounded-lg shadow-lg w-full" />
          </div>
        </div>
      </div>
    </section>
  );
}
