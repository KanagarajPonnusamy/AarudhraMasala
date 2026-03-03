/**
 * Created by: Kanagaraj P
 * Created on: 03-03-2026
 */
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ORDERS_KEY = '@orders';

const OrderContext = createContext();

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const stored = await AsyncStorage.getItem(ORDERS_KEY);
      if (stored) {
        setOrders(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to load orders:', e.message);
    } finally {
      setLoading(false);
    }
  };

  const placeOrder = useCallback(async (orderData) => {
    const newOrder = {
      id: `ORD-${Date.now()}`,
      ...orderData,
      status: 'Confirmed',
      placed_at: new Date().toISOString(),
    };

    const updated = [newOrder, ...orders];
    setOrders(updated);
    try {
      await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save order:', e.message);
    }
    return newOrder;
  }, [orders]);

  return (
    <OrderContext.Provider value={{ orders, loading, placeOrder }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
}
