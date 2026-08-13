import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      toast.success('Welcome back!');
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">🛍️ ShopNest</Link>
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">Sign in to your account</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">Password</label>
              <Link to="/forgot-password" className="auth-link" style={{ fontSize: '0.8rem' }}>
                Forgot password?
              </Link>
            </div>
            <input
              id="login-password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? (
              <><span className="spinner spinner-sm" /> Signing in...</>
            ) : 'Sign In'}
          </button>
        </form>

        <div className="auth-divider">
          <span>Demo Credentials</span>
        </div>
        <div className="demo-creds">
          <div className="demo-cred-item">
            <span className="demo-label">User:</span>
            <code className="demo-value">alice@example.com / testpass123</code>
          </div>
          <div className="demo-cred-item">
            <span className="demo-label">Admin:</span>
            <code className="demo-value">admin@shopnest.com / admin123</code>
          </div>
        </div>

        <p className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register" className="auth-link">Create Account</Link>
        </p>
      </div>

      <AuthPageStyles />
    </div>
  );
}

function AuthPageStyles() {
  return (
    <style>{`
      .auth-page {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        margin-top: calc(-1 * var(--navbar-height));
        background: radial-gradient(ellipse at top left, rgba(99, 102, 241, 0.1) 0%, transparent 50%),
                    radial-gradient(ellipse at bottom right, rgba(99, 102, 241, 0.05) 0%, transparent 50%),
                    var(--bg-primary);
      }
      .auth-card {
        background: var(--bg-card);
        border: 1px solid var(--border-hover);
        border-radius: var(--radius-xl);
        padding: 40px;
        width: 100%;
        max-width: 440px;
        box-shadow: var(--shadow-lg);
        animation: slideUp 0.3s ease;
      }
      .auth-logo {
        display: block;
        text-align: center;
        font-size: 1.4rem;
        font-weight: 800;
        margin-bottom: 24px;
        text-decoration: none;
        background: linear-gradient(135deg, var(--text-primary), var(--primary-light));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      .auth-header { text-align: center; margin-bottom: 28px; }
      .auth-title { font-size: 1.6rem; font-weight: 800; margin-bottom: 6px; }
      .auth-subtitle { color: var(--text-secondary); font-size: 0.9rem; }
      .auth-form { margin-bottom: 20px; }
      .auth-link { color: var(--primary-light); text-decoration: none; font-weight: 500; }
      .auth-link:hover { color: var(--primary); }
      .auth-divider {
        display: flex;
        align-items: center;
        gap: 12px;
        margin: 20px 0;
        color: var(--text-muted);
        font-size: 0.8rem;
      }
      .auth-divider::before, .auth-divider::after {
        content: '';
        flex: 1;
        height: 1px;
        background: var(--border);
      }
      .demo-creds {
        background: var(--bg-secondary);
        border-radius: var(--radius-md);
        padding: 12px 16px;
        margin-bottom: 20px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .demo-cred-item { display: flex; align-items: center; gap: 8px; font-size: 0.8rem; }
      .demo-label { color: var(--text-muted); min-width: 40px; }
      .demo-value { color: var(--primary-light); font-size: 0.75rem; }
      .auth-footer { text-align: center; color: var(--text-secondary); font-size: 0.875rem; }
    `}</style>
  );
}
