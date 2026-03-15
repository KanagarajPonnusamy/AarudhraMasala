/**
 * Created by: Kanagaraj P
 * Created on: 01-03-2026
 */
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  getAdminToken,
  refreshAdminTokenForUser,
  loginUser,
  logoutUser,
  registerUser,
  saveUser,
  getStoredUser,
  clearUser,
  isAdminTokenChanged,
  resetAdminTokenChanged,
} from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [adminTokenReady, setAdminTokenReady] = useState(false);
  const logoutCallbacksRef = useRef([]);

  // Allow other contexts (e.g. OrderContext) to register cleanup on logout
  const onLogout = useCallback((callback) => {
    logoutCallbacksRef.current.push(callback);
    return () => {
      logoutCallbacksRef.current = logoutCallbacksRef.current.filter((cb) => cb !== callback);
    };
  }, []);

  // On app start: restore saved user, then fetch admin token (with user-id if logged in)
  useEffect(() => {
    (async () => {
      let storedUser = null;
      try {
        storedUser = await getStoredUser();
        if (storedUser) setUser(storedUser);
      } catch (e) {
        console.warn('Restore user failed:', e.message);
      }
      try {
        const userId = storedUser?.user_id || storedUser?.id;
        await getAdminToken(userId);
        setAdminTokenReady(true);
      } catch (e) {
        console.warn('Admin token fetch failed:', e.message);
        setAdminTokenReady(true);
      }
      setIsLoading(false);
    })();
  }, []);

  // Periodically check if admin token was refreshed — auto-logout user
  useEffect(() => {
    const interval = setInterval(() => {
      if (isAdminTokenChanged() && user) {
        console.log('[Auth] Admin token changed — auto logging out user');
        setUser(null);
        clearUser();
        resetAdminTokenChanged();
        logoutCallbacksRef.current.forEach((cb) => cb());
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [user]);

  const checkAdminTokenChanged = () => isAdminTokenChanged();

  const login = async (email, password) => {
    const data = await loginUser(email, password);
    console.log('[Auth] Login API raw response:', JSON.stringify(data));
    const userData = {
      ...data,
      email,
      user_id: data.id || data.user_id || '',
      firstname: data.firstname || data.firstName || email.split('@')[0],
      lastname: data.lastname || data.lastName || '',
      phone: data.phone_no || data.phone || '',
      address1: data.address1 || '',
      address2: data.address2 || '',
      address3: data.address3 || '',
      city: data.city || '',
      state: data.state || '',
      pincode: data.pincode || '',
    };
    console.log('[Auth] Saved userData address:', JSON.stringify({
      address1: userData.address1, address2: userData.address2, address3: userData.address3,
      city: userData.city, state: userData.state, pincode: userData.pincode,
    }));
    setUser(userData);
    await saveUser(userData);
    // Re-fetch admin token with user-id now that user is logged in
    const userId = userData.user_id;
    if (userId) {
      await refreshAdminTokenForUser(userId);
    }
    resetAdminTokenChanged();
    return userData;
  };

  const register = async (formData) => {
    const data = await registerUser(formData);
    return data;
  };

  const logout = async () => {
    try {
      if (user?.email) {
        await logoutUser(user.email);
      }
    } catch (e) {
      console.warn('[Auth] Logout API failed:', e.message);
    }
    setUser(null);
    await clearUser();
    logoutCallbacksRef.current.forEach((cb) => cb());
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, adminTokenReady, login, register, logout, checkAdminTokenChanged, onLogout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
