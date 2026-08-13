import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', password: '', password2: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    if (form.password !== form.password2) {
      setErrors({ password2: 'Passwords do not match' });
      return;
    }
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Welcome aboard!');
      navigate('/');
    } catch (err) {
      const errData = err.response?.data;
      if (errData?.errors) setErrors(errData.errors);
      else setErrors({ general: errData?.message || 'Registration failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">🛍️ ShopNest</Link>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Join millions of happy shoppers</p>
        </div>

        {errors.general && <div className="alert alert-error">{errors.general}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input id="reg-fname" type="text" name="first_name" className="form-input" placeholder="John" value={form.first_name} onChange={handleChange} required />
              {errors.first_name && <span className="form-error">{errors.first_name}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input id="reg-lname" type="text" name="last_name" className="form-input" placeholder="Doe" value={form.last_name} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input id="reg-email" type="email" name="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
            {errors.email && <span className="form-error">{errors.email[0] || errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input id="reg-password" type="password" name="password" className="form-input" placeholder="Min. 8 characters" value={form.password} onChange={handleChange} required />
            {errors.password && <span className="form-error">{errors.password[0] || errors.password}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input id="reg-password2" type="password" name="password2" className="form-input" placeholder="Repeat password" value={form.password2} onChange={handleChange} required />
            {errors.password2 && <span className="form-error">{errors.password2}</span>}
          </div>

          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            By creating an account, you agree to our Terms of Service and Privacy Policy.
          </p>

          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? 'Creating Account...' : '🚀 Create Account'}
          </button>
        </form>

        <p className="auth-footer" style={{ marginTop: '20px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary-light)', textDecoration: 'none', fontWeight: 500 }}>Sign In</Link>
        </p>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          margin-top: calc(-1 * var(--navbar-height));
          background: radial-gradient(ellipse at top left, rgba(99, 102, 241, 0.1) 0%, transparent 50%), var(--bg-primary);
        }
        .auth-card {
          background: var(--bg-card);
          border: 1px solid var(--border-hover);
          border-radius: var(--radius-xl);
          padding: 40px;
          width: 100%;
          max-width: 480px;
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
      `}</style>
    </div>
  );
}
