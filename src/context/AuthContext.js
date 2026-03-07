/**
 * Created by: Kanagaraj P
 * Created on: 01-03-2026
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
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

  // On app start: fetch fresh admin token + restore saved user
  useEffect(() => {
    (async () => {
      try {
        await getAdminToken(); // always fetches fresh token
        setAdminTokenReady(true);
      } catch (e) {
        console.warn('Admin token fetch failed:', e.message);
        setAdminTokenReady(true); // continue anyway
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

  const checkAdminTokenChanged = () => isAdminTokenChanged();

  const login = async (email, password) => {
    const data = await loginUser(email, password);
    const userData = {
      email,
      user_id: data.id || data.user_id || '',
      firstname: data.firstname || data.firstName || email.split('@')[0],
      lastname: data.lastname || data.lastName || '',
      ...data,
    };
    setUser(userData);
    await saveUser(userData);
    resetAdminTokenChanged(); // clear flag after successful login
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
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, adminTokenReady, login, register, logout, checkAdminTokenChanged }}
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
