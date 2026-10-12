
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  getCart as getCartApi,
  addToCart as addToCartApi,
  updateCartQuantity as updateCartApi,
  removeFromCart as removeFromCartApi,
} from "../services/api";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load the authenticated user's cart from the backend
  const refreshCart = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getCartApi();
      setCartItems(response.data.cart || []);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load your cart."
      );
    } finally {
      setLoading(false);
    }
  };

  // Add a product or increment its quantity
  const addToCart = async (productId) => {
    setError("");

    try {
      const response = await addToCartApi(productId);
      setCartItems(response.data.cart || []);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Unable to add to cart.");
      return false;
    }
  };

  // Change a product's quantity
  const updateQuantity = async (productId, quantity) => {
    setError("");

    try {
      const response = await updateCartApi(productId, quantity);
      setCartItems(response.data.cart || []);
      return true;
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to update quantity."
      );
      return false;
    }
  };

  // Remove a product
  const removeFromCart = async (productId) => {
    setError("");

    try {
      const response = await removeFromCartApi(productId);
      setCartItems(response.data.cart || []);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Unable to remove item.");
      return false;
    }
  };

  // Derived values: don't store these separately
  const totalItems = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const subtotal = cartItems.reduce(
    (total, item) =>
      total + (item.product?.price || 0) * item.quantity,
    0
  );

  useEffect(() => {
    refreshCart();
  }, []);

  const value = useMemo(
    () => ({
      cartItems,
      loading,
      error,
      totalItems,
      subtotal,
      refreshCart,
      addToCart,
      updateQuantity,
      removeFromCart,
    }),
    [cartItems, loading, error, totalItems, subtotal]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
