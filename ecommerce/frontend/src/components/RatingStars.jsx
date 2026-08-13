export default function RatingStars({ rating = 0, size = 'md', showNumber = false }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);
  const fontSize = size === 'sm' ? '0.75rem' : size === 'lg' ? '1.1rem' : '0.9rem';

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '2px', fontSize }}>
      {Array(fullStars).fill(null).map((_, i) => (
        <span key={`full-${i}`} style={{ color: '#f59e0b' }}>★</span>
      ))}
      {hasHalf && <span style={{ color: '#f59e0b' }}>½</span>}
      {Array(emptyStars).fill(null).map((_, i) => (
        <span key={`empty-${i}`} style={{ color: 'var(--text-muted)' }}>☆</span>
      ))}
      {showNumber && (
        <span style={{ color: 'var(--text-secondary)', marginLeft: '4px', fontSize: '0.85em' }}>
          {Number(rating).toFixed(1)}
        </span>
      )}
    </span>
  );
}

export function InteractiveStars({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '4px', cursor: 'pointer' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => onChange(star)}
          style={{
            fontSize: '1.5rem',
            color: star <= value ? '#f59e0b' : 'var(--text-muted)',
            transition: 'color 0.1s',
            cursor: 'pointer',
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}
