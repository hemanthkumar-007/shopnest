import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <div className="footer-logo">
              <span>🛍️</span>
              <span className="footer-logo-text">ShopNest</span>
            </div>
            <p className="footer-description">
              Your one-stop shop for all things premium. Quality products, fast delivery, and exceptional service.
            </p>
            <div className="footer-social">
              <a href="#" className="social-link">📘</a>
              <a href="#" className="social-link">🐦</a>
              <a href="#" className="social-link">📸</a>
              <a href="#" className="social-link">▶️</a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/products">All Products</Link></li>
              <li><Link to="/cart">Cart</Link></li>
              <li><Link to="/wishlist">Wishlist</Link></li>
              <li><Link to="/orders">My Orders</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="footer-section">
            <h4 className="footer-heading">Categories</h4>
            <ul className="footer-links">
              <li><Link to="/category/electronics">Electronics</Link></li>
              <li><Link to="/category/fashion">Fashion</Link></li>
              <li><Link to="/category/shoes">Shoes</Link></li>
              <li><Link to="/category/accessories">Accessories</Link></li>
              <li><Link to="/category/books">Books</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="footer-section">
            <h4 className="footer-heading">Support</h4>
            <ul className="footer-links">
              <li><a href="#">Help Center</a></li>
              <li><a href="#">Track Order</a></li>
              <li><a href="#">Returns</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-divider" />

        <div className="footer-bottom">
          <p>&copy; 2026 ShopNest. All rights reserved.</p>
          <div className="payment-methods">
            <span className="payment-badge">💳 Visa</span>
            <span className="payment-badge">💳 Mastercard</span>
            <span className="payment-badge">📱 UPI</span>
            <span className="payment-badge">🏦 Net Banking</span>
          </div>
        </div>
      </div>

      <style>{`
        .footer {
          background: var(--bg-secondary);
          border-top: 1px solid var(--border);
          padding: 60px 0 24px;
          margin-top: 80px;
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 48px;
          margin-bottom: 48px;
        }
        .footer-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 16px;
          font-size: 1.2rem;
        }
        .footer-logo-text {
          font-size: 1.4rem;
          font-weight: 800;
          background: linear-gradient(135deg, #fff, var(--primary-light));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .footer-description {
          color: var(--text-secondary);
          font-size: 0.875rem;
          line-height: 1.7;
          margin-bottom: 20px;
        }
        .footer-social {
          display: flex;
          gap: 10px;
        }
        .social-link {
          width: 36px;
          height: 36px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          transition: var(--transition);
          text-decoration: none;
        }
        .social-link:hover {
          border-color: var(--primary);
          background: var(--primary-glow);
          transform: translateY(-2px);
        }
        .footer-heading {
          font-size: 0.875rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-primary);
          margin-bottom: 20px;
        }
        .footer-links {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .footer-links a {
          color: var(--text-secondary);
          font-size: 0.875rem;
          text-decoration: none;
          transition: var(--transition);
        }
        .footer-links a:hover { color: var(--primary-light); }
        .footer-divider { height: 1px; background: var(--border); margin-bottom: 24px; }
        .footer-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: var(--text-muted);
          font-size: 0.8rem;
        }
        .payment-methods { display: flex; gap: 8px; flex-wrap: wrap; }
        .payment-badge {
          padding: 4px 10px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          color: var(--text-secondary);
        }
        @media (max-width: 1024px) {
          .footer-grid { grid-template-columns: 1fr 1fr; gap: 32px; }
        }
        @media (max-width: 480px) {
          .footer-grid { grid-template-columns: 1fr; gap: 24px; }
          .footer-bottom { flex-direction: column; gap: 16px; text-align: center; }
        }
      `}</style>
    </footer>
  );
}
