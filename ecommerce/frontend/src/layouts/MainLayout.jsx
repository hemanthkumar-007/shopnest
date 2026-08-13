import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function MainLayout({ children }) {
  return (
    <>
      <Navbar />
      <main className="page-wrapper">
        <div className="container">
          {children}
        </div>
      </main>
      <Footer />
    </>
  );
}
