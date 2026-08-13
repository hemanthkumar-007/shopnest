import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { wishlistService } from '../services';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import ProductCard from '../components/ProductCard';
import { ProductGridSkeleton } from '../components/LoadingStates';
import toast from 'react-hot-toast';

export default function WishlistPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { fetchWishlist } = useWishlist();

  useEffect(() => {
    wishlistService.getWishlist()
      .then(res => setProducts(res.data.data?.products || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const moveToCart = async (productId) => {
    try {
      await wishlistService.moveToCart(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
      fetchWishlist();
      toast.success('Moved to cart!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div>
      <div className="section-header">
        <div>
          <h1 className="section-title">♡ My Wishlist</h1>
          {!loading && <p className="text-muted">{products.length} item(s)</p>}
        </div>
      </div>

      {loading ? <ProductGridSkeleton count={4} /> : (
        products.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">♡</div>
            <h3>Your wishlist is empty</h3>
            <p>Save items you love to your wishlist</p>
            <Link to="/products" className="btn btn-primary">Browse Products</Link>
          </div>
        ) : (
          <div className="product-grid">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )
      )}
    </div>
  );
}
