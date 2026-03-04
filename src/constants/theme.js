/**
 * Created by: Kanagaraj P
 * Created on: 01-03-2026
 */
export const COMMON = {
  primary: '#108474',
  primaryDark: '#0a6358',
  secondary: '#D4A373',
  accent: '#E76F51',
  star: '#F59E0B',
  badge: '#EF4444',
};

export const LIGHT_THEME = {
  ...COMMON,
  background: '#FAFAFA',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  inputBg: '#F3F4F6',
  headerBg: '#FFFFFF',
  drawerBg: '#FFFFFF',
  overlay: 'rgba(0,0,0,0.5)',
  shadowColor: '#000',
  statusBar: 'dark-content',
  isDark: false,
};

export const DARK_THEME = {
  ...COMMON,
  background: '#121212',
  surface: '#1E1E1E',
  card: '#252525',
  text: '#F5F5F5',
  textSecondary: '#9CA3AF',
  border: '#333333',
  inputBg: '#2A2A2A',
  headerBg: '#1E1E1E',
  drawerBg: '#1A1A1A',
  overlay: 'rgba(0,0,0,0.7)',
  shadowColor: '#000',
  statusBar: 'light-content',
  isDark: true,
};

export const SIZES = {
  padding: 16,
  radius: 12,
  iconSize: 24,
  maxWidth: 1200,
};
