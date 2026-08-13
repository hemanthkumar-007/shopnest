import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [form, setForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    postal_code: user?.postal_code || '',
    country: user?.country || 'India',
  });
  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '', new_password2: '' });
  const [saving, setSaving] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authService.updateProfile(form);
      updateUser(res.data.data);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.new_password !== pwForm.new_password2) {
      toast.error('New passwords do not match');
      return;
    }
    setSavingPw(true);
    try {
      await authService.changePassword(pwForm);
      toast.success('Password changed!');
      setPwForm({ old_password: '', new_password: '', new_password2: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPw(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const TABS = [
    { id: 'profile', label: '👤 Profile', icon: '👤' },
    { id: 'orders', label: '📦 Orders', icon: '📦' },
    { id: 'security', label: '🔒 Security', icon: '🔒' },
  ];

  return (
    <div className="profile-page">
      {/* Sidebar */}
      <div className="profile-sidebar">
        <div className="profile-user-info">
          <div className="profile-big-avatar">
            {user?.first_name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="profile-user-name">{user?.first_name} {user?.last_name}</div>
          <div className="profile-user-email">{user?.email}</div>
          {user?.is_staff && <span className="badge badge-warning" style={{ marginTop: '8px' }}>Admin</span>}
        </div>

        <div className="divider" />

        <nav className="profile-nav">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`sidebar-nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon} {tab.label.split(' ').slice(1).join(' ')}
            </button>
          ))}
          <Link to="/orders" className="sidebar-nav-item">📦 My Orders</Link>
          <Link to="/wishlist" className="sidebar-nav-item">♡ Wishlist</Link>
          <Link to="/cart" className="sidebar-nav-item">🛒 Cart</Link>
          {user?.is_staff && <Link to="/admin" className="sidebar-nav-item" style={{ color: 'var(--accent)' }}>⚡ Admin Dashboard</Link>}
          <div className="divider" />
          <button onClick={handleLogout} className="sidebar-nav-item" style={{ color: 'var(--error)' }}>
            🚪 Logout
          </button>
        </nav>
      </div>

      {/* Content */}
      <div className="profile-content">
        {activeTab === 'profile' && (
          <div className="card">
            <h2 style={{ marginBottom: '24px' }}>Profile Information</h2>
            <form onSubmit={handleUpdate}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input className="form-input" value={form.first_name} onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input className="form-input" value={form.last_name} onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Email (Read-only)</label>
                <input className="form-input" value={user?.email} readOnly style={{ opacity: 0.6 }} />
              </div>
              <div className="form-group">
                <label className="form-label">Phone</label>
                <input className="form-input" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} placeholder="+91 9876543210" />
              </div>
              <div className="form-group">
                <label className="form-label">Address</label>
                <input className="form-input" value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} placeholder="Your street address" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input className="form-input" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input className="form-input" value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Postal Code</label>
                  <input className="form-input" value={form.postal_code} onChange={e => setForm(p => ({ ...p, postal_code: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Country</label>
                  <input className="form-input" value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value }))} />
                </div>
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving...' : '💾 Save Changes'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="card">
            <h2 style={{ marginBottom: '24px' }}>My Orders</h2>
            <Link to="/orders" className="btn btn-primary">View All Orders →</Link>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="card">
            <h2 style={{ marginBottom: '24px' }}>Change Password</h2>
            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input type="password" className="form-input" value={pwForm.old_password} onChange={e => setPwForm(p => ({ ...p, old_password: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <input type="password" className="form-input" value={pwForm.new_password} onChange={e => setPwForm(p => ({ ...p, new_password: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input type="password" className="form-input" value={pwForm.new_password2} onChange={e => setPwForm(p => ({ ...p, new_password2: e.target.value }))} required />
              </div>
              <button type="submit" className="btn btn-primary" disabled={savingPw}>
                {savingPw ? 'Changing...' : '🔒 Change Password'}
              </button>
            </form>
          </div>
        )}
      </div>

      <style>{`
        .profile-page { display: grid; grid-template-columns: 260px 1fr; gap: 24px; padding-bottom: 40px; }
        .profile-sidebar {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 24px;
          height: fit-content;
          position: sticky;
          top: calc(var(--navbar-height) + 20px);
        }
        .profile-user-info { text-align: center; padding-bottom: 20px; }
        .profile-big-avatar {
          width: 72px; height: 72px;
          background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.8rem; font-weight: 700; color: white;
          margin: 0 auto 12px;
        }
        .profile-user-name { font-weight: 700; font-size: 1rem; }
        .profile-user-email { font-size: 0.8rem; color: var(--text-muted); margin-top: 4px; }
        .profile-nav { display: flex; flex-direction: column; gap: 4px; }
        .profile-content { min-height: 400px; }
        @media (max-width: 768px) {
          .profile-page { grid-template-columns: 1fr; }
          .profile-sidebar { position: static; }
        }
      `}</style>
    </div>
  );
}
