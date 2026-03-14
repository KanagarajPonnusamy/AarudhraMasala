/**
 * Created by: Kanagaraj P
 * Created on: 03-03-2026
 */
import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = useCallback((product, qty = 1) => {
    setCartItems((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev;
      }
      return [...prev, { ...product, quantity: qty }];
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId, quantity) => {
    if (quantity <= 0) {
      setCartItems((prev) => prev.filter((item) => item.id !== productId));
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  }, []);

  const isInCart = useCallback(
    (productId) => cartItems.some((item) => item.id === productId),
    [cartItems]
  );

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems]
  );

  const cartTotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems]
  );

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const getOrderObject = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    const productcodes = cartItems
      .map((item) => item.productcode || '')
      .filter(Boolean)
      .join(', ');

    return {
      order: {
        userid: 0,
        total_amount: cartTotal,
        productcodes,
        shippingaddress: '',
        pincode: '',
        billingaddress: '',
        ordered_at: today,
      },
      orderdetails: cartItems.map((item) => ({
        userid: 0,
        quantity: item.quantity,
        quantity_val: item.quantity_val || '',
        productprice: String(item.price),
        productcode: item.productcode || '',
        productname: item.name || '',
      })),
    };
  }, [cartItems, cartTotal]);

  const value = useMemo(() => ({
    cartItems,
    cartCount,
    cartTotal,
    addToCart,
    removeFromCart,
    updateQuantity,
    isInCart,
    getOrderObject,
    clearCart,
  }), [cartItems, cartCount, cartTotal, addToCart, removeFromCart, updateQuantity, isInCart, getOrderObject, clearCart]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
