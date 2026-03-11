/**
 * Created by: Kanagaraj P
 * Created on: 01-03-2026
 */
import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  getAdminToken,
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

  // On app start: fetch fresh admin token + restore saved user
  useEffect(() => {
    (async () => {
      try {
        await getAdminToken();
        setAdminTokenReady(true);
      } catch (e) {
        console.warn('Admin token fetch failed:', e.message);
        setAdminTokenReady(true);
      }
      try {
        const stored = await getStoredUser();
        if (stored) setUser(stored);
      } catch (e) {
        console.warn('Restore user failed:', e.message);
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
    const userData = {
      ...data,
      email,
      user_id: data.id || data.user_id || '',
      firstname: data.firstname || data.firstName || email.split('@')[0],
      lastname: data.lastname || data.lastName || '',
    };
    setUser(userData);
    await saveUser(userData);
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
