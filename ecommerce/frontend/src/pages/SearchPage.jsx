import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService } from '../services';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/LoadingStates';
import Pagination from '../components/Pagination';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const q = searchParams.get('q') || searchParams.get('search') || '';
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    productService.getAll({ search: q, page }).then(res => {
      setProducts(res.data.results || []);
      setTotalCount(res.data.count || 0);
      setTotalPages(Math.ceil((res.data.count || 0) / 12));
    }).finally(() => setLoading(false));
  }, [q, page]);

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 className="section-title">
          {q ? `Results for "${q}"` : 'Search Products'}
        </h1>
        {!loading && q && <p className="text-muted">{totalCount} products found</p>}
      </div>

      {!q ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>Enter a search term</h3>
          <p>Use the search bar above to find products</p>
        </div>
      ) : loading ? (
        <ProductGridSkeleton count={12} />
      ) : products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">😔</div>
          <h3>No results for "{q}"</h3>
          <p>Try different keywords or browse our categories</p>
        </div>
      ) : (
        <>
          <div className="product-grid">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
