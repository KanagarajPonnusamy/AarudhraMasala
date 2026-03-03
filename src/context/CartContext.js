/**
 * Created by: Kanagaraj P
 * Created on: 03-03-2026
 */
import React, { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = useCallback((product) => {
    setCartItems((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev;
      }
      return [...prev, { ...product, quantity: 1 }];
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

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
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
        total_amount: cartTotal,
        productcodes,
        shippingaddress: '',
        billingaddress: '',
        pincode: '',
        ordered_at: today,
      },
      orderdetails: cartItems.map((item) => ({
        quantity: item.quantity,
        productprice: String(item.price),
        productcode: item.productcode || '',
      })),
    };
  }, [cartItems, cartTotal]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        addToCart,
        removeFromCart,
        updateQuantity,
        isInCart,
        getOrderObject,
        clearCart,
      }}
    >
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
