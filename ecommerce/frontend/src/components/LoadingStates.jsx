export function LoadingSpinner({ size = 'md', message = '' }) {
  return (
    <div className="loading-container">
      <div className={`spinner ${size === 'sm' ? 'spinner-sm' : ''}`} />
      {message && <p>{message}</p>}
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="product-grid">
      {Array(count).fill(null).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-image" />
          <div className="skeleton-body">
            <div className="skeleton-line" style={{ width: '60%', height: '12px' }} />
            <div className="skeleton-line" style={{ width: '90%' }} />
            <div className="skeleton-line" style={{ width: '75%' }} />
            <div className="skeleton-line" style={{ width: '50%', height: '18px', marginTop: '8px' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PageLoader() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '80vh',
      flexDirection: 'column',
      gap: '16px',
    }}>
      <div className="spinner" />
      <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
    </div>
  );
}
