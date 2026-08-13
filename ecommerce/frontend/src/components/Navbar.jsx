import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { productService } from '../services';
import { formatPrice } from '../utils/helpers';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMenuOpen(false);
    setProfileOpen(false);
    setShowSuggestions(false);
  }, [location]);

  // Click outside search to dismiss suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search autocomplete
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await productService.getAll({ search: searchQuery.trim(), page: 1 });
        setSuggestions((res.data.results || []).slice(0, 5));
        setShowSuggestions(true);
      } catch (err) {
        console.error(err);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSelectProduct = (productId) => {
    setShowSuggestions(false);
    setSearchQuery('');
    navigate(`/products/${productId}`);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      {/* Top Announcement Bar */}
      <div className="announcement-bar">
        <div className="container announcement-inner">
          <span className="announcement-badge">⚡ Limited Offer</span>
          <span>Get <strong>20% OFF</strong> with coupon code <code className="coupon-tag">FESTIVE20</code> on orders above ₹2,999!</span>
          <span className="announcement-link"><Link to="/products">Shop Deals →</Link></span>
        </div>
      </div>

      <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
        <div className="container navbar-inner">
          {/* Logo */}
          <Link to="/" className="navbar-logo">
            <span className="logo-icon">🛍️</span>
            <span className="logo-text">ShopNest</span>
          </Link>

          {/* Quick Categories Bar */}
          <div className="navbar-nav-links">
            <Link to="/products" className="nav-link">All Products</Link>
            <Link to="/category/electronics" className="nav-link">Electronics</Link>
            <Link to="/category/fashion" className="nav-link">Fashion</Link>
            <Link to="/category/shoes" className="nav-link">Shoes</Link>
            <Link to="/category/beauty" className="nav-link">Beauty</Link>
          </div>

          {/* Search with Live Dropdown */}
          <div className="navbar-search-wrapper" ref={searchRef}>
            <form className="navbar-search" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search products, brands (iPhone, Nike, Sony)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                className="navbar-search-input"
              />
              <button type="submit" className="navbar-search-btn" aria-label="Search">
                🔍
              </button>
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="search-suggestions-dropdown">
                <div className="suggestions-header">Products matching "{searchQuery}"</div>
                {suggestions.map((p) => (
                  <div
                    key={p.id}
                    className="suggestion-item"
                    onClick={() => handleSelectProduct(p.id)}
                  >
                    <img
                      src={p.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=100&q=80'}
                      alt={p.name}
                      className="suggestion-thumb"
                    />
                    <div className="suggestion-info">
                      <div className="suggestion-title">{p.name}</div>
                      <div className="suggestion-meta">
                        <span className="suggestion-cat">{p.category_name}</span>
                        <span className="suggestion-price">{formatPrice(p.effective_price || p.price)}</span>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="suggestion-footer" onClick={handleSearch}>
                  View all results for "{searchQuery}" →
                </div>
              </div>
            )}
          </div>

          {/* Nav Actions */}
          <div className="navbar-actions">
            {/* Wishlist */}
            <Link to="/wishlist" className="nav-action-btn" title="Wishlist">
              <span className="nav-action-icon">♡</span>
              {wishlistCount > 0 && (
                <span className="nav-badge">{wishlistCount}</span>
              )}
            </Link>

            {/* Cart */}
            <Link to="/cart" className="nav-action-btn" title="Cart">
              <span className="nav-action-icon">🛒</span>
              {itemCount > 0 && (
                <span className="nav-badge">{itemCount}</span>
              )}
            </Link>

            {/* Auth */}
            {isAuthenticated ? (
              <div className="profile-dropdown-wrapper">
                <button
                  className="profile-btn"
                  onClick={() => setProfileOpen(!profileOpen)}
                >
                  <span className="profile-avatar">
                    {user?.first_name?.[0]?.toUpperCase() || 'U'}
                  </span>
                  <span className="profile-name">{user?.first_name}</span>
                  <span className="dropdown-arrow">{profileOpen ? '▲' : '▼'}</span>
                </button>

                {profileOpen && (
                  <div className="profile-dropdown">
                    <div className="dropdown-header">
                      <div className="dropdown-user-name">{user?.first_name} {user?.last_name}</div>
                      <div className="dropdown-user-email">{user?.email}</div>
                    </div>
                    <div className="dropdown-divider" />
                    <Link to="/profile" className="dropdown-item">👤 My Profile</Link>
                    <Link to="/orders" className="dropdown-item">📦 My Orders & Tracking</Link>
                    <Link to="/wishlist" className="dropdown-item">♡ Wishlist ({wishlistCount})</Link>
                    {isAdmin && (
                      <Link to="/admin" className="dropdown-item dropdown-item-admin">⚡ Admin Dashboard</Link>
                    )}
                    <div className="dropdown-divider" />
                    <button onClick={handleLogout} className="dropdown-item dropdown-item-logout">
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
              </div>
            )}

            {/* Mobile menu toggle */}
            <button
              className="mobile-menu-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="mobile-menu">
            <form onSubmit={handleSearch} className="mobile-search">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input"
              />
              <button type="submit" className="btn btn-primary">Search</button>
            </form>
            <div className="mobile-nav-links">
              <Link to="/products" className="mobile-nav-link">All Products</Link>
              <Link to="/category/electronics" className="mobile-nav-link">📱 Electronics</Link>
              <Link to="/category/fashion" className="mobile-nav-link">👕 Fashion</Link>
              <Link to="/category/shoes" className="mobile-nav-link">👟 Shoes</Link>
              <Link to="/category/beauty" className="mobile-nav-link">💄 Beauty</Link>
              <Link to="/cart" className="mobile-nav-link">🛒 Cart ({itemCount})</Link>
              <Link to="/wishlist" className="mobile-nav-link">♡ Wishlist ({wishlistCount})</Link>
              {isAuthenticated ? (
                <>
                  <Link to="/profile" className="mobile-nav-link">👤 My Profile</Link>
                  <Link to="/orders" className="mobile-nav-link">📦 My Orders</Link>
                  {isAdmin && <Link to="/admin" className="mobile-nav-link">⚡ Admin</Link>}
                  <button onClick={handleLogout} className="mobile-nav-link mobile-logout">🚪 Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="mobile-nav-link">Login</Link>
                  <Link to="/register" className="mobile-nav-link">Sign Up</Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Overlay for dropdown close */}
      {profileOpen && (
        <div className="dropdown-overlay" onClick={() => setProfileOpen(false)} />
      )}

      <style>{`
        .announcement-bar {
          background: linear-gradient(90deg, #4f46e5, #7c3aed, #ec4899);
          color: white;
          font-size: 0.8rem;
          padding: 6px 0;
          text-align: center;
          position: relative;
          z-index: 101;
        }
        .announcement-inner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          flex-wrap: wrap;
        }
        .announcement-badge {
          background: rgba(255, 255, 255, 0.2);
          padding: 2px 8px;
          border-radius: var(--radius-full);
          font-weight: 700;
          font-size: 0.7rem;
        }
        .coupon-tag {
          background: rgba(0, 0, 0, 0.3);
          padding: 2px 6px;
          border-radius: 4px;
          font-weight: 700;
          letter-spacing: 0.05em;
        }
        .announcement-link a {
          color: #fef08a;
          font-weight: 600;
          text-decoration: underline;
        }
        .navbar {
          position: sticky;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          height: var(--navbar-height);
          background: rgba(15, 23, 42, 0.9);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
          transition: var(--transition);
        }
        .navbar-scrolled {
          background: rgba(15, 23, 42, 0.98);
          box-shadow: var(--shadow-md);
        }
        .navbar-inner {
          display: flex;
          align-items: center;
          gap: 20px;
          height: 100%;
        }
        .navbar-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          flex-shrink: 0;
        }
        .logo-icon { font-size: 1.6rem; }
        .logo-text {
          font-size: 1.35rem;
          font-weight: 800;
          background: linear-gradient(135deg, #fff, var(--primary-light));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .navbar-nav-links {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .nav-link {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-secondary);
          transition: var(--transition);
        }
        .nav-link:hover { color: var(--primary-light); }
        .navbar-search-wrapper {
          flex: 1;
          max-width: 440px;
          position: relative;
        }
        .navbar-search {
          display: flex;
          background: var(--bg-secondary);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-full);
          overflow: hidden;
          transition: var(--transition);
        }
        .navbar-search:focus-within {
          border-color: var(--primary);
          box-shadow: 0 0 0 3px var(--primary-glow);
        }
        .navbar-search-input {
          flex: 1;
          background: transparent;
          border: none;
          padding: 10px 16px;
          color: var(--text-primary);
          font-size: 0.85rem;
          outline: none;
        }
        .navbar-search-input::placeholder { color: var(--text-muted); }
        .navbar-search-btn {
          padding: 8px 16px;
          background: var(--primary);
          border: none;
          cursor: pointer;
          font-size: 0.95rem;
          transition: var(--transition);
        }
        .navbar-search-btn:hover { background: var(--primary-dark); }
        
        /* Autocomplete Suggestions */
        .search-suggestions-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          background: var(--bg-card);
          border: 1px solid var(--border-hover);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          overflow: hidden;
          z-index: 210;
          animation: slideUp 0.15s ease;
        }
        .suggestions-header {
          padding: 10px 16px;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border);
        }
        .suggestion-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 16px;
          border-bottom: 1px solid var(--border);
          cursor: pointer;
          transition: var(--transition);
        }
        .suggestion-item:hover { background: var(--primary-glow); }
        .suggestion-thumb {
          width: 40px;
          height: 40px;
          object-fit: cover;
          border-radius: var(--radius-sm);
          background: var(--bg-secondary);
        }
        .suggestion-info { flex: 1; min-width: 0; }
        .suggestion-title {
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--text-primary);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .suggestion-meta { display: flex; gap: 8px; font-size: 0.75rem; margin-top: 2px; }
        .suggestion-cat { color: var(--text-muted); }
        .suggestion-price { color: var(--primary-light); font-weight: 700; }
        .suggestion-footer {
          padding: 10px 16px;
          font-size: 0.8rem;
          color: var(--primary-light);
          text-align: center;
          cursor: pointer;
          background: var(--bg-secondary);
          font-weight: 600;
        }
        .suggestion-footer:hover { text-decoration: underline; }

        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
        .nav-action-btn {
          position: relative;
          width: 40px;
          height: 40px;
          border-radius: var(--radius-md);
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          transition: var(--transition);
          cursor: pointer;
        }
        .nav-action-btn:hover {
          border-color: var(--primary);
          background: var(--primary-glow);
        }
        .nav-action-icon { font-size: 1.1rem; }
        .nav-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: var(--primary);
          color: white;
          font-size: 0.65rem;
          font-weight: 700;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--bg-primary);
        }
        .auth-buttons {
          display: flex;
          gap: 8px;
        }
        .profile-dropdown-wrapper { position: relative; }
        .profile-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 12px;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: var(--radius-full);
          cursor: pointer;
          color: var(--text-primary);
          font-size: 0.875rem;
          transition: var(--transition);
        }
        .profile-btn:hover { border-color: var(--primary); }
        .profile-avatar {
          width: 28px;
          height: 28px;
          background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
          color: white;
        }
        .profile-name { font-weight: 500; }
        .dropdown-arrow { font-size: 0.65rem; color: var(--text-muted); }
        .profile-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          background: var(--bg-card);
          border: 1px solid var(--border-hover);
          border-radius: var(--radius-lg);
          width: 220px;
          padding: 8px;
          box-shadow: var(--shadow-lg);
          animation: fadeInDown 0.15s ease;
          z-index: 200;
        }
        .dropdown-header { padding: 8px 12px 12px; }
        .dropdown-user-name { font-weight: 600; font-size: 0.9rem; }
        .dropdown-user-email { font-size: 0.75rem; color: var(--text-muted); margin-top: 2px; }
        .dropdown-divider { height: 1px; background: var(--border); margin: 4px 0; }
        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 9px 12px;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          font-size: 0.875rem;
          text-decoration: none;
          transition: var(--transition);
          cursor: pointer;
          width: 100%;
          background: none;
          border: none;
          text-align: left;
        }
        .dropdown-item:hover { background: var(--primary-glow); color: var(--primary-light); }
        .dropdown-item-admin { color: var(--accent); }
        .dropdown-item-admin:hover { background: rgba(245, 158, 11, 0.1); color: var(--accent); }
        .dropdown-item-logout:hover { background: var(--error-light); color: var(--error); }
        .dropdown-overlay {
          position: fixed;
          inset: 0;
          z-index: 150;
        }
        .mobile-menu-btn {
          display: none;
          padding: 8px;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          font-size: 1.1rem;
          cursor: pointer;
        }
        .mobile-menu {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          background: var(--bg-card);
          border-bottom: 1px solid var(--border);
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          animation: fadeInDown 0.15s ease;
          box-shadow: var(--shadow-md);
        }
        .mobile-search { display: flex; gap: 8px; }
        .mobile-nav-links { display: flex; flex-direction: column; gap: 4px; }
        .mobile-nav-link {
          padding: 10px 14px;
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
          transition: var(--transition);
          border: none;
          background: none;
          cursor: pointer;
          text-align: left;
          width: 100%;
        }
        .mobile-nav-link:hover { background: var(--primary-glow); color: var(--primary); }
        .mobile-logout:hover { background: var(--error-light); color: var(--error); }
        @media (max-width: 1024px) {
          .navbar-nav-links { display: none; }
        }
        @media (max-width: 768px) {
          .announcement-bar { font-size: 0.72rem; }
          .navbar-search-wrapper { display: none; }
          .auth-buttons { display: none; }
          .profile-btn .profile-name { display: none; }
          .profile-btn .dropdown-arrow { display: none; }
          .mobile-menu-btn { display: flex; }
        }
        @media (max-width: 480px) {
          .profile-btn { display: none; }
        }
      `}</style>
    </>
  );
}
