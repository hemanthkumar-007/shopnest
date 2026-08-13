import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { orderService } from '../services';
import { formatPrice } from '../utils/helpers';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const { user } = useAuth();
  const { cart, clearCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const initialCoupon = location.state?.coupon || null;

  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    postal_code: user?.postal_code || '',
    country: user?.country || 'India',
    payment_method: 'card',
    coupon_code: initialCoupon?.code || '',
    notes: '',
  });

  // Card Simulator State
  const [cardData, setCardData] = useState({
    number: '4532 •••• •••• 8892',
    name: user ? `${user.first_name} ${user.last_name}` : 'Cardholder Name',
    expiry: '12/28',
    cvv: '•••',
  });

  // UPI Simulator State
  const [upiId, setUpiId] = useState('');

  // Netbanking State
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  const [coupon, setCoupon] = useState(initialCoupon);
  const [processingModal, setProcessingModal] = useState(false);
  const [processStep, setProcessStep] = useState(1);
  const [errors, setErrors] = useState({});

  if (!cart || !cart.items?.length) {
    navigate('/cart');
    return null;
  }

  const subtotal = Number(cart.subtotal);
  const discount = coupon ? Number(coupon.discount_amount) : 0;
  const taxableSubtotal = Math.max(0, subtotal - discount);
  const shipping = taxableSubtotal >= 500 ? 0 : 49;
  const tax = Number((taxableSubtotal * 0.18).toFixed(2));
  const finalTotal = taxableSubtotal + shipping + tax;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    const required = ['first_name', 'last_name', 'email', 'phone', 'address', 'city', 'state', 'postal_code'];
    required.forEach(field => {
      if (!form[field]?.trim()) errs[field] = 'Required';
    });
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      toast.error('Please complete all shipping address fields');
      return;
    }

    // Trigger simulated realistic payment gateway
    setProcessingModal(true);
    setProcessStep(1);

    setTimeout(() => {
      setProcessStep(2); // "Verifying 3D Secure / Bank Authorization"
    }, 1200);

    setTimeout(async () => {
      setProcessStep(3); // "Payment Approved"
      try {
        const payload = {
          ...form,
          coupon_code: coupon ? coupon.code : '',
        };
        const res = await orderService.createOrder(payload);
        const order = res.data.data;
        clearCart();
        toast.success('🎉 Order Placed Successfully!');
        setTimeout(() => {
          setProcessingModal(false);
          navigate(`/orders/${order.id}`);
        }, 1000);
      } catch (err) {
        setProcessingModal(false);
        toast.error(err.response?.data?.message || 'Failed to place order');
      }
    }, 2400);
  };

  return (
    <div className="checkout-page">
      <h1 className="page-title" style={{ marginBottom: '24px' }}>🔒 Secure Checkout</h1>

      <div className="checkout-layout">
        {/* Main Checkout Form */}
        <form onSubmit={handleSubmit} className="checkout-main">
          {/* Step 1: Shipping Address */}
          <div className="checkout-card">
            <div className="checkout-card-header">
              <span className="step-num">1</span>
              <h3>Delivery Address</h3>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input
                  name="first_name"
                  value={form.first_name}
                  onChange={handleChange}
                  placeholder="John"
                  className={`form-input ${errors.first_name ? 'input-error' : ''}`}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input
                  name="last_name"
                  value={form.last_name}
                  onChange={handleChange}
                  placeholder="Doe"
                  className={`form-input ${errors.last_name ? 'input-error' : ''}`}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={`form-input ${errors.email ? 'input-error' : ''}`}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="+91 9876543210"
                  className={`form-input ${errors.phone ? 'input-error' : ''}`}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Street Address *</label>
              <input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="Apartment, Flat, Building, Street Area"
                className={`form-input ${errors.address ? 'input-error' : ''}`}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">City *</label>
                <input
                  name="city"
                  value={form.city}
                  onChange={handleChange}
                  placeholder="Mumbai"
                  className={`form-input ${errors.city ? 'input-error' : ''}`}
                />
              </div>
              <div className="form-group">
                <label className="form-label">State *</label>
                <input
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  placeholder="Maharashtra"
                  className={`form-input ${errors.state ? 'input-error' : ''}`}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">PIN Code *</label>
                <input
                  name="postal_code"
                  value={form.postal_code}
                  onChange={handleChange}
                  placeholder="400001"
                  className={`form-input ${errors.postal_code ? 'input-error' : ''}`}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Country</label>
                <input name="country" value={form.country} readOnly className="form-input" style={{ opacity: 0.7 }} />
              </div>
            </div>
          </div>

          {/* Step 2: Payment Method */}
          <div className="checkout-card">
            <div className="checkout-card-header">
              <span className="step-num">2</span>
              <h3>Payment Method</h3>
            </div>

            <div className="payment-method-tabs">
              {[
                { id: 'card', label: '💳 Credit / Debit Card', desc: 'Visa, Mastercard, RuPay' },
                { id: 'upi', label: '📱 Instant UPI', desc: 'Google Pay, PhonePe, Paytm' },
                { id: 'netbanking', label: '🏦 Net Banking', desc: 'All Major Indian Banks' },
                { id: 'cod', label: '💵 Cash on Delivery', desc: 'Pay with cash or UPI on delivery' },
              ].map(opt => (
                <div
                  key={opt.id}
                  className={`payment-tab-item ${form.payment_method === opt.id ? 'active' : ''}`}
                  onClick={() => setForm(p => ({ ...p, payment_method: opt.id }))}
                >
                  <div className="payment-tab-title">{opt.label}</div>
                  <div className="payment-tab-desc">{opt.desc}</div>
                </div>
              ))}
            </div>

            {/* Credit Card Mock Form */}
            {form.payment_method === 'card' && (
              <div className="card-mock-form">
                <div className="virtual-card">
                  <div className="vcard-top">
                    <span>ShopNest Secured</span>
                    <span style={{ fontSize: '1.2rem' }}>💳</span>
                  </div>
                  <div className="vcard-number">{cardData.number}</div>
                  <div className="vcard-bottom">
                    <div>
                      <div className="vcard-label">CARDHOLDER</div>
                      <div className="vcard-name">{cardData.name}</div>
                    </div>
                    <div>
                      <div className="vcard-label">EXPIRES</div>
                      <div className="vcard-val">{cardData.expiry}</div>
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Card Number</label>
                    <input
                      className="form-input"
                      placeholder="4532 8920 1829 8892"
                      value={cardData.number}
                      onChange={e => setCardData(p => ({ ...p, number: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Name on Card</label>
                    <input
                      className="form-input"
                      placeholder="Full Name"
                      value={cardData.name}
                      onChange={e => setCardData(p => ({ ...p, name: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Valid Thru</label>
                    <input
                      className="form-input"
                      placeholder="MM/YY"
                      value={cardData.expiry}
                      onChange={e => setCardData(p => ({ ...p, expiry: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">CVV / CVC</label>
                    <input
                      className="form-input"
                      type="password"
                      placeholder="123"
                      maxLength={4}
                      value={cardData.cvv}
                      onChange={e => setCardData(p => ({ ...p, cvv: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* UPI Mock */}
            {form.payment_method === 'upi' && (
              <div className="upi-form">
                <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                  <div className="qr-placeholder">
                    <div style={{ fontSize: '3.5rem' }}>📱</div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Scan & Pay with Any UPI App</span>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Or enter UPI ID / VPA</label>
                  <input
                    className="form-input"
                    placeholder="yourname@oksbi / mobile@paytm"
                    value={upiId}
                    onChange={e => setUpiId(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* NetBanking Mock */}
            {form.payment_method === 'netbanking' && (
              <div className="netbanking-grid">
                {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra'].map(bank => (
                  <div
                    key={bank}
                    className={`bank-pill ${selectedBank === bank ? 'active' : ''}`}
                    onClick={() => setSelectedBank(bank)}
                  >
                    <span>🏦</span>
                    <span>{bank}</span>
                  </div>
                ))}
              </div>
            )}

            {/* COD */}
            {form.payment_method === 'cod' && (
              <div className="cod-notice">
                <span>💵 Pay in cash or via UPI QR code when our BlueDart courier executive arrives at your doorstep.</span>
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" style={{ fontSize: '1.05rem', padding: '16px' }}>
            🔒 Place Order & Pay {formatPrice(finalTotal)}
          </button>
        </form>

        {/* Order Summary Column */}
        <div className="checkout-summary-col">
          <div className="checkout-summary-card">
            <h3 className="summary-title">Order Items ({cart.total_items})</h3>
            <div className="checkout-items-list">
              {cart.items.map(item => (
                <div key={item.id} className="checkout-item-mini">
                  <img
                    src={item.product.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=100&q=80'}
                    alt={item.product.name}
                    className="checkout-item-thumb"
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="checkout-item-title">{item.product.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Qty: {item.quantity} × {formatPrice(item.price)}</div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{formatPrice(item.total_price)}</div>
                </div>
              ))}
            </div>

            <div className="summary-rows" style={{ marginTop: '20px' }}>
              <div className="summary-row">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              {coupon && (
                <div className="summary-row" style={{ color: 'var(--success)' }}>
                  <span>Coupon ({coupon.code})</span>
                  <span>-{formatPrice(coupon.discount_amount)}</span>
                </div>
              )}
              <div className="summary-row">
                <span>Express Courier</span>
                <span>{shipping === 0 ? <span style={{ color: 'var(--success)', fontWeight: 700 }}>FREE</span> : formatPrice(shipping)}</span>
              </div>
              <div className="summary-row">
                <span>GST (18% inclusive)</span>
                <span>{formatPrice(tax)}</span>
              </div>
              <div className="summary-divider" />
              <div className="summary-row summary-total">
                <span>Total Payable</span>
                <span>{formatPrice(finalTotal)}</span>
              </div>
            </div>

            <div className="security-badges">
              <span>🔒 256-Bit SSL Encryption</span>
              <span>🛡️ Fraud Prevention</span>
            </div>
          </div>
        </div>
      </div>

      {/* Simulated Payment Processing Modal */}
      {processingModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ textAlign: 'center' }}>
            {processStep === 1 && (
              <>
                <div className="spinner" style={{ marginBottom: '20px' }} />
                <h3>Connecting to Bank Gateway...</h3>
                <p className="text-muted" style={{ marginTop: '8px' }}>Encrypting credentials with 256-bit TLS</p>
              </>
            )}
            {processStep === 2 && (
              <>
                <div className="spinner" style={{ marginBottom: '20px', borderTopColor: '#f59e0b' }} />
                <h3>Verifying 3D Secure OTP...</h3>
                <p className="text-muted" style={{ marginTop: '8px' }}>Authorizing payment of {formatPrice(finalTotal)}</p>
              </>
            )}
            {processStep === 3 && (
              <>
                <div style={{ fontSize: '3.5rem', marginBottom: '16px', color: 'var(--success)' }}>✅</div>
                <h3>Payment Approved!</h3>
                <p className="text-muted" style={{ marginTop: '8px' }}>Generating your tax invoice and order receipt...</p>
              </>
            )}
          </div>
        </div>
      )}

      <style>{`
        .checkout-page { padding-bottom: 40px; }
        .checkout-layout { display: grid; grid-template-columns: 1fr 380px; gap: 28px; align-items: start; }
        
        .checkout-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 24px;
          margin-bottom: 24px;
        }
        .checkout-card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--border);
        }
        .step-num {
          width: 28px; height: 28px;
          border-radius: 50%;
          background: var(--primary);
          color: white;
          display: flex; align-items: center; justify-content: center;
          font-weight: 800; font-size: 0.85rem;
        }
        .checkout-card-header h3 { font-size: 1.1rem; font-weight: 700; margin: 0; }
        
        .payment-method-tabs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 20px;
        }
        .payment-tab-item {
          background: var(--bg-secondary);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-md);
          padding: 14px;
          cursor: pointer;
          transition: var(--transition);
        }
        .payment-tab-item.active {
          border-color: var(--primary);
          background: var(--primary-glow);
        }
        .payment-tab-title { font-weight: 700; font-size: 0.9rem; margin-bottom: 2px; }
        .payment-tab-desc { font-size: 0.75rem; color: var(--text-muted); }
        
        .card-mock-form {
          background: var(--bg-secondary);
          border-radius: var(--radius-md);
          padding: 20px;
        }
        .virtual-card {
          background: linear-gradient(135deg, #3730a3, #1e1b4b);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: var(--radius-lg);
          padding: 20px 24px;
          color: white;
          margin-bottom: 20px;
          box-shadow: var(--shadow-md);
        }
        .vcard-top { display: flex; justify-content: space-between; font-size: 0.8rem; letter-spacing: 0.05em; color: #c7d2fe; }
        .vcard-number { font-size: 1.3rem; font-family: monospace; letter-spacing: 0.15em; margin: 18px 0; font-weight: 700; }
        .vcard-bottom { display: flex; justify-content: space-between; font-size: 0.8rem; }
        .vcard-label { font-size: 0.65rem; color: #a5b4fc; }
        .vcard-name { font-weight: 700; text-transform: uppercase; }
        
        .qr-placeholder {
          background: var(--bg-secondary);
          border: 2px dashed var(--border);
          border-radius: var(--radius-lg);
          padding: 24px;
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
        }
        
        .netbanking-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }
        .bank-pill {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 12px 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
        }
        .bank-pill.active { border-color: var(--primary); background: var(--primary-glow); }
        
        .cod-notice {
          background: var(--bg-secondary);
          border-left: 4px solid var(--primary);
          padding: 16px;
          border-radius: var(--radius-md);
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        .checkout-summary-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 24px;
          position: sticky;
          top: calc(var(--navbar-height) + 20px);
        }
        .checkout-items-list { display: flex; flex-direction: column; gap: 12px; max-height: 280px; overflow-y: auto; }
        .checkout-item-mini { display: flex; align-items: center; gap: 12px; padding-bottom: 8px; border-bottom: 1px solid var(--border); }
        .checkout-item-thumb { width: 44px; height: 44px; border-radius: var(--radius-sm); object-fit: cover; background: var(--bg-secondary); }
        .checkout-item-title { font-size: 0.85rem; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        
        .security-badges {
          display: flex;
          justify-content: space-around;
          margin-top: 20px;
          padding-top: 16px;
          border-top: 1px solid var(--border);
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        
        .input-error { border-color: var(--error) !important; }

        @media (max-width: 1024px) {
          .checkout-layout { grid-template-columns: 1fr; }
          .checkout-summary-card { position: static; }
        }
      `}</style>
    </div>
  );
}
