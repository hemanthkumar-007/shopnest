import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // In production: call POST /api/auth/forgot-password/ endpoint
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      marginTop: 'calc(-1 * var(--navbar-height))',
    }}>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-hover)',
        borderRadius: 'var(--radius-xl)',
        padding: '40px',
        width: '100%',
        maxWidth: '440px',
        boxShadow: 'var(--shadow-lg)',
        animation: 'slideUp 0.3s ease',
      }}>
        <Link to="/" style={{ display: 'block', textAlign: 'center', fontSize: '1.4rem', fontWeight: 800, marginBottom: '24px', textDecoration: 'none', color: 'var(--text-primary)' }}>
          🛍️ ShopNest
        </Link>

        {submitted ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📧</div>
            <h2 style={{ marginBottom: '12px' }}>Check Your Email</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <Link to="/login" className="btn btn-primary btn-full">Back to Login</Link>
          </div>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '6px' }}>Forgot Password?</h1>
              <p style={{ color: 'var(--text-secondary)' }}>Enter your email to reset your password</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary btn-full btn-lg">
                Send Reset Link
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Remember your password?{' '}
              <Link to="/login" style={{ color: 'var(--primary-light)', textDecoration: 'none', fontWeight: 500 }}>
                Sign In
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
