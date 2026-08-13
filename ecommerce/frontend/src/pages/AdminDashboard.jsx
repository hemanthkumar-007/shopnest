import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService, orderService } from '../services';
import { formatPrice, formatDate, getStatusClass } from '../utils/helpers';
import { LoadingSpinner } from '../components/LoadingStates';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    Promise.all([
      authService.getAdminStats(),
      orderService.getAdminOrders(),
    ]).then(([statsRes, ordersRes]) => {
      setStats(statsRes.data.data);
      setOrders(ordersRes.data.data?.orders || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, { order_status: newStatus });
      setOrders(prev => prev.map(o =>
        o.id === orderId ? { ...o, order_status: newStatus } : o
      ));
      toast.success('Order status updated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  if (loading) return <LoadingSpinner message="Loading admin dashboard..." />;

  const STAT_CARDS = [
    { label: 'Total Users', value: stats?.total_users || 0, icon: '👤', color: '#6366f1' },
    { label: 'Total Products', value: stats?.total_products || 0, icon: '📦', color: '#10b981' },
    { label: 'Total Orders', value: stats?.total_orders || 0, icon: '🛒', color: '#f59e0b' },
    { label: 'Total Revenue', value: formatPrice(stats?.total_revenue || 0), icon: '💰', color: '#ec4899', isPrice: true },
    { label: 'Pending Orders', value: stats?.pending_orders || 0, icon: '⏳', color: '#f59e0b' },
    { label: 'Delivered', value: stats?.delivered_orders || 0, icon: '✅', color: '#10b981' },
  ];

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-header">
        <div>
          <h1 className="page-title">⚡ Admin Dashboard</h1>
          <p className="text-muted">Signed in as <strong>{user?.email}</strong></p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <Link to="/" className="btn btn-ghost btn-sm">
            🛍️ View Store
          </Link>
          <a href="http://127.0.0.1:8000/admin/" target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
            🔧 Django Admin →
          </a>
          <button onClick={handleLogout} className="btn btn-danger btn-sm">
            🚪 Logout Admin
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="admin-stats-grid">
        {STAT_CARDS.map(card => (
          <div key={card.label} className="admin-stat-card" style={{ '--accent-color': card.color }}>
            <div className="admin-stat-icon">{card.icon}</div>
            <div className="admin-stat-value">{card.value}</div>
            <div className="admin-stat-label">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="tabs" style={{ marginBottom: '0' }}>
        <button className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Recent Orders</button>
        <button className={`tab ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>All Orders</button>
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderTop: 'none', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)', overflow: 'hidden' }}>
        <div className="orders-table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(activeTab === 'overview' ? orders.slice(0, 10) : orders).map(order => (
                <tr key={order.id}>
                  <td>
                    <Link to={`/orders/${order.id}`} className="order-link">
                      #{order.order_number}
                    </Link>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>{order.first_name} {order.last_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{order.email}</div>
                  </td>
                  <td>{order.items?.length || 0}</td>
                  <td style={{ fontWeight: 600 }}>{formatPrice(order.total_amount)}</td>
                  <td>
                    <span className={`status-pill ${getStatusClass(order.payment_status)}`}>
                      {order.payment_status}
                    </span>
                  </td>
                  <td>
                    <select
                      className="status-select"
                      value={order.order_status}
                      onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                    >
                      {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{formatDate(order.created_at)}</td>
                  <td>
                    <Link to={`/orders/${order.id}`} className="btn btn-ghost btn-sm">View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && (
            <div className="empty-state" style={{ padding: '40px' }}>
              <div className="empty-state-icon">📦</div>
              <h3>No orders yet</h3>
            </div>
          )}
        </div>
      </div>

      <div className="admin-quick-links">
        <h3 style={{ marginBottom: '16px', fontWeight: 700 }}>Quick Links</h3>
        <div className="quick-links-grid">
          <a href="http://127.0.0.1:8000/admin/products/product/" target="_blank" rel="noopener" className="quick-link-card">
            <span>📦</span>
            <span>Manage Products</span>
          </a>
          <a href="http://127.0.0.1:8000/admin/categories/category/" target="_blank" rel="noopener" className="quick-link-card">
            <span>🏷️</span>
            <span>Manage Categories</span>
          </a>
          <a href="http://127.0.0.1:8000/admin/users/user/" target="_blank" rel="noopener" className="quick-link-card">
            <span>👤</span>
            <span>Manage Users</span>
          </a>
          <a href="http://127.0.0.1:8000/admin/reviews/review/" target="_blank" rel="noopener" className="quick-link-card">
            <span>⭐</span>
            <span>Manage Reviews</span>
          </a>
          <a href="http://127.0.0.1:8000/api/docs/" target="_blank" rel="noopener" className="quick-link-card">
            <span>📄</span>
            <span>API Documentation</span>
          </a>
        </div>
      </div>

      <style>{`
        .admin-page { padding-bottom: 40px; }
        .admin-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; flex-wrap: wrap; gap: 16px; }
        .admin-stats-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 16px;
          margin-bottom: 28px;
        }
        .admin-stat-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 20px;
          text-align: center;
          transition: var(--transition);
          position: relative;
          overflow: hidden;
        }
        .admin-stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--accent-color);
        }
        .admin-stat-card:hover {
          border-color: var(--accent-color);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          transform: translateY(-2px);
        }
        .admin-stat-icon { font-size: 1.5rem; margin-bottom: 8px; }
        .admin-stat-value { font-size: 1.4rem; font-weight: 800; margin-bottom: 4px; }
        .admin-stat-label { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
        .orders-table-wrapper { overflow-x: auto; }
        .orders-table { width: 100%; border-collapse: collapse; }
        .orders-table th {
          padding: 12px 16px;
          text-align: left;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          border-bottom: 1px solid var(--border);
          background: var(--bg-secondary);
        }
        .orders-table td {
          padding: 12px 16px;
          font-size: 0.875rem;
          border-bottom: 1px solid var(--border);
          vertical-align: middle;
        }
        .orders-table tr:last-child td { border-bottom: none; }
        .orders-table tr:hover td { background: var(--bg-secondary); }
        .order-link { color: var(--primary-light); font-weight: 600; text-decoration: none; }
        .order-link:hover { color: var(--primary); }
        .status-select {
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          color: var(--text-primary);
          padding: 4px 8px;
          font-size: 0.8rem;
          cursor: pointer;
        }
        .admin-quick-links { margin-top: 28px; }
        .quick-links-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
        .quick-link-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-secondary);
          transition: var(--transition);
        }
        .quick-link-card span:first-child { font-size: 1.8rem; }
        .quick-link-card:hover { border-color: var(--primary); color: var(--primary-light); background: var(--primary-glow); transform: translateY(-2px); }
        @media (max-width: 1200px) { .admin-stats-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 768px) { 
          .admin-stats-grid { grid-template-columns: repeat(2, 1fr); }
          .quick-links-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </div>
  );
}
