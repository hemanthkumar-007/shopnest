// Format price in Indian Rupees
export function formatPrice(price) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
}

// Truncate text
export function truncate(str, maxLength = 80) {
  if (!str) return '';
  return str.length > maxLength ? str.slice(0, maxLength) + '...' : str;
}

// Format date
export function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateStr));
}

// Get order status color class
export function getStatusClass(status) {
  const map = {
    pending: 'status-pending',
    confirmed: 'status-confirmed',
    processing: 'status-processing',
    shipped: 'status-shipped',
    delivered: 'status-delivered',
    cancelled: 'status-cancelled',
    paid: 'status-paid',
    failed: 'status-failed',
    refunded: 'status-refunded',
  };
  return map[status] || 'badge-secondary';
}

// Build image URL
export function getImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://127.0.0.1:8000'}${path}`;
}

// Category emoji map
export const CATEGORY_ICONS = {
  electronics: '📱',
  fashion: '👕',
  shoes: '👟',
  accessories: '⌚',
  'home & kitchen': '🏠',
  beauty: '💄',
  sports: '⚽',
  books: '📚',
};

export function getCategoryIcon(name) {
  return CATEGORY_ICONS[name?.toLowerCase()] || '🛍️';
}

// Star rating
export function getStarArray(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return { full, half, empty };
}
