/**
 * Created by: Kanagaraj P
 * Created on: 01-03-2026
 */
import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import { LIGHT_THEME, DARK_THEME } from '../constants/theme';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);

  const theme = useMemo(() => (isDark ? DARK_THEME : LIGHT_THEME), [isDark]);

  const toggleTheme = useCallback(() => setIsDark((prev) => !prev), []);

  const value = useMemo(() => ({ theme, isDark, toggleTheme }), [theme, isDark, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
