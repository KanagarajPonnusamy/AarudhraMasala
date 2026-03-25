/**
 * Created by: Kanagaraj P
 * Created on: 03-03-2026
 */
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { placeOrderAPI, fetchOrdersAPI, updateOrderStatusAPI, sendOrderAlert } from '../services/api';
import { useAuth } from './AuthContext';

const ORDERS_KEY = '@orders';

const OrderContext = createContext();

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { onLogout } = useAuth();

  useEffect(() => {
    loadOrders();
  }, []);

  // Clear orders when user logs out
  useEffect(() => {
    const unsubscribe = onLogout(() => {
      setOrders([]);
      AsyncStorage.removeItem(ORDERS_KEY).catch(() => {});
    });
    return unsubscribe;
  }, [onLogout]);

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

  const STATUS_MAP = {
    BOOKED: 'Order Placed',
    CONFIRMED: 'Confirmed',
    SHIPPED: 'Shipped',
    OUT_FOR_DELIVERY: 'Out for Delivery',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
  };

  const fetchOrders = useCallback(async (userid, usertype) => {
    try {
      setLoading(true);
      const data = await fetchOrdersAPI(userid, usertype || 'end-user');
      const list = Array.isArray(data) ? data : data?.orders || [];
      const transformed = list.map((entry) => {
        const o = entry.order || {};
        const details = entry.orderdetails || [];
        const shipping = entry.shippinginfo || [];
        const firstShip = shipping[0] || {};
        return {
          id: o.orderid,
          placed_at: o.ordered_at,
          orderstatus: o.orderstatus || '',
          status: STATUS_MAP[o.orderstatus] || o.orderstatus || 'Order Placed',
          shippingaddress: o.shippingaddress,
          total_amount: o.total_amount,
          orderdetails: details,
          trackingno: firstShip.trackingno || '',
          shippingstatus: firstShip.status || '',
        };
      });
      transformed.sort((a, b) => (new Date(b.placed_at || 0)) - (new Date(a.placed_at || 0)));
      setOrders(transformed);
      await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(transformed));
    } catch (e) {
      console.warn('Failed to fetch orders from API:', e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateOrderStatus = useCallback(async (orderid, userid, status, usertype) => {
    await updateOrderStatusAPI(orderid, userid, status);
    await fetchOrders(userid, usertype);
  }, [fetchOrders]);

  const placeOrder = useCallback(async (orderData) => {
    // Send order to API
    const userid = orderData.order?.userid || 0;
    const apiResponse = await placeOrderAPI(userid, orderData);

    // Merge orderdetails: preserve productname from local data
    const localDetails = orderData.orderdetails || [];
    const apiDetails = apiResponse?.orderdetails;
    const mergedDetails = apiDetails
      ? apiDetails.map((detail, idx) => ({
          ...detail,
          productname: detail.productname || localDetails[idx]?.productname || '',
        }))
      : localDetails;

    console.log('[Order] Place order API response:', JSON.stringify(apiResponse));
    const orderId = apiResponse?.order?.orderid || apiResponse?.orderid || `ORD-${Date.now()}`;
    console.log('[Order] Extracted orderId:', orderId);

    // Fire-and-forget: send order alert email
    sendOrderAlert(userid, orderId);

    const newOrder = {
      ...orderData,
      ...apiResponse,
      id: orderId,
      orderid: orderId,
      orderdetails: mergedDetails,
      status: 'Confirmed',
      placed_at: new Date().toISOString(),
    };

    // Also save locally
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
    <OrderContext.Provider value={{ orders, loading, placeOrder, fetchOrders, updateOrderStatus }}>
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
