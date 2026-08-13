import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { formatPrice } from '../utils/helpers';
import RatingStars from './RatingStars';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);
  const [imgError, setImgError] = useState(false);
  const [adding, setAdding] = useState(false);

  const imageUrl = product.image_url || product.external_image_url || product.image;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setAdding(true);
    await addToCart(product.id, 1);
    setAdding(false);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <Link to={`/products/${product.id}`} className="product-card-link">
      <div className="product-card">
        {/* Image Container */}
        <div className="product-card-image">
          {imageUrl && !imgError ? (
            <img
              src={imageUrl}
              alt={product.name}
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="product-card-placeholder">
              {product.category_name === 'Electronics' ? '📱' :
               product.category_name === 'Fashion' ? '👕' :
               product.category_name === 'Shoes' ? '👟' :
               product.category_name === 'Books' ? '📚' :
               product.category_name === 'Beauty' ? '💄' :
               product.category_name === 'Sports' ? '⚽' :
               product.category_name === 'Accessories' ? '⌚' : '🛍️'}
            </div>
          )}

          {/* Badges */}
          {!product.in_stock ? (
            <span className="out-of-stock-badge">Sold Out</span>
          ) : product.discount_percentage >= 20 ? (
            <span className="featured-badge" style={{ background: 'linear-gradient(135deg, #ec4899, #f43f5e)' }}>
              {product.discount_percentage}% OFF
            </span>
          ) : product.is_featured ? (
            <span className="featured-badge">⭐ Bestseller</span>
          ) : null}

          {/* Wishlist Button Overlay */}
          <div className="product-card-overlay-actions">
            <button
              className={`overlay-btn ${inWishlist ? 'overlay-btn-active' : ''}`}
              onClick={handleWishlist}
              title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
              {inWishlist ? '♥' : '♡'}
            </button>
          </div>
        </div>

        {/* Card Body */}
        <div className="product-card-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
            <span className="product-card-category">{product.brand || product.category_name}</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: 600 }}>⚡ Free Express</span>
          </div>

          <h3 className="product-card-title">{product.name}</h3>

          <div className="product-card-rating">
            <RatingStars rating={product.rating} size="sm" showNumber />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>({product.review_count})</span>
          </div>

          <div className="product-card-price">
            <span className="price-current">{formatPrice(product.effective_price || product.price)}</span>
            {product.discount_price && (
              <>
                <span className="price-original">{formatPrice(product.price)}</span>
                <span className="price-discount">Save {formatPrice(product.price - product.discount_price)}</span>
              </>
            )}
          </div>
        </div>

        {/* Card Footer Actions */}
        <div className="product-card-actions">
          <button
            className={`btn btn-primary btn-sm flex-1 ${!product.in_stock ? 'btn-disabled' : ''}`}
            onClick={handleAddToCart}
            disabled={!product.in_stock || adding}
          >
            {adding ? 'Adding...' : product.in_stock ? '🛒 Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>

      <style>{`
        .product-card-link { text-decoration: none; display: block; height: 100%; }
        .overlay-btn-active { background: #ef4444 !important; border-color: #ef4444 !important; color: white !important; }
        .btn-disabled { opacity: 0.5; cursor: not-allowed; }
      `}</style>
    </Link>
  );
}
