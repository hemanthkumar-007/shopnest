import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartService } from '../services';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [itemCount, setItemCount] = useState(0);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      setItemCount(0);
      return;
    }
    try {
      setLoading(true);
      const response = await cartService.getCart();
      const cartData = response.data.data;
      setCart(cartData);
      setItemCount(cartData.total_items || 0);
    } catch (err) {
      console.error('Failed to fetch cart', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = useCallback(async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return false;
    }
    try {
      const response = await cartService.addToCart({ product_id: productId, quantity });
      const cartData = response.data.data;
      setCart(cartData);
      setItemCount(cartData.total_items || 0);
      toast.success('Added to cart!');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
      return false;
    }
  }, [isAuthenticated]);

  const updateItem = useCallback(async (itemId, quantity) => {
    try {
      const response = await cartService.updateCart({ item_id: itemId, quantity });
      const cartData = response.data.data;
      setCart(cartData);
      setItemCount(cartData.total_items || 0);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update cart');
    }
  }, []);

  const removeItem = useCallback(async (itemId) => {
    try {
      const response = await cartService.removeFromCart(itemId);
      const cartData = response.data.data;
      setCart(cartData);
      setItemCount(cartData.total_items || 0);
      toast.success('Item removed');
    } catch (err) {
      toast.error('Failed to remove item');
    }
  }, []);

  const clearCart = useCallback(async () => {
    try {
      await cartService.clearCart();
      setCart(null);
      setItemCount(0);
    } catch (err) {
      console.error('Failed to clear cart', err);
    }
  }, []);

  return (
    <CartContext.Provider value={{
      cart, loading, itemCount, fetchCart,
      addToCart, updateItem, removeItem, clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}
