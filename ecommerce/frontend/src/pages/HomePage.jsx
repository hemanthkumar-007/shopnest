import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService, categoryService } from '../services';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/LoadingStates';
import toast from 'react-hot-toast';

const HERO_SLIDES = [
  {
    badge: '🔥 Apple Flagship Launch',
    title: 'Titanium. So Strong. So Light.',
    highlight: 'iPhone 15 Pro Max',
    subtitle: 'Featuring the groundbreaking A17 Pro chip, 5x Optical Zoom, and aerospace-grade titanium design.',
    ctaText: 'Explore iPhone',
    ctaLink: '/products/1',
    bgGradient: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
    price: '₹1,49,900',
    originalPrice: '₹1,59,900',
  },
  {
    badge: '👟 Active & Athletics',
    title: 'Unrivaled Comfort & Energy',
    highlight: 'Nike Air Max 270',
    subtitle: 'Triple Black Edition featuring the largest 270 Max Air heel unit for maximum all-day bounce.',
    ctaText: 'Shop Footwear',
    ctaLink: '/category/shoes',
    bgGradient: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
    price: '₹10,995',
    originalPrice: '₹13,995',
  },
  {
    badge: '🎧 Hi-Res Audiophile Gear',
    title: 'Silence the World. Hear the Music.',
    highlight: 'Sony WH-1000XM5',
    subtitle: 'Industry-leading noise cancellation with 8 microphones, 30-hour battery, and LDAC studio acoustics.',
    ctaText: 'Shop Audio',
    ctaLink: '/category/electronics',
    bgGradient: 'linear-gradient(135deg, #2e1065 0%, #0f172a 100%)',
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
    price: '₹26,990',
    originalPrice: '₹34,990',
  },
];

const BRANDS = [
  { name: 'Apple', logo: '🍎' },
  { name: 'Samsung', logo: '📱' },
  { name: 'Nike', logo: '✔️' },
  { name: 'Sony', logo: '🎧' },
  { name: 'Adidas', logo: '👟' },
  { name: 'Philips', logo: '💡' },
  { name: 'Ray-Ban', logo: '🕶️' },
  { name: 'Fossil', logo: '⌚' },
  { name: 'Instant Pot', logo: '🍲' },
];

