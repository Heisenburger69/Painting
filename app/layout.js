import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';

export const metadata = {
  title: 'Atelier — Original Paintings & Fine Art Gallery',
  description: 'Original paintings for sale. Contemporary fine art gallery featuring landscapes, portraits, abstracts and more.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="bg-stars" />
        <div className="wrapper">
          <ScrollToTop />
          <Navbar />
          <main>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
