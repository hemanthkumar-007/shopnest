import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService, categoryService } from '../services';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/LoadingStates';
import Pagination from '../components/Pagination';

const SORT_OPTIONS = [
  { value: '-created_at', label: 'Newest First' },
  { value: 'price', label: 'Price: Low to High' },
  { value: '-price', label: 'Price: High to Low' },
  { value: '-rating', label: 'Highest Rated' },
  { value: '-review_count', label: 'Most Popular' },
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    brand: searchParams.get('brand') || '',
    min_price: searchParams.get('min_price') || '',
    max_price: searchParams.get('max_price') || '',
    min_rating: searchParams.get('min_rating') || '',
    in_stock: searchParams.get('in_stock') || '',
    ordering: searchParams.get('ordering') || '-created_at',
    search: searchParams.get('search') || searchParams.get('q') || '',
    page: parseInt(searchParams.get('page')) || 1,
  });
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    categoryService.getAll().then(res => {
      setCategories(res.data.results || res.data || []);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.brand) params.brand = filters.brand;
      if (filters.min_price) params.min_price = filters.min_price;
      if (filters.max_price) params.max_price = filters.max_price;
      if (filters.min_rating) params.min_rating = filters.min_rating;
      if (filters.in_stock) params.in_stock = filters.in_stock;
      if (filters.ordering) params.ordering = filters.ordering;
      if (filters.search) params.search = filters.search;
      params.page = filters.page;

      const res = await productService.getAll(params);
      const data = res.data;
      setProducts(data.results || []);
      setTotalPages(Math.ceil((data.count || 0) / 12));
      setTotalCount(data.count || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({ category: '', brand: '', min_price: '', max_price: '', min_rating: '', in_stock: '', ordering: '-created_at', search: '', page: 1 });
  };

  const activeFilterCount = [filters.category, filters.brand, filters.min_price, filters.max_price, filters.min_rating, filters.in_stock].filter(Boolean).length;

  return (
    <div className="products-page">
      {/* Header */}
      <div className="products-header">
        <div>
          <h1 className="page-title">All Products</h1>
          {!loading && <p className="text-muted">{totalCount} products found</p>}
        </div>
        <div className="products-header-actions">
          <button className="btn btn-outline btn-sm" onClick={() => setFilterOpen(!filterOpen)}>
            🔧 Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>
          <select
            className="form-select"
            style={{ width: 'auto', padding: '8px 12px' }}
            value={filters.ordering}
            onChange={(e) => updateFilter('ordering', e.target.value)}
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="products-layout">
        {/* Filter Sidebar */}
        <aside className={`filter-sidebar ${filterOpen ? 'filter-sidebar-open' : ''}`}>
          <div className="filter-sidebar-header">
            <h3>Filters</h3>
            {activeFilterCount > 0 && (
              <button className="btn btn-ghost btn-sm" onClick={clearFilters}>Clear All</button>
            )}
          </div>

          {/* Category */}
          <div className="filter-group">
            <div className="filter-label">Category</div>
            {categories.map(cat => (
              <label key={cat.id} className="filter-option">
                <input
                  type="radio"
                  name="category"
                  checked={filters.category === cat.slug}
                  onChange={() => updateFilter('category', filters.category === cat.slug ? '' : cat.slug)}
                />
                <span>{cat.name}</span>
                <span className="filter-count">{cat.product_count}</span>
              </label>
            ))}
          </div>

          {/* Price Range */}
          <div className="filter-group">
            <div className="filter-label">Price Range</div>
            <div className="price-inputs">
              <input
                type="number"
                placeholder="Min ₹"
                className="form-input"
                value={filters.min_price}
                onChange={(e) => updateFilter('min_price', e.target.value)}
              />
              <input
                type="number"
                placeholder="Max ₹"
                className="form-input"
                value={filters.max_price}
                onChange={(e) => updateFilter('max_price', e.target.value)}
              />
            </div>
          </div>

          {/* Rating */}
          <div className="filter-group">
            <div className="filter-label">Minimum Rating</div>
            {[4, 3, 2].map(r => (
              <label key={r} className="filter-option">
                <input
                  type="radio"
                  name="rating"
                  checked={filters.min_rating === String(r)}
                  onChange={() => updateFilter('min_rating', filters.min_rating === String(r) ? '' : String(r))}
                />
                <span>{'★'.repeat(r)}{'☆'.repeat(5 - r)} & above</span>
              </label>
            ))}
          </div>

          {/* Availability */}
          <div className="filter-group">
            <div className="filter-label">Availability</div>
            <label className="filter-option">
              <input
                type="checkbox"
                checked={filters.in_stock === 'true'}
                onChange={(e) => updateFilter('in_stock', e.target.checked ? 'true' : '')}
              />
              <span>In Stock Only</span>
            </label>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="products-content">
          {loading ? (
            <ProductGridSkeleton count={12} />
          ) : products.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔍</div>
              <h3>No products found</h3>
              <p>Try adjusting your filters or search terms</p>
              <button className="btn btn-primary" onClick={clearFilters}>Clear Filters</button>
            </div>
          ) : (
            <>
              <div className="product-grid">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              <Pagination
                currentPage={filters.page}
                totalPages={totalPages}
                onPageChange={(page) => setFilters(prev => ({ ...prev, page }))}
              />
            </>
          )}
        </div>
      </div>

      <style>{`
        .products-page { padding-bottom: 40px; }
        .products-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 28px;
          flex-wrap: wrap;
          gap: 16px;
        }
        .page-title { font-size: 1.8rem; font-weight: 800; }
        .products-header-actions { display: flex; gap: 12px; align-items: center; }
        .products-layout {
          display: grid;
          grid-template-columns: 260px 1fr;
          gap: 28px;
          align-items: start;
        }
        .filter-sidebar {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 20px;
          position: sticky;
          top: calc(var(--navbar-height) + 20px);
        }
        .filter-sidebar-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .filter-sidebar-header h3 { font-size: 1rem; font-weight: 700; }
        .filter-group {
          margin-bottom: 24px;
          padding-bottom: 24px;
          border-bottom: 1px solid var(--border);
        }
        .filter-group:last-child { border-bottom: none; }
        .filter-label {
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-secondary);
          margin-bottom: 12px;
        }
        .filter-option {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 0;
          cursor: pointer;
          font-size: 0.875rem;
          color: var(--text-secondary);
          transition: var(--transition);
        }
        .filter-option:hover { color: var(--text-primary); }
        .filter-option input { accent-color: var(--primary); }
        .filter-count {
          margin-left: auto;
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .price-inputs { display: flex; gap: 8px; }
        .price-inputs .form-input { padding: 8px 12px; font-size: 0.85rem; }
        @media (max-width: 1024px) {
          .products-layout { grid-template-columns: 1fr; }
          .filter-sidebar {
            display: none;
            position: static;
          }
          .filter-sidebar-open { display: block; }
        }
      `}</style>
    </div>
  );
}