export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');

  // Flash deal countdown state
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 32, seconds: 45 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto advance hero slides
  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length);
    }, 5500);
    return () => clearInterval(slideTimer);
  }, []);

  useEffect(() => {
    Promise.all([
      productService.getFeatured(),
      productService.getNewArrivals(),
      productService.getBestSellers(),
      categoryService.getAll(),
    ]).then(([featRes, newRes, bestRes, catRes]) => {
      setFeatured(featRes.data.data || []);
      setNewArrivals(newRes.data.data || []);
      setBestSellers(bestRes.data.data || []);
      setCategories(catRes.data.results || catRes.data || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const slide = HERO_SLIDES[currentSlide];

  return (
    <div className="home-page">
      {/* ===== HERO CAROUSEL ===== */}
      <section className="hero-carousel" style={{ background: slide.bgGradient }}>
        <div className="hero-carousel-content">
          <div className="hero-badge">{slide.badge}</div>
          <h1 className="hero-title">
            {slide.title}<br />
            <span className="hero-title-accent">{slide.highlight}</span>
          </h1>
          <p className="hero-subtitle">{slide.subtitle}</p>
          
          <div className="hero-pricing">
            <span className="hero-price-current">{slide.price}</span>
            <span className="hero-price-original">{slide.originalPrice}</span>
            <span className="badge badge-success">Special Offer</span>
          </div>

          <div className="hero-cta">
            <Link to={slide.ctaLink} className="btn btn-primary btn-lg">
              🛍️ {slide.ctaText} →
            </Link>
            <Link to="/products" className="btn btn-outline btn-lg">
              Browse All Catalog
            </Link>
          </div>
        </div>

        <div className="hero-carousel-visual">
          <div className="hero-image-wrapper">
            <img src={slide.image} alt={slide.highlight} className="hero-slide-img" />
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="hero-dots">
          {HERO_SLIDES.map((_, idx) => (
            <button
              key={idx}
              className={`hero-dot ${idx === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(idx)}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* ===== FLASH DEALS TICKER ===== */}
      <section className="flash-deal-banner">
        <div className="flash-deal-left">
          <span className="flash-icon">⚡</span>
          <div>
            <div className="flash-title">Flash Deal of the Day</div>
            <div className="flash-subtitle">Up to 50% OFF on Top Tech & Lifestyle Brands</div>
          </div>
        </div>
        <div className="flash-countdown">
          <div className="countdown-box">
            <span className="countdown-number">{String(timeLeft.hours).padStart(2, '0')}</span>
            <span className="countdown-label">HRS</span>
          </div>
          <span className="countdown-sep">:</span>
          <div className="countdown-box">
            <span className="countdown-number">{String(timeLeft.minutes).padStart(2, '0')}</span>
            <span className="countdown-label">MIN</span>
          </div>
          <span className="countdown-sep">:</span>
          <div className="countdown-box">
            <span className="countdown-number">{String(timeLeft.seconds).padStart(2, '0')}</span>
            <span className="countdown-label">SEC</span>
          </div>
        </div>
      </section>

      {/* ===== BRAND MARQUEE ===== */}
      <section className="brand-marquee-section">
        <div className="brand-marquee-label">Trusted by Top Global Brands</div>
        <div className="brand-marquee-track">
          {BRANDS.map(b => (
            <Link key={b.name} to={`/products?search=${encodeURIComponent(b.name)}`} className="brand-chip">
              <span className="brand-icon">{b.logo}</span>
              <span className="brand-name">{b.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="section">
        <div className="section-header">
          <div>
            <h2 className="section-title">Shop by Category</h2>
            <p className="section-subtitle">Explore curated high-demand collections</p>
          </div>
          <Link to="/products" className="btn btn-outline btn-sm">View All ({categories.length}) →</Link>
        </div>
        <div className="categories-grid-rich">
          {loading ? (
            Array(8).fill(null).map((_, i) => (
              <div key={i} className="category-card-rich skeleton-card" style={{ height: '180px' }} />
            ))
          ) : (
            categories.slice(0, 8).map((cat) => (
              <Link key={cat.id} to={`/category/${cat.slug}`} className="category-card-rich">
                <div className="category-img-container">
                  <img
                    src={cat.image_url || 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=600&q=80'}
                    alt={cat.name}
                    className="category-img"
                  />
                  <div className="category-overlay">
                    <h3 className="category-name-rich">{cat.name}</h3>
                    <span className="category-count-rich">{cat.product_count} Products</span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* ===== FEATURED PRODUCTS ===== */}
      <section className="section">
        <div className="section-header">
          <div>
            <h2 className="section-title">⭐ Featured Collection</h2>
            <p className="section-subtitle">Hand-picked bestsellers with top customer ratings</p>
          </div>
          <Link to="/products?is_featured=true" className="btn btn-outline btn-sm">View All →</Link>
        </div>
        {loading ? <ProductGridSkeleton count={4} /> : (
          <div className="product-grid">
            {featured.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* ===== PROMO BANNER ===== */}
      <section className="promo-banner-rich">
        <div className="promo-rich-content">
          <div className="promo-badge">🎉 Special Promotion</div>
          <h2 className="promo-title">Audio & Smart Wearables Fest</h2>
          <p className="promo-subtitle">
            Get up to ₹5,000 instant discount on Sony WH-1000XM5, Fossil Gen 6, and Apple AirPods.
          </p>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <Link to="/category/electronics" className="btn btn-primary btn-lg">
              Explore Deals →
            </Link>
            <span style={{ fontSize: '0.85rem', color: '#a5b4fc' }}>Coupon: <strong>SAVE10</strong> applied at checkout</span>
          </div>
        </div>
      </section>

      {/* ===== NEW ARRIVALS ===== */}
      <section className="section">
        <div className="section-header">
          <div>
            <h2 className="section-title">🆕 New Arrivals</h2>
            <p className="section-subtitle">The freshest drops just landed this week</p>
          </div>
          <Link to="/products?ordering=-created_at" className="btn btn-outline btn-sm">View All →</Link>
        </div>
        {loading ? <ProductGridSkeleton count={4} /> : (
          <div className="product-grid">
            {newArrivals.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* ===== TRUST PILLARS ===== */}
      <section className="trust-section-rich">
        <div className="trust-grid">
          <div className="trust-item">
            <span className="trust-icon">🚀</span>
            <div>
              <div className="trust-title">Free Express Delivery</div>
              <div className="trust-desc">Guaranteed 2-4 day shipping on all orders over ₹499</div>
            </div>
          </div>
          <div className="trust-item">
            <span className="trust-icon">🔒</span>
            <div>
              <div className="trust-title">100% Secure Payment</div>
              <div className="trust-desc">Encrypted checkout via UPI, Cards, NetBanking, and COD</div>
            </div>
          </div>
          <div className="trust-item">
            <span className="trust-icon">↩️</span>
            <div>
              <div className="trust-title">30-Day Easy Returns</div>
              <div className="trust-desc">Hassle-free doorstep pickup and instant refunds</div>
            </div>
          </div>
          <div className="trust-item">
            <span className="trust-icon">🎖️</span>
            <div>
              <div className="trust-title">100% Genuine Guarantee</div>
              <div className="trust-desc">Direct from verified authorized brand distributors</div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== NEWSLETTER ===== */}
      <section className="newsletter-section">
        <div className="newsletter-content">
          <div className="promo-badge" style={{ marginBottom: '16px' }}>🎁 Welcome Gift</div>
          <h2 className="newsletter-title">Subscribe & Save ₹500</h2>
          <p className="newsletter-subtitle">
            Join 200,000+ happy shoppers. Get exclusive discounts, early access drops, and VIP coupons.
          </p>
          <form
            className="newsletter-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (email) {
                toast.success('🎉 Welcome! Use coupon code WELCOME50 for ₹500 off!');
                setEmail('');
              }
            }}
          >
            <input
              type="email"
              placeholder="Enter your email (e.g. you@example.com)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="newsletter-input"
              required
            />
            <button type="submit" className="btn btn-primary">Claim ₹500 Off</button>
          </form>
          <p className="newsletter-hint">No spam ever. Unsubscribe anytime in one click.</p>
        </div>
      </section>

      <style>{`
        .home-page { padding-bottom: 20px; }
        
        /* Hero Carousel */
        .hero-carousel {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 40px;
          align-items: center;
          border-radius: var(--radius-xl);
          padding: 60px 48px;
          margin-bottom: 36px;
          border: 1px solid var(--border);
          position: relative;
          overflow: hidden;
          transition: background 0.6s ease;
          min-height: 480px;
        }
        .hero-carousel-content { position: relative; z-index: 2; }
        .hero-badge {
          display: inline-block;
          background: rgba(99, 102, 241, 0.25);
          border: 1px solid rgba(99, 102, 241, 0.4);
          color: #a5b4fc;
          padding: 6px 14px;
          border-radius: var(--radius-full);
          font-size: 0.8rem;
          font-weight: 700;
          margin-bottom: 16px;
        }
        .hero-title {
          font-size: clamp(2rem, 3.5vw, 3rem);
          font-weight: 900;
          line-height: 1.2;
          margin-bottom: 16px;
        }
        .hero-title-accent {
          background: linear-gradient(135deg, #818cf8, #c084fc, #f472b6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-subtitle {
          color: var(--text-secondary);
          font-size: 0.95rem;
          line-height: 1.6;
          margin-bottom: 20px;
          max-width: 520px;
        }
        .hero-pricing {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 28px;
        }
        .hero-price-current { font-size: 1.8rem; font-weight: 800; color: #fff; }
        .hero-price-original { font-size: 1.1rem; color: var(--text-muted); text-decoration: line-through; }
        .hero-cta { display: flex; gap: 14px; flex-wrap: wrap; }
        
        .hero-carousel-visual {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 2;
        }
        .hero-image-wrapper {
          width: 100%;
          max-width: 420px;
          aspect-ratio: 4/3;
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--glass-border);
          background: var(--bg-card);
        }
        .hero-slide-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s ease;
        }
        .hero-slide-img:hover { transform: scale(1.04); }

        .hero-dots {
          position: absolute;
          bottom: 20px;
          left: 48px;
          display: flex;
          gap: 8px;
          z-index: 3;
        }
        .hero-dot {
          width: 28px;
          height: 6px;
          border-radius: var(--radius-full);
          background: rgba(255, 255, 255, 0.3);
          border: none;
          cursor: pointer;
          transition: var(--transition);
        }
        .hero-dot.active {
          background: var(--primary);
          width: 48px;
        }

        /* Flash Deal Banner */
        .flash-deal-banner {
          background: linear-gradient(135deg, #831843, #500724);
          border: 1px solid rgba(244, 63, 94, 0.3);
          border-radius: var(--radius-lg);
          padding: 16px 28px;
          margin-bottom: 36px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }
        .flash-deal-left { display: flex; align-items: center; gap: 14px; }
        .flash-icon { font-size: 2rem; animation: pulse 1.5s infinite; }
        .flash-title { font-weight: 800; font-size: 1.1rem; color: #fff; }
        .flash-subtitle { color: #fecdd3; font-size: 0.85rem; }
        .flash-countdown { display: flex; align-items: center; gap: 8px; }
        .countdown-box {
          background: rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: var(--radius-md);
          padding: 6px 12px;
          text-align: center;
          min-width: 48px;
        }
        .countdown-number { display: block; font-size: 1.2rem; font-weight: 800; color: #fef08a; }
        .countdown-label { font-size: 0.65rem; color: #cbd5e1; font-weight: 600; }
        .countdown-sep { font-size: 1.2rem; font-weight: 800; color: #fef08a; }

        /* Brand Marquee */
        .brand-marquee-section {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 20px 24px;
          margin-bottom: 48px;
        }
        .brand-marquee-label {
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-muted);
          margin-bottom: 14px;
          text-align: center;
          font-weight: 700;
        }
        .brand-marquee-track {
          display: flex;
          align-items: center;
          justify-content: space-around;
          flex-wrap: wrap;
          gap: 12px;
        }
        .brand-chip {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: var(--radius-full);
          text-decoration: none;
          color: var(--text-primary);
          font-size: 0.85rem;
          font-weight: 600;
          transition: var(--transition);
        }
        .brand-chip:hover {
          border-color: var(--primary);
          background: var(--primary-glow);
          transform: translateY(-2px);
        }

        /* Rich Categories */
        .categories-grid-rich {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        .category-card-rich {
          border-radius: var(--radius-lg);
          overflow: hidden;
          border: 1px solid var(--border);
          transition: var(--transition);
          display: block;
          position: relative;
        }
        .category-card-rich:hover {
          transform: translateY(-4px);
          border-color: var(--primary);
          box-shadow: var(--shadow-lg);
        }
        .category-img-container {
          position: relative;
          aspect-ratio: 16/10;
          overflow: hidden;
          background: var(--bg-secondary);
        }
        .category-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .category-card-rich:hover .category-img { transform: scale(1.08); }
        .category-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.3) 60%, transparent 100%);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 16px;
        }
        .category-name-rich {
          color: #fff;
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 2px;
        }
        .category-count-rich {
          font-size: 0.75rem;
          color: #a5b4fc;
          font-weight: 500;
        }

        /* Promo Banner */
        .promo-banner-rich {
          background: linear-gradient(135deg, #1e1b4b, #312e81);
          border: 1px solid rgba(99, 102, 241, 0.4);
          border-radius: var(--radius-xl);
          padding: 48px;
          margin-bottom: 56px;
          position: relative;
          overflow: hidden;
        }
        .promo-rich-content { max-width: 600px; position: relative; z-index: 2; }

        /* Trust Section */
        .trust-section-rich {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
          padding: 32px 40px;
          margin-bottom: 56px;
        }

        @media (max-width: 1024px) {
          .hero-carousel { grid-template-columns: 1fr; padding: 36px 24px; }
          .hero-carousel-visual { display: none; }
          .categories-grid-rich { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
          .flash-deal-banner { flex-direction: column; text-align: center; }
          .trust-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
