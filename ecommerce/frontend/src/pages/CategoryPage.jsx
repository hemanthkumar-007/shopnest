import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { productService, categoryService } from '../services';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/LoadingStates';
import Pagination from '../components/Pagination';
import { getCategoryIcon } from '../utils/helpers';

export default function CategoryPage() {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    categoryService.getBySlug(slug).then(res => setCategory(res.data)).catch(console.error);
  }, [slug]);

  useEffect(() => {
    setLoading(true);
    productService.getAll({ category: slug, page }).then(res => {
      setProducts(res.data.results || []);
      setTotalPages(Math.ceil((res.data.count || 0) / 12));
      setTotalCount(res.data.count || 0);
    }).catch(console.error).finally(() => setLoading(false));
  }, [slug, page]);

  return (
    <div className="category-page">
      <div className="breadcrumb">
        <Link to="/">Home</Link>
        <span className="sep">›</span>
        <Link to="/products">Products</Link>
        <span className="sep">›</span>
        <span className="current">{category?.name || slug}</span>
      </div>

      <div className="category-header">
        <div className="category-header-icon">
          {getCategoryIcon(category?.name || '')}
        </div>
        <div>
          <h1 className="page-title">{category?.name || slug}</h1>
          {category?.description && (
            <p className="text-muted">{category.description}</p>
          )}
          {!loading && <p className="text-muted mt-2">{totalCount} products</p>}
        </div>
      </div>

      {loading ? <ProductGridSkeleton count={12} /> : (
        products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <h3>No products in this category</h3>
            <Link to="/products" className="btn btn-primary">Browse All Products</Link>
          </div>
        ) : (
          <>
            <div className="product-grid">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
          </>
        )
      )}

      <style>{`
        .category-page { padding-bottom: 40px; }
        .category-header {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 32px;
          padding: 28px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-xl);
        }
        .category-header-icon { font-size: 3.5rem; }
      `}</style>
    </div>
  );
}
