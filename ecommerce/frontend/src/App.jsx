import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

// Layout
import MainLayout from './layouts/MainLayout';

// Route guards
import { ProtectedRoute, AdminRoute, GuestRoute } from './components/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CategoryPage from './pages/CategoryPage';
import SearchPage from './pages/SearchPage';
import CartPage from './pages/CartPage';
import WishlistPage from './pages/WishlistPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ProfilePage from './pages/ProfilePage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: '#1e293b',
                  color: '#f1f5f9',
                  border: '1px solid rgba(99, 102, 241, 0.2)',
                  borderRadius: '12px',
                  fontSize: '0.875rem',
                },
                success: {
                  iconTheme: { primary: '#10b981', secondary: '#fff' },
                },
                error: {
                  iconTheme: { primary: '#ef4444', secondary: '#fff' },
                },
              }}
            />

            <Routes>
              {/* Public routes - no auth required */}
              <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
              <Route path="/products" element={<MainLayout><ProductsPage /></MainLayout>} />
              <Route path="/products/:id" element={<MainLayout><ProductDetailPage /></MainLayout>} />
              <Route path="/category/:slug" element={<MainLayout><CategoryPage /></MainLayout>} />
              <Route path="/search" element={<MainLayout><SearchPage /></MainLayout>} />

              {/* Guest routes - redirect if logged in */}
              <Route path="/login" element={<GuestRoute><MainLayout><LoginPage /></MainLayout></GuestRoute>} />
              <Route path="/register" element={<GuestRoute><MainLayout><RegisterPage /></MainLayout></GuestRoute>} />
              <Route path="/forgot-password" element={<MainLayout><ForgotPasswordPage /></MainLayout>} />
              <Route path="/reset-password" element={<MainLayout><ForgotPasswordPage /></MainLayout>} />

              {/* Protected routes - require auth */}
              <Route path="/cart" element={<ProtectedRoute><MainLayout><CartPage /></MainLayout></ProtectedRoute>} />
              <Route path="/wishlist" element={<ProtectedRoute><MainLayout><WishlistPage /></MainLayout></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><MainLayout><CheckoutPage /></MainLayout></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><MainLayout><ProfilePage /></MainLayout></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><MainLayout><OrdersPage /></MainLayout></ProtectedRoute>} />
              <Route path="/orders/:id" element={<ProtectedRoute><MainLayout><OrderDetailPage /></MainLayout></ProtectedRoute>} />

              {/* Admin routes */}
              <Route path="/admin" element={<AdminRoute><MainLayout><AdminDashboard /></MainLayout></AdminRoute>} />

              {/* 404 */}
              <Route path="*" element={
                <MainLayout>
                  <div className="empty-state" style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ fontSize: '5rem', marginBottom: '16px' }}>404</div>
                    <h2>Page Not Found</h2>
                    <p className="text-muted">The page you're looking for doesn't exist.</p>
                    <a href="/" className="btn btn-primary" style={{ marginTop: '20px' }}>Go Home</a>
                  </div>
                </MainLayout>
              } />
            </Routes>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
