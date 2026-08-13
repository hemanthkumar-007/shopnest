import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productService, reviewService } from '../services';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice, formatDate } from '../utils/helpers';
import RatingStars, { InteractiveStars } from '../components/RatingStars';
import ProductCard from '../components/ProductCard';
import { PageLoader } from '../components/LoadingStates';
import toast from 'react-hot-toast';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeTab, setActiveTab] = useState('highlights');
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  // Delivery check state
  const [pincode, setPincode] = useState('');
  const [deliveryResult, setDeliveryResult] = useState(null);

  useEffect(() => {
    setLoading(true);
    window.scrollTo(0, 0);
    Promise.all([
      productService.getById(id),
      reviewService.getProductReviews(id),
    ]).then(async ([prodRes, revRes]) => {
      const prod = prodRes.data;
      setProduct(prod);
      setSelectedImage(prod.image_url || prod.external_image_url || prod.image);
      setReviews(revRes.data.data?.reviews || []);
      setAvgRating(revRes.data.data?.average_rating || prod.rating || 0);

      // Fetch related products in the same category
      if (prod.category?.slug) {
        try {
          const relRes = await productService.getAll({ category: prod.category.slug, page: 1 });
          setRelatedProducts((relRes.data.results || []).filter(p => p.id !== prod.id).slice(0, 4));
        } catch {}
      }
    }).catch(() => navigate('/products')).finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    setAddingToCart(true);
    await addToCart(product.id, quantity);
    setAddingToCart(false);
  };

  const handleBuyNow = async () => {
    await addToCart(product.id, quantity);
    navigate('/checkout');
  };

  const handleCheckPincode = (e) => {
    e.preventDefault();
    if (pincode.length >= 6) {
      setDeliveryResult({
        available: true,
        date: 'Delivered by 2-3 Business Days (Express Courier)',
        courier: 'BlueDart Express',
      });
    } else {
      toast.error('Please enter a valid 6-digit PIN code');
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { toast.error('Please login to write a review'); return; }
    setSubmittingReview(true);
    try {
      await reviewService.createReview(id, reviewForm);
      toast.success('Review submitted successfully!');
      setReviewForm({ rating: 5, comment: '' });
      const revRes = await reviewService.getProductReviews(id);
      setReviews(revRes.data.data?.reviews || []);
      setAvgRating(revRes.data.data?.average_rating || 0);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!product) return null;

  const inWishlist = isInWishlist(product.id);
  const images = [
    product.image_url || product.external_image_url || product.image,
    ...(product.additional_images?.map(i => i.image_url || i.external_image_url) || [])
  ].filter(Boolean);

  const specs = product.specifications || {};
  const highlights = product.highlights || [];

  return (
    <div className="product-detail-page">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <Link to="/">Home</Link>
        <span className="sep">›</span>
        <Link to="/products">Products</Link>
        <span className="sep">›</span>
        {product.category && (
          <>
            <Link to={`/category/${product.category.slug}`}>{product.category.name}</Link>
            <span className="sep">›</span>
          </>
        )}
        <span className="current">{product.name}</span>
      </div>

      <div className="product-detail-grid">
        {/* Image Gallery */}
        <div className="product-gallery">
          <div className="gallery-main">
            {selectedImage ? (
              <img src={selectedImage} alt={product.name} className="gallery-main-image" />
            ) : (
              <div className="gallery-placeholder">🛍️</div>
            )}
            {!product.in_stock ? (
              <div className="gallery-out-of-stock">Sold Out</div>
            ) : product.discount_percentage > 0 ? (
              <div className="gallery-discount-badge">{product.discount_percentage}% OFF</div>
            ) : null}
          </div>

          {images.length > 1 && (
            <div className="gallery-thumbs">
              {images.map((img, i) => (
                <button
                  key={i}
                  className={`gallery-thumb ${selectedImage === img ? 'active' : ''}`}
                  onClick={() => setSelectedImage(img)}
                >
                  <img src={img} alt={`View ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="product-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            {product.brand && (
              <span className="product-brand-tag">{product.brand}</span>
            )}
            {product.category && (
              <Link to={`/category/${product.category.slug}`} className="product-category-badge">
                {product.category.name}
              </Link>
            )}
          </div>

          <h1 className="product-name">{product.name}</h1>

          {/* Rating & Reviews */}
          <div className="product-rating-row">
            <div className="rating-pill">
              <RatingStars rating={avgRating || product.rating} size="sm" showNumber />
            </div>
            <span className="product-review-count">
              <strong>{product.review_count}</strong> Verified Ratings & Reviews
            </span>
          </div>

          {/* Price */}
          <div className="product-price-section">
            <span className="product-price-current">
              {formatPrice(product.effective_price || product.price)}
            </span>
            {product.discount_price && (
              <>
                <span className="product-price-original">{formatPrice(product.price)}</span>
                <span className="badge badge-success">Save {formatPrice(product.price - product.discount_price)}</span>
              </>
            )}
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Inclusive of all taxes • 18% GST invoice included
          </div>

          {/* Stock */}
          <div className={`product-stock ${product.in_stock ? 'in-stock' : 'out-of-stock'}`}>
            {product.in_stock ? `✅ In Stock (${product.stock} units left)` : '❌ Currently Out of Stock'}
          </div>

          {/* Quantity */}
          {product.in_stock && (
            <div className="quantity-selector">
              <span className="quantity-label">Quantity:</span>
              <div className="quantity-controls">
                <button
                  className="qty-btn"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                >−</button>
                <span className="qty-display">{quantity}</span>
                <button
                  className="qty-btn"
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                >+</button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="product-actions">
            <button
              className="btn btn-primary btn-lg flex-1"
              onClick={handleAddToCart}
              disabled={!product.in_stock || addingToCart}
            >
              {addingToCart ? 'Adding...' : '🛒 Add to Cart'}
            </button>
            <button
              className="btn btn-success btn-lg flex-1"
              onClick={handleBuyNow}
              disabled={!product.in_stock}
            >
              ⚡ Instant Checkout
            </button>
            <button
              className={`btn btn-lg ${inWishlist ? 'btn-danger' : 'btn-outline'}`}
              onClick={() => toggleWishlist(product.id)}
              style={{ minWidth: '52px' }}
              title="Save to wishlist"
            >
              {inWishlist ? '♥' : '♡'}
            </button>
          </div>

          {/* Delivery Estimator */}
          <div className="delivery-checker">
            <div className="delivery-checker-title">📍 Check Delivery & Courier Availability</div>
            <form onSubmit={handleCheckPincode} className="delivery-checker-form">
              <input
                type="text"
                placeholder="Enter 6-digit Pincode (e.g. 400001)"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                maxLength={6}
                className="delivery-input"
              />
              <button type="submit" className="btn btn-outline btn-sm">Check</button>
            </form>
            {deliveryResult && (
              <div className="delivery-result">
                <span>🚚 {deliveryResult.date}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>via {deliveryResult.courier}</span>
              </div>
            )}
          </div>

          {/* Trust badges */}
          <div className="product-highlights-box">
            <div className="highlight-item">🛡️ 100% Original Brand Authentic Product</div>
            <div className="highlight-item">🚚 Free Express Delivery on orders above ₹499</div>
            <div className="highlight-item">↩️ 30-Day Hassle-Free Doorstep Returns</div>
            <div className="highlight-item">💳 Cash on Delivery & Zero Cost EMI available</div>
          </div>
        </div>
      </div>

      {/* Tabs (Highlights, Specs, Description, Reviews) */}
      <div className="product-tabs-section">
        <div className="tabs">
          <button className={`tab ${activeTab === 'highlights' ? 'active' : ''}`} onClick={() => setActiveTab('highlights')}>
            ✨ Key Highlights
          </button>
          {Object.keys(specs).length > 0 && (
            <button className={`tab ${activeTab === 'specs' ? 'active' : ''}`} onClick={() => setActiveTab('specs')}>
              ⚙️ Specifications
            </button>
          )}
          <button className={`tab ${activeTab === 'description' ? 'active' : ''}`} onClick={() => setActiveTab('description')}>
            📄 Description
          </button>
          <button className={`tab ${activeTab === 'reviews' ? 'active' : ''}`} onClick={() => setActiveTab('reviews')}>
            ⭐ Customer Reviews ({reviews.length})
          </button>
        </div>

        {/* Highlights Tab */}
        {activeTab === 'highlights' && (
          <div className="tab-content">
            {highlights.length > 0 ? (
              <ul className="highlights-list">
                {highlights.map((h, i) => (
                  <li key={i} className="highlight-bullet">
                    <span className="highlight-check">✓</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ color: 'var(--text-secondary)' }}>{product.description}</p>
            )}
          </div>
        )}

        {/* Specs Tab */}
        {activeTab === 'specs' && (
          <div className="tab-content">
            <table className="specs-table">
              <tbody>
                {Object.entries(specs).map(([key, val]) => (
                  <tr key={key}>
                    <td className="spec-label">{key}</td>
                    <td className="spec-value">{val}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Description Tab */}
        {activeTab === 'description' && (
          <div className="tab-content">
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.95rem' }}>
              {product.description}
            </p>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="tab-content">
            <div className="reviews-summary-rich">
              <div className="reviews-score-box">
                <span className="reviews-big-rating">{Number(avgRating).toFixed(1)}</span>
                <RatingStars rating={avgRating} size="lg" />
                <span className="text-muted">{reviews.length} total reviews</span>
              </div>
              <div className="rating-bars">
                {[
                  { star: 5, pct: 82 },
                  { star: 4, pct: 14 },
                  { star: 3, pct: 3 },
                  { star: 2, pct: 1 },
                  { star: 1, pct: 0 },
                ].map(r => (
                  <div key={r.star} className="rating-bar-row">
                    <span style={{ fontSize: '0.8rem', minWidth: '32px' }}>{r.star} ★</span>
                    <div className="rating-bar-track">
                      <div className="rating-bar-fill" style={{ width: `${r.pct}%` }} />
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: '36px' }}>{r.pct}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Review form */}
            {isAuthenticated ? (
              <form onSubmit={handleSubmitReview} className="review-form">
                <h4>Write a Product Review</h4>
                <div className="form-group">
                  <label className="form-label">Your Rating</label>
                  <InteractiveStars
                    value={reviewForm.rating}
                    onChange={(r) => setReviewForm(prev => ({ ...prev, rating: r }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Review Details</label>
                  <textarea
                    className="form-textarea"
                    rows={4}
                    placeholder="Describe your authentic experience with this product..."
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={submittingReview}>
                  {submittingReview ? 'Submitting...' : 'Submit Verified Review'}
                </button>
              </form>
            ) : (
              <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '24px', textAlign: 'center' }}>
                <Link to="/login" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>Login to write a customer review →</Link>
              </div>
            )}

            {/* Reviews list */}
            <div className="reviews-list">
              {reviews.map(review => (
                <div key={review.id} className="review-item">
                  <div className="review-header">
                    <div className="review-avatar">{review.user_name?.[0] || 'U'}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span className="review-user">{review.user_name}</span>
                        <span className="verified-badge">✓ Verified Buyer</span>
                      </div>
                      <div className="review-meta">
                        <RatingStars rating={review.rating} size="sm" />
                        <span className="review-date">{formatDate(review.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  <p className="review-comment">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div style={{ marginTop: '56px' }}>
          <h2 className="section-title" style={{ marginBottom: '20px' }}>Customers Also Viewed</h2>
          <div className="product-grid">
            {relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}

      <style>{`
        .product-detail-page { padding-bottom: 40px; }
        .product-detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          margin-bottom: 48px;
        }
        .gallery-main {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          position: relative;
          margin-bottom: 12px;
        }
        .gallery-main-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }
        .gallery-discount-badge {
          position: absolute;
          top: 16px;
          left: 16px;
          background: linear-gradient(135deg, #ec4899, #f43f5e);
          color: white;
          padding: 4px 12px;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 700;
        }
        .gallery-thumbs { display: flex; gap: 10px; overflow-x: auto; }
        .gallery-thumb {
          width: 72px;
          height: 72px;
          border: 2px solid var(--border);
          border-radius: var(--radius-md);
          overflow: hidden;
          cursor: pointer;
          transition: var(--transition);
          background: var(--bg-card);
          flex-shrink: 0;
        }
        .gallery-thumb.active { border-color: var(--primary); }
        .gallery-thumb img { width: 100%; height: 100%; object-fit: cover; }
        
        .product-brand-tag {
          background: var(--bg-secondary);
          color: var(--primary-light);
          padding: 3px 10px;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
        }
        .product-category-badge {
          background: var(--primary-glow);
          color: var(--primary-light);
          padding: 3px 10px;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
        }
        .product-name {
          font-size: 1.8rem;
          font-weight: 800;
          margin-bottom: 14px;
          line-height: 1.3;
        }
        .product-rating-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 18px;
        }
        .rating-pill {
          background: rgba(245, 158, 11, 0.15);
          padding: 4px 10px;
          border-radius: var(--radius-md);
        }
        .product-review-count { font-size: 0.85rem; color: var(--text-secondary); }
        .product-price-section {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 4px;
          flex-wrap: wrap;
        }
        .product-price-current { font-size: 2.2rem; font-weight: 900; color: #fff; }
        .product-price-original { font-size: 1.2rem; color: var(--text-muted); text-decoration: line-through; }
        .product-stock { font-size: 0.9rem; font-weight: 600; margin-bottom: 18px; }
        .in-stock { color: var(--success); }
        .out-of-stock { color: var(--error); }
        .quantity-selector { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
        .quantity-controls { display: flex; align-items: center; gap: 4px; }
        .qty-btn {
          width: 36px; height: 36px;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          font-size: 1.2rem;
          cursor: pointer;
          transition: var(--transition);
          display: flex; align-items: center; justify-content: center;
        }
        .qty-btn:hover { border-color: var(--primary); }
        .qty-display { width: 44px; text-align: center; font-weight: 700; font-size: 1.1rem; }
        .product-actions { display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; }
        
        .delivery-checker {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 16px;
          margin-bottom: 20px;
        }
        .delivery-checker-title { font-size: 0.85rem; font-weight: 600; margin-bottom: 10px; }
        .delivery-checker-form { display: flex; gap: 8px; }
        .delivery-input {
          flex: 1;
          padding: 8px 12px;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          font-size: 0.85rem;
          outline: none;
        }
        .delivery-result {
          margin-top: 10px;
          font-size: 0.85rem;
          color: var(--success);
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        
        .product-highlights-box {
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .highlight-item { font-size: 0.82rem; color: var(--text-secondary); }
        
        /* Tabs Content */
        .highlights-list { list-style: none; display: flex; flex-direction: column; gap: 12px; }
        .highlight-bullet { display: flex; align-items: flex-start; gap: 10px; font-size: 0.95rem; color: var(--text-primary); }
        .highlight-check { color: var(--success); font-weight: 800; }
        
        .specs-table { width: 100%; border-collapse: collapse; }
        .specs-table tr { border-bottom: 1px solid var(--border); }
        .specs-table tr:last-child { border-bottom: none; }
        .spec-label { padding: 12px 16px; font-weight: 600; color: var(--text-secondary); width: 30%; background: var(--bg-secondary); font-size: 0.85rem; }
        .spec-value { padding: 12px 16px; color: var(--text-primary); font-size: 0.9rem; }
        
        .reviews-summary-rich { display: grid; grid-template-columns: 200px 1fr; gap: 32px; margin-bottom: 32px; align-items: center; }
        .reviews-score-box { text-align: center; }
        .reviews-big-rating { font-size: 3.5rem; font-weight: 900; color: #fff; display: block; }
        .rating-bars { display: flex; flex-direction: column; gap: 6px; }
        .rating-bar-row { display: flex; align-items: center; gap: 8px; }
        .rating-bar-track { flex: 1; height: 8px; background: var(--bg-secondary); border-radius: var(--radius-full); overflow: hidden; }
        .rating-bar-fill { height: 100%; background: #f59e0b; border-radius: var(--radius-full); }
        
        .verified-badge {
          background: rgba(16, 185, 129, 0.15);
          color: var(--success);
          font-size: 0.7rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
        }

        @media (max-width: 768px) {
          .product-detail-grid { grid-template-columns: 1fr; }
          .reviews-summary-rich { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
