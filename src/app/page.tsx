import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Hero from '@/components/Hero';
import FeaturedProducts from '@/components/FeaturedProducts';
import GiftBoxes from '@/components/GiftBoxes';
import BulkOrderSection from '@/components/BulkOrderSection';
import Testimonials from '@/components/Testimonials';
import AboutSection from '@/components/AboutSection';
import Newsletter from '@/components/Newsletter';
import Script from 'next/script';

export default function Home() {
  return (
    <div className="font-sans bg-gray-50">
      <Header />
      <main>
        <Hero />
        <FeaturedProducts />
        <GiftBoxes />
        <BulkOrderSection />
        <Testimonials />
        <AboutSection />
        <Newsletter />
      </main>
      <Footer />
      <Script id="category-tabs">
        {`
          // Category tab functionality
          document.addEventListener('DOMContentLoaded', function() {
            const categoryTabs = document.querySelectorAll('.category-tab');
            categoryTabs.forEach(tab => {
              tab.addEventListener('click', () => {
                categoryTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
              });
            });
          });
        `}
      </Script>
    </div>
  );
}
