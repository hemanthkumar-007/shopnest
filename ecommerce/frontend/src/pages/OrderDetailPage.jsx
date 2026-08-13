import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService } from '../services';
import { formatPrice, formatDate, getStatusClass } from '../utils/helpers';
import { PageLoader } from '../components/LoadingStates';

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.getOrderById(id)
      .then(res => setOrder(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handlePrintInvoice = () => {
    window.print();
  };

  if (loading) return <PageLoader />;
  if (!order) return <div className="empty-state"><h3>Order not found</h3><Link to="/orders" className="btn btn-primary">My Orders</Link></div>;

  const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
  const currentStep = STATUS_STEPS.indexOf(order.order_status);

  return (
    <div className="order-detail-page">
      <div className="breadcrumb no-print">
        <Link to="/orders">My Orders</Link>
        <span className="sep">›</span>
        <span className="current">#{order.order_number}</span>
      </div>

      <div className="order-detail-header">
        <div>
          <h1 className="page-title">Order #{order.order_number}</h1>
          <p className="text-muted">Placed on {formatDate(order.created_at)}</p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-outline btn-sm no-print" onClick={handlePrintInvoice}>
            🖨️ Print Invoice
          </button>
          <span className={`status-pill ${getStatusClass(order.order_status)}`} style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
            ● {order.order_status}
          </span>
          <span className={`status-pill ${getStatusClass(order.payment_status)}`} style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
            💳 {order.payment_status}
          </span>
        </div>
      </div>

      {/* Live Carrier Tracking Box */}
      <div className="tracking-summary-card">
        <div className="tracking-header">
          <div>
            <div className="tracking-carrier-name">🚚 Courier: <strong>{order.carrier || 'BlueDart Express'}</strong></div>
            <div className="tracking-awb">Waybill / Tracking No: <code>{order.tracking_number || `BD-${order.order_number.replace('ORD-', '')}`}</code></div>
          </div>
          <div className="tracking-delivery-date">
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ESTIMATED DELIVERY</span>
            <strong>{order.estimated_delivery ? formatDate(order.estimated_delivery) : 'In 3-4 Business Days'}</strong>
          </div>
        </div>

        {/* Progress Tracker */}
        {!['cancelled'].includes(order.order_status) && (
          <div className="order-tracker">
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className={`tracker-step ${i <= currentStep ? 'tracker-step-done' : ''} ${i === currentStep ? 'tracker-step-current' : ''}`}>
                <div className="tracker-dot">{i < currentStep ? '✓' : i + 1}</div>
                <div className="tracker-label">{step.charAt(0).toUpperCase() + step.slice(1)}</div>
                {i < STATUS_STEPS.length - 1 && <div className="tracker-line" />}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="order-detail-grid">
        {/* Items Column */}
        <div>
          <div className="detail-section">
            <h3 className="detail-section-title">Purchased Items ({order.items.length})</h3>
            {order.items.map(item => (
              <div key={item.id} className="order-detail-item">
                <div className="order-item-image-lg">
                  {item.product_image ? (
                    <img src={item.product_image} alt={item.product_name} />
                  ) : (
                    <span style={{ fontSize: '2rem' }}>🛍️</span>
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.product_name}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
                    Qty: {item.quantity} × {formatPrice(item.price)}
                  </div>
                  {item.product && (
                    <Link to={`/products/${item.product}`} className="review-link no-print">
                      ⭐ Write a Review
                    </Link>
                  )}
                </div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{formatPrice(item.total_price)}</div>
              </div>
            ))}
          </div>

          <div className="detail-section">
            <h3 className="detail-section-title">Shipping & Contact Information</h3>
            <div className="address-block">
              <div><strong>{order.first_name} {order.last_name}</strong></div>
              <div>{order.address}</div>
              <div>{order.city}, {order.state} - {order.postal_code}</div>
              <div>{order.country}</div>
              <div style={{ marginTop: '10px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                <span>📧 {order.email}</span>
                <span>📞 {order.phone}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Summary Column */}
        <div className="detail-section">
          <h3 className="detail-section-title">Payment & Tax Invoice</h3>
          <div className="payment-info-row">
            <span>Payment Method</span>
            <span style={{ textTransform: 'uppercase', fontWeight: 700 }}>{order.payment_method}</span>
          </div>

          <div className="summary-rows" style={{ marginTop: '16px' }}>
            <div className="summary-row">
              <span>Items Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount > 0 && (
              <div className="summary-row" style={{ color: 'var(--success)' }}>
                <span>Coupon Discount {order.coupon_code && `(${order.coupon_code})`}</span>
                <span>-{formatPrice(order.discount)}</span>
              </div>
            )}
            <div className="summary-row">
              <span>Express Courier</span>
              <span>{order.shipping_cost == 0 ? <span style={{ color: 'var(--success)' }}>FREE</span> : formatPrice(order.shipping_cost)}</span>
            </div>
            <div className="summary-row">
              <span>GST (18% inclusive)</span>
              <span>{formatPrice(order.tax)}</span>
            </div>
            <div className="summary-divider" />
            <div className="summary-row summary-total">
              <span>Total Paid</span>
              <span>{formatPrice(order.total_amount)}</span>
            </div>
          </div>

          <div className="invoice-meta-box">
            <div>Seller: <strong>ShopNest Retail Private Limited</strong></div>
            <div>GSTIN: <strong>27AABCS1429B1Z8</strong></div>
            <div>CIN: <strong>U51909MH2026PTC192831</strong></div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }} className="no-print">
        <Link to="/orders" className="btn btn-outline">← Back to All Orders</Link>
        <Link to="/products" className="btn btn-primary">Continue Shopping</Link>
      </div>

      <style>{`
        .order-detail-page { padding-bottom: 40px; }
        .order-detail-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 24px; flex-wrap: wrap; gap: 16px;
        }
        
        .tracking-summary-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 24px;
          margin-bottom: 24px;
        }
        .tracking-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 20px;
          margin-bottom: 20px;
          border-bottom: 1px solid var(--border);
          flex-wrap: wrap;
          gap: 16px;
        }
        .tracking-carrier-name { font-size: 1rem; color: var(--text-primary); }
        .tracking-awb { font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px; }
        .tracking-awb code { background: var(--bg-secondary); padding: 2px 6px; border-radius: 4px; color: var(--primary-light); }
        .tracking-delivery-date { text-align: right; }
        .tracking-delivery-date strong { display: block; font-size: 1.05rem; color: var(--success); }
        
        .order-tracker {
          display: flex;
          align-items: center;
          overflow-x: auto;
          padding: 10px 0;
        }
        .tracker-step { display: flex; flex-direction: column; align-items: center; position: relative; flex: 1; min-width: 80px; }
        .tracker-dot {
          width: 36px; height: 36px;
          border-radius: 50%;
          background: var(--bg-secondary);
          border: 2px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          font-size: 0.85rem; font-weight: 800;
          transition: var(--transition);
          z-index: 1;
          margin-bottom: 8px;
        }
        .tracker-step-done .tracker-dot { background: var(--primary); border-color: var(--primary); color: white; }
        .tracker-step-current .tracker-dot { background: var(--success); border-color: var(--success); color: white; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.2); }
        .tracker-label { font-size: 0.75rem; font-weight: 600; color: var(--text-muted); text-align: center; }
        .tracker-step-done .tracker-label, .tracker-step-current .tracker-label { color: var(--text-primary); }
        .tracker-line {
          position: absolute;
          top: 17px;
          left: 50%;
          width: 100%;
          height: 2px;
          background: var(--border);
          z-index: 0;
        }
        .tracker-step-done .tracker-line { background: var(--primary); }
        
        .order-detail-grid { display: grid; grid-template-columns: 1fr 380px; gap: 24px; align-items: start; }
        .detail-section {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 24px;
          margin-bottom: 20px;
        }
        .detail-section:last-child { margin-bottom: 0; }
        .detail-section-title { font-size: 1.05rem; font-weight: 700; margin-bottom: 16px; }
        .order-detail-item { display: flex; align-items: center; gap: 16px; padding: 14px 0; border-bottom: 1px solid var(--border); }
        .order-detail-item:last-child { border-bottom: none; }
        .order-item-image-lg {
          width: 68px; height: 68px;
          border-radius: var(--radius-md);
          background: var(--bg-secondary);
          overflow: hidden; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .order-item-image-lg img { width: 100%; height: 100%; object-fit: cover; }
        .review-link { font-size: 0.75rem; color: var(--primary-light); display: inline-block; margin-top: 4px; }
        .address-block { color: var(--text-secondary); font-size: 0.9rem; line-height: 1.8; }
        .payment-info-row { display: flex; justify-content: space-between; font-size: 0.85rem; padding: 10px 14px; background: var(--bg-secondary); border-radius: var(--radius-md); }
        .summary-rows { display: flex; flex-direction: column; gap: 10px; }
        .summary-row { display: flex; justify-content: space-between; font-size: 0.9rem; color: var(--text-secondary); }
        .summary-divider { height: 1px; background: var(--border); margin: 4px 0; }
        .summary-total { font-weight: 800; font-size: 1.2rem; color: #fff; }
        
        .invoice-meta-box {
          margin-top: 20px;
          padding-top: 14px;
          border-top: 1px solid var(--border);
          font-size: 0.75rem;
          color: var(--text-muted);
          line-height: 1.6;
        }
        
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; }
          .order-detail-page { padding: 0 !important; }
          .detail-section, .tracking-summary-card { border: 1px solid #ccc !important; background: white !important; color: black !important; }
        }
        
        @media (max-width: 1024px) {
          .order-detail-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
