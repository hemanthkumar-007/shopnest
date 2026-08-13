import api from './api';

// ===== AUTH =====
export const authService = {
  register: (data) => api.post('/auth/register/', data),
  login: (data) => api.post('/auth/login/', data),
  logout: (refreshToken) => api.post('/auth/logout/', { refresh: refreshToken }),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.put('/auth/profile/', data),
  changePassword: (data) => api.post('/auth/change-password/', data),
  getAdminStats: () => api.get('/auth/admin/stats/'),
};

// ===== PRODUCTS =====
export const productService = {
  getAll: (params) => api.get('/products/', { params }),
  getById: (id) => api.get(`/products/${id}/`),
  getFeatured: () => api.get('/products/featured/'),
  getNewArrivals: () => api.get('/products/new_arrivals/'),
  getBestSellers: () => api.get('/products/best_sellers/'),
  create: (data) => api.post('/products/', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, data) => api.put(`/products/${id}/`, data),
  delete: (id) => api.delete(`/products/${id}/`),
};

// ===== CATEGORIES =====
export const categoryService = {
  getAll: () => api.get('/categories/'),
  getBySlug: (slug) => api.get(`/categories/${slug}/`),
};

// ===== CART =====
export const cartService = {
  getCart: () => api.get('/cart/'),
  addToCart: (data) => api.post('/cart/add/', data),
  updateCart: (data) => api.put('/cart/update/', data),
  removeFromCart: (itemId) => api.delete(`/cart/remove/${itemId}/`),
  clearCart: () => api.delete('/cart/clear/'),
};

// ===== WISHLIST =====
export const wishlistService = {
  getWishlist: () => api.get('/wishlist/'),
  addToWishlist: (productId) => api.post('/wishlist/add/', { product_id: productId }),
  removeFromWishlist: (productId) => api.delete(`/wishlist/remove/${productId}/`),
  moveToCart: (productId) => api.post(`/wishlist/move-to-cart/${productId}/`),
};

// ===== ORDERS =====
export const orderService = {
  validateCoupon: (code, subtotal) => api.post('/orders/coupons/validate/', { code, subtotal }),
  createOrder: (data) => api.post('/orders/create/', data),
  getOrders: () => api.get('/orders/'),
  getOrderById: (id) => api.get(`/orders/${id}/`),
  cancelOrder: (id) => api.post(`/orders/${id}/cancel/`),
  getAdminOrders: (params) => api.get('/orders/admin/all/', { params }),
  updateOrderStatus: (id, data) => api.put(`/orders/admin/${id}/status/`, data),
};

// ===== REVIEWS =====
export const reviewService = {
  getProductReviews: (productId) => api.get(`/reviews/products/${productId}/reviews/`),
  createReview: (productId, data) => api.post(`/reviews/products/${productId}/reviews/`, data),
  updateReview: (reviewId, data) => api.put(`/reviews/${reviewId}/`, data),
  deleteReview: (reviewId) => api.delete(`/reviews/${reviewId}/`),
};

// ===== PAYMENTS =====
export const paymentService = {
  initiatePayment: (data) => api.post('/payments/initiate/', data),
  verifyPayment: (data) => api.post('/payments/verify/', data),
};
