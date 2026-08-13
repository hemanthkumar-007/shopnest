# 🛍️ ShopNest — Full-Stack E-Commerce Platform

A modern, production-ready full-stack e-commerce web application built with **React (Vite)** on the frontend and **Python (Django & Django REST Framework)** on the backend.

---

## 🌟 Tech Stack

### Frontend
- **Framework**: React.js 18 with Vite
- **Routing**: React Router v6 (Nested layouts, protected routes, admin routes)
- **HTTP Client**: Axios with JWT request & automatic token refresh interceptors
- **State Management**: React Context API (`AuthContext`, `CartContext`, `WishlistContext`)
- **Notifications**: React Hot Toast
- **Styling**: Vanilla CSS Design System with dark mode, glassmorphism, responsive grid, and custom micro-animations

### Backend
- **Framework**: Python 3.12, Django 6.0, Django REST Framework (DRF) 3.18
- **Authentication**: JWT via `djangorestframework-simplejwt`
- **Database**: SQLite (development) with direct switchability to PostgreSQL for production
- **Filtering & Search**: `django-filter`, DRF SearchFilter, OrderingFilter
- **API Documentation**: OpenAPI 3.0 / Swagger UI via `drf-spectacular`
- **Security & CORS**: `django-cors-headers`, environment configuration via `python-decouple`

---

## 📁 Project Structure

```text
ecommerce/
├── backend/
│   ├── config/              # Core Django project settings, JWT, CORS, URL routers
│   ├── users/               # Custom User model, profile, authentication, JWT tokens
│   ├── categories/          # Category model, hierarchical slugging, product counts
│   ├── products/            # Product model, multiple images, filters, seed command
│   ├── cart/                # Persistent user cart & dynamic tax/shipping calculation
│   ├── wishlist/            # User wishlist & quick move-to-cart
│   ├── orders/              # Order lifecycle, status transitions, item snapshots
│   ├── payments/            # Payment gateway abstraction (COD, Razorpay, Stripe)
│   ├── reviews/             # Product reviews, star ratings & aggregate scores
│   ├── manage.py
│   ├── requirements.txt
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, Footer, ProductCard, RatingStars, Pagination, etc.
│   │   ├── context/         # AuthContext, CartContext, WishlistContext
│   │   ├── layouts/         # MainLayout with persistent responsive navigation
│   │   ├── pages/           # Home, Products, Detail, Category, Search, Cart, Wishlist, Checkout, Orders, Profile, Admin
│   │   ├── services/        # Centralized Axios API service layer
│   │   ├── utils/           # Formatters, icons, helpers
│   │   ├── App.jsx          # Route declarations & global providers
│   │   ├── index.css        # Comprehensive design system
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── .env
└── README.md
```

---

## 🚀 Getting Started

### 1. Backend Setup

```bash
cd backend

# Create & activate virtual environment (optional but recommended)
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Apply database migrations
python manage.py migrate

# Seed database with categories, 20+ sample products, reviews & test users
python manage.py populate_db

# Start Django development server
python manage.py runserver
```
Backend will be live at: `http://127.0.0.1:8000/`  
API root: `http://127.0.0.1:8000/api/`  
Interactive Swagger API Docs: `http://127.0.0.1:8000/api/docs/`  
Django Admin: `http://127.0.0.1:8000/admin/`

---

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server
npm run dev
```
Frontend will be live at: `http://localhost:5173/`

---

## 🔑 Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@shopnest.com` | `admin123` |
| **Customer 1** | `alice@example.com` | `testpass123` |
| **Customer 2** | `bob@example.com` | `testpass123` |

---

## 🌐 API Overview

| Endpoint | Methods | Description |
|---|---|---|
| `/api/auth/register/` | `POST` | Register a new user |
| `/api/auth/login/` | `POST` | Login & retrieve JWT access/refresh tokens |
| `/api/auth/token/refresh/` | `POST` | Refresh access token using refresh token |
| `/api/auth/profile/` | `GET, PUT` | Retrieve or update current user profile |
| `/api/auth/change-password/` | `POST` | Change user password |
| `/api/auth/admin/stats/` | `GET` | Admin-only aggregated statistics |
| `/api/categories/` | `GET` | List all product categories |
| `/api/products/` | `GET, POST` | List/Filter/Search products (POST admin-only) |
| `/api/products/{id}/` | `GET, PUT, DELETE`| Product details & management |
| `/api/cart/` | `GET` | Get current user's cart |
| `/api/cart/add/` | `POST` | Add product to cart |
| `/api/cart/update/` | `PUT` | Update quantity of a cart item |
| `/api/cart/remove/{item_id}/` | `DELETE` | Remove item from cart |
| `/api/cart/clear/` | `DELETE` | Empty cart |
| `/api/wishlist/` | `GET` | View user's wishlist |
| `/api/wishlist/add/` | `POST` | Add item to wishlist |
| `/api/wishlist/remove/{product_id}/` | `DELETE` | Remove item from wishlist |
| `/api/wishlist/move-to-cart/{product_id}/` | `POST` | Move wishlist item to active cart |
| `/api/orders/` | `GET` | List user orders |
| `/api/orders/create/` | `POST` | Place order from cart |
| `/api/orders/{id}/` | `GET` | Order details & status tracker |
| `/api/orders/{id}/cancel/` | `POST` | Cancel order (if eligible) |
| `/api/orders/admin/all/` | `GET` | Admin: view all orders across customers |
| `/api/orders/admin/{id}/status/` | `PUT` | Admin: transition order status |
| `/api/reviews/products/{id}/reviews/` | `GET, POST`| Get/Add product review & rating |

---

## ✨ Features Implemented

- 🎨 **Sleek Dark Mode Design System**: Custom HSL-inspired palette, glassmorphism cards, micro-animations, accessible typography.
- 📱 **Mobile & Tablet Optimized**: Responsive navigation drawer, responsive product grid, fluid checkout.
- 🔍 **Filtering & Instant Search**: Filter by category, price range, minimum rating, brand, and stock status with URL query state.
- 🛒 **Persistent Shopping Cart**: Real-time server-synced cart with item counters, subtotal, 18% GST tax, and free shipping thresholds.
- ♡ **Wishlist Support**: One-click heart toggle on products with quick move-to-cart action.
- 📦 **Order Workflow & Tracking**: Order placement snapshotting, visual step-by-step progress tracking (`pending` → `confirmed` → `processing` → `shipped` → `delivered`), and cancellation support.
- ⚡ **Admin Dashboard**: Live store stats (total revenue, product count, user count, order breakdown), order status updates, and deep links to Django Admin.
- 🛡️ **JWT Security**: Protected routes, automatic silent token refresh on 401 expiration, secure logout with token blacklisting.
