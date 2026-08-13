import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { orderService } from '../services';
import { formatPrice } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function CartPage() {
  const { cart, loading, updateItem, removeItem, clearCart } = useCart();
  const navigate = useNavigate();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  if (loading) return <div className="loading-container"><div className="spinner" /></div>;

  const isEmpty = !cart || !cart.items || cart.items.length === 0;

  const subtotal = cart ? Number(cart.subtotal) : 0;
  const discount = appliedCoupon ? appliedCoupon.discount_amount : 0;
  const taxableSubtotal = Math.max(0, subtotal - discount);
  const shipping = taxableSubtotal >= 500 || subtotal === 0 ? 0 : 49;
  const tax = Number((taxableSubtotal * 0.18).toFixed(2));
  const finalTotal = taxableSubtotal + shipping + tax;

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    try {
      const res = await orderService.validateCoupon(couponCode.trim(), subtotal);
      setAppliedCoupon(res.data.data);
      toast.success(`🎉 Coupon ${res.data.data.code} applied! You saved ${formatPrice(res.data.data.discount_amount)}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired coupon code');
      setAppliedCoupon(null);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    toast.success('Coupon removed');
  };

  const freeShippingNeeded = Math.max(0, 500 - subtotal);
  const freeShippingProgress = Math.min(100, Math.round((subtotal / 500) * 100));

  return (
    <div className="cart-page">
      <h1 className="page-title" style={{ marginBottom: '28px' }}>🛒 Shopping Cart</h1>

      {isEmpty ? (
        <div className="empty-state">
          <div className="empty-state-icon">🛒</div>
          <h3>Your cart is empty</h3>
          <p>Add items to your cart to explore discounts, express shipping, and seamless checkout.</p>
          <Link to="/products" className="btn btn-primary btn-lg">Browse Products</Link>
        </div>
      ) : (
        <div className="cart-layout">
          {/* Cart Items Column */}
          <div className="cart-items-col">
            {/* Free Shipping Meter */}
            <div className="free-shipping-meter">
              <div className="meter-header">
                {freeShippingNeeded === 0 ? (
                  <span style={{ color: 'var(--success)', fontWeight: 700 }}>🎉 You have unlocked FREE Express Delivery!</span>
                ) : (
                  <span>Add <strong>{formatPrice(freeShippingNeeded)}</strong> more to get <strong>FREE Express Shipping</strong></span>
                )}
              </div>
              <div className="meter-bar-track">
                <div className="meter-bar-fill" style={{ width: `${freeShippingProgress}%` }} />
              </div>
            </div>

            <div className="cart-items-card">
              <div className="cart-items-header">
                <span>Cart Items ({cart.total_items})</span>
                <button className="btn btn-ghost btn-sm" onClick={clearCart} style={{ color: 'var(--error)' }}>
                  🗑️ Clear All
                </button>
              </div>

              {cart.items.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-image">
                    {item.product.image_url ? (
                      <img src={item.product.image_url} alt={item.product.name} />
                    ) : (
                      <div className="cart-item-placeholder">🛍️</div>
                    )}
                  </div>

                  <div className="cart-item-details">
                    <Link to={`/products/${item.product.id}`} className="cart-item-name">
                      {item.product.name}
                    </Link>
                    {item.product.brand && (
                      <div className="cart-item-brand">Brand: <strong>{item.product.brand}</strong></div>
                    )}
                    <div className="cart-item-price">
                      {formatPrice(item.product.effective_price || item.product.price)}
                      {item.product.discount_price && (
                        <span className="cart-item-original">{formatPrice(item.product.price)}</span>
                      )}
                    </div>
                  </div>

                  <div className="cart-item-controls">
                    <div className="quantity-controls">
                      <button className="qty-btn" onClick={() => updateItem(item.id, item.quantity - 1)}>−</button>
                      <span className="qty-display">{item.quantity}</span>
                      <button className="qty-btn" onClick={() => updateItem(item.id, item.quantity + 1)}>+</button>
                    </div>
                    <div className="cart-item-total">{formatPrice(item.total_price)}</div>
                    <button className="btn btn-ghost btn-sm" onClick={() => removeItem(item.id)} title="Remove item">🗑️</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Popular Coupons Tip Box */}
            <div className="popular-coupons-box">
              <div className="popular-coupons-title">🎟️ Available Coupons to Copy & Apply:</div>
              <div className="coupon-pills">
                <button className="coupon-pill" onClick={() => setCouponCode('FESTIVE20')}>
                  <strong>FESTIVE20</strong> (20% off above ₹2,999)
                </button>
                <button className="coupon-pill" onClick={() => setCouponCode('WELCOME50')}>
                  <strong>WELCOME50</strong> (₹500 flat off above ₹1,500)
                </button>
                <button className="coupon-pill" onClick={() => setCouponCode('SAVE10')}>
                  <strong>SAVE10</strong> (10% off above ₹999)
                </button>
              </div>
            </div>
          </div>

          {/* Summary Column */}
          <div className="cart-summary-col">
            <div className="cart-summary">
              <h3 className="summary-title">Order Summary</h3>

              {/* Promo code form */}
              <form onSubmit={handleApplyCoupon} className="coupon-form">
                <input
                  type="text"
                  placeholder="Enter Coupon (e.g. FESTIVE20)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="form-input coupon-input"
                  disabled={!!appliedCoupon}
                />
                {appliedCoupon ? (
                  <button type="button" className="btn btn-danger btn-sm" onClick={handleRemoveCoupon}>
                    ✕ Remove
                  </button>
                ) : (
                  <button type="submit" className="btn btn-primary btn-sm" disabled={validatingCoupon || !couponCode.trim()}>
                    {validatingCoupon ? '...' : 'Apply'}
                  </button>
                )}
              </form>

              {appliedCoupon && (
                <div className="applied-coupon-tag">
                  <span>🎉 <strong>{appliedCoupon.code}</strong> applied (-{formatPrice(appliedCoupon.discount_amount)})</span>
                </div>
              )}

              <div className="summary-rows">
                <div className="summary-row">
                  <span>Subtotal ({cart.total_items} items)</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                {appliedCoupon && (
                  <div className="summary-row" style={{ color: 'var(--success)' }}>
                    <span>Coupon Discount ({appliedCoupon.code})</span>
                    <span>-{formatPrice(appliedCoupon.discount_amount)}</span>
                  </div>
                )}
                <div className="summary-row">
                  <span>Express Shipping</span>
                  <span>
                    {shipping === 0
                      ? <span style={{ color: 'var(--success)', fontWeight: 700 }}>FREE</span>
                      : formatPrice(shipping)}
                  </span>
                </div>
                <div className="summary-row">
                  <span>GST (18% inclusive)</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="summary-divider" />
                <div className="summary-row summary-total">
                  <span>Total Amount</span>
                  <span>{formatPrice(finalTotal)}</span>
                </div>
              </div>

              <button
                className="btn btn-primary btn-full btn-lg"
                onClick={() => navigate('/checkout', { state: { coupon: appliedCoupon } })}
                style={{ marginTop: '20px' }}
              >
                Proceed to Checkout ({formatPrice(finalTotal)}) →
              </button>

              <Link to="/products" className="btn btn-ghost btn-full" style={{ marginTop: '8px' }}>
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .cart-page { padding-bottom: 40px; }
        .cart-layout { display: grid; grid-template-columns: 1fr 380px; gap: 28px; align-items: start; }
        
        .free-shipping-meter {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 16px 20px;
          margin-bottom: 20px;
        }
        .meter-header { font-size: 0.85rem; margin-bottom: 8px; }
        .meter-bar-track { height: 6px; background: var(--bg-secondary); border-radius: var(--radius-full); overflow: hidden; }
        .meter-bar-fill { height: 100%; background: linear-gradient(90deg, #6366f1, #10b981); border-radius: var(--radius-full); transition: width 0.4s ease; }
        
        .cart-items-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; margin-bottom: 20px; }
        .cart-items-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--text-primary);
        }
        .cart-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          border-bottom: 1px solid var(--border);
          transition: var(--transition);
        }
        .cart-item:hover { background: var(--bg-card-hover); }
        .cart-item:last-child { border-bottom: none; }
        .cart-item-image {
          width: 80px; height: 80px;
          border-radius: var(--radius-md);
          background: var(--bg-secondary);
          overflow: hidden;
          flex-shrink: 0;
        }
        .cart-item-image img { width: 100%; height: 100%; object-fit: cover; }
        .cart-item-details { flex: 1; min-width: 0; }
        .cart-item-name {
          font-weight: 600;
          font-size: 0.95rem;
          color: var(--text-primary);
          text-decoration: none;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .cart-item-name:hover { color: var(--primary-light); }
        .cart-item-brand { font-size: 0.8rem; color: var(--text-muted); margin-top: 2px; }
        .cart-item-price { display: flex; align-items: center; gap: 8px; margin-top: 6px; font-weight: 600; }
        .cart-item-original { font-size: 0.8rem; color: var(--text-muted); text-decoration: line-through; }
        .cart-item-controls { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; flex-shrink: 0; }
        .cart-item-total { font-size: 1.1rem; font-weight: 800; }
        
        .popular-coupons-box {
          background: var(--bg-card);
          border: 1px dashed var(--border-hover);
          border-radius: var(--radius-lg);
          padding: 16px 20px;
        }
        .popular-coupons-title { font-size: 0.85rem; font-weight: 600; margin-bottom: 10px; color: var(--text-secondary); }
        .coupon-pills { display: flex; flex-wrap: wrap; gap: 8px; }
        .coupon-pill {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          color: var(--text-primary);
          padding: 6px 12px;
          border-radius: var(--radius-md);
          font-size: 0.75rem;
          cursor: pointer;
          transition: var(--transition);
        }
        .coupon-pill:hover { border-color: var(--primary); background: var(--primary-glow); }
        
        /* Summary */
        .cart-summary {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 24px;
          position: sticky;
          top: calc(var(--navbar-height) + 20px);
        }
        .summary-title { font-size: 1.15rem; font-weight: 800; margin-bottom: 20px; }
        .coupon-form { display: flex; gap: 8px; margin-bottom: 12px; }
        .coupon-input { text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em; font-size: 0.85rem; padding: 8px 12px; }
        .applied-coupon-tag {
          background: var(--success-light);
          color: var(--success);
          padding: 8px 12px;
          border-radius: var(--radius-md);
          font-size: 0.8rem;
          margin-bottom: 16px;
        }
        .summary-rows { display: flex; flex-direction: column; gap: 12px; }
        .summary-row { display: flex; justify-content: space-between; font-size: 0.9rem; color: var(--text-secondary); }
        .summary-divider { height: 1px; background: var(--border); margin: 4px 0; }
        .summary-total { font-weight: 800; font-size: 1.25rem; color: #fff; }
        
        @media (max-width: 1024px) {
          .cart-layout { grid-template-columns: 1fr; }
          .cart-summary { position: static; }
        }
      `}</style>
    </div>
  );
}
