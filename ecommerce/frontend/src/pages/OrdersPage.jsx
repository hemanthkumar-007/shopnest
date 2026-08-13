import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../services';
import { formatPrice, formatDate, getStatusClass } from '../utils/helpers';
import { LoadingSpinner } from '../components/LoadingStates';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderService.getOrders()
      .then(res => setOrders(res.data.data?.orders || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner message="Loading orders..." />;

  return (
    <div>
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <h1 className="section-title">📦 My Orders</h1>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <h3>No orders yet</h3>
          <p>Your order history will appear here</p>
          <Link to="/products" className="btn btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-card-header">
                <div>
                  <div className="order-number">#{order.order_number}</div>
                  <div className="order-date">{formatDate(order.created_at)}</div>
                </div>
                <div className="order-card-status">
                  <span className={`status-pill ${getStatusClass(order.order_status)}`}>
                    {order.order_status}
                  </span>
                  <span className={`status-pill ${getStatusClass(order.payment_status)}`}>
                    {order.payment_status}
                  </span>
                </div>
              </div>

              <div className="order-items-preview">
                {order.items.slice(0, 3).map(item => (
                  <div key={item.id} className="order-item-preview">
                    <div className="order-item-image">
                      {item.product_image
                        ? <img src={`http://127.0.0.1:8000/media/${item.product_image}`} alt={item.product_name} onError={e => e.target.style.display='none'} />
                        : <span style={{ fontSize: '1.2rem' }}>🛍️</span>}
                    </div>
                    <div>
                      <div className="order-item-name">{item.product_name}</div>
                      <div className="order-item-qty">Qty: {item.quantity} × {formatPrice(item.price)}</div>
                    </div>
                  </div>
                ))}
                {order.items.length > 3 && (
                  <div className="order-more-items">+{order.items.length - 3} more items</div>
                )}
              </div>

              <div className="order-card-footer">
                <div className="order-total">
                  Total: <strong>{formatPrice(order.total_amount)}</strong>
                </div>
                <div className="order-actions">
                  <Link to={`/orders/${order.id}`} className="btn btn-outline btn-sm">View Details</Link>
                  {['pending', 'confirmed', 'processing'].includes(order.order_status) && (
                    <CancelButton orderId={order.id} onCancel={() => {
                      setOrders(prev => prev.map(o =>
                        o.id === order.id ? { ...o, order_status: 'cancelled' } : o
                      ));
                    }} />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .orders-list { display: flex; flex-direction: column; gap: 16px; }
        .order-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          transition: var(--transition);
        }
        .order-card:hover { border-color: var(--border-hover); }
        .order-card-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
        }
        .order-number { font-weight: 700; font-size: 1rem; }
        .order-date { font-size: 0.8rem; color: var(--text-muted); margin-top: 2px; }
        .order-card-status { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
        .order-items-preview {
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .order-item-preview { display: flex; align-items: center; gap: 12px; }
        .order-item-image {
          width: 44px; height: 44px;
          border-radius: var(--radius-sm);
          background: var(--bg-secondary);
          overflow: hidden;
          flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
        }
        .order-item-image img { width: 100%; height: 100%; object-fit: cover; }
        .order-item-name { font-size: 0.875rem; font-weight: 500; }
        .order-item-qty { font-size: 0.8rem; color: var(--text-muted); }
        .order-more-items { font-size: 0.8rem; color: var(--text-muted); padding: 4px 0; }
        .order-card-footer {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px 20px;
          border-top: 1px solid var(--border);
          background: var(--bg-secondary);
        }
        .order-total { font-size: 0.9rem; color: var(--text-secondary); }
        .order-actions { display: flex; gap: 8px; }
      `}</style>
    </div>
  );
}

function CancelButton({ orderId, onCancel }) {
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    setLoading(true);
    try {
      await orderService.cancelOrder(orderId);
      onCancel();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button className="btn btn-danger btn-sm" onClick={handleCancel} disabled={loading}>
      {loading ? '...' : 'Cancel'}
    </button>
  );
}
