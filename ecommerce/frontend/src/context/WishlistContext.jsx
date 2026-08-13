import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { wishlistService } from '../services';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [wishlistCount, setWishlistCount] = useState(0);

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) { setWishlistIds(new Set()); setWishlistCount(0); return; }
    try {
      const response = await wishlistService.getWishlist();
      const products = response.data.data.products || [];
      setWishlistIds(new Set(products.map(p => p.id)));
      setWishlistCount(products.length);
    } catch {}
  }, [isAuthenticated]);

  useEffect(() => { fetchWishlist(); }, [fetchWishlist]);

  const toggleWishlist = useCallback(async (productId) => {
    if (!isAuthenticated) { toast.error('Please login to use wishlist'); return; }
    if (wishlistIds.has(productId)) {
      try {
        await wishlistService.removeFromWishlist(productId);
        setWishlistIds(prev => { const s = new Set(prev); s.delete(productId); return s; });
        setWishlistCount(c => c - 1);
        toast.success('Removed from wishlist');
      } catch { toast.error('Failed to remove'); }
    } else {
      try {
        await wishlistService.addToWishlist(productId);
        setWishlistIds(prev => new Set([...prev, productId]));
        setWishlistCount(c => c + 1);
        toast.success('Added to wishlist!');
      } catch { toast.error('Failed to add'); }
    }
  }, [isAuthenticated, wishlistIds]);

  const isInWishlist = useCallback((productId) => wishlistIds.has(productId), [wishlistIds]);

  return (
    <WishlistContext.Provider value={{ wishlistIds, wishlistCount, fetchWishlist, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within WishlistProvider');
  return context;
}
