/**
 * Created by: Kanagaraj P
 * Created on: 01-03-2026
 */
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ---------- Constants ----------

const BASE_URL = 'http://www.aarudhramasala.com';
const APP_ID = 'APP-REG-2XXXX';

// API Endpoints
const ENDPOINTS = {
  ADMIN_LOGIN: '/am/auth/login',
  VALIDATE_USER: '/api/am/users/v1/validateUser', // GET /{email}/{password}
  REGISTER_USER: `/api/am/users/v1/registerUser/${APP_ID}`, // POST
  FETCH_USER: '/api/am/users/v1/fetchUserDetails', // GET /{userId}
  LOGOUT_USER: '/api/am/users/v1/logoutUser', // GET /{email}/{token}
  FETCH_PRODUCTS: '/api/am/products/v1/fetchProducts', // GET
  ADD_PRODUCT: '/api/am/products/v1/addProduct', // POST
};

// Storage Keys
const STORAGE_KEYS = {
  ADMIN_TOKEN: '@admin_token',
  USER_DATA: '@user_data',
  USER_TOKEN: '@user_token',
};

// Admin Credentials
const ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'password123',
};

// ---------- Axios Instance ----------

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach Bearer token to every request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 403, refresh admin token and retry once
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 403 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes(ENDPOINTS.ADMIN_LOGIN)
    ) {
      originalRequest._retry = true;
      console.log('[API] 403 received, refreshing admin token...');
      await AsyncStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
      const newToken = await fetchAdminToken();
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    }
    return Promise.reject(error);
  }
);

// ---------- Admin Token ----------

async function fetchAdminToken() {
  console.log('[API] Fetching admin token...');
  const response = await api.post(ENDPOINTS.ADMIN_LOGIN, ADMIN_CREDENTIALS);
  console.log('[API] Admin login response:', JSON.stringify(response.data));

  const token = response.data?.token || response.data;
  if (token) {
    await AsyncStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, String(token));
    console.log('[API] Admin token saved');
  }
  return String(token);
}

export async function getAdminToken() {
  const existing = await AsyncStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
  if (existing) {
    console.log('[API] Using existing admin token');
    return existing;
  }
  return fetchAdminToken();
}

async function ensureAdminToken() {
  let token = await AsyncStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
  if (!token) {
    token = await fetchAdminToken();
  }
  return token;
}

// ---------- Auth ----------

export async function loginUser(email, password) {
  await ensureAdminToken();
  console.log('[API] User login with:', email);
  const response = await api.get(
    `${ENDPOINTS.VALIDATE_USER}/${encodeURIComponent(email)}/${encodeURIComponent(password)}`
  );
  console.log('[API] Login response:', JSON.stringify(response.data));
  const userToken = response.data?.token;
  if (userToken) {
    await AsyncStorage.setItem(STORAGE_KEYS.USER_TOKEN, String(userToken));
    console.log('[API] User token saved');
  }
  return response.data;
}

export async function logoutUser(email) {
  await ensureAdminToken();
  const userToken = await AsyncStorage.getItem(STORAGE_KEYS.USER_TOKEN);
  console.log('[API] Logging out:', email);
  const response = await api.get(
    `${ENDPOINTS.LOGOUT_USER}/${encodeURIComponent(email)}/${encodeURIComponent(userToken || '')}`
  );
  console.log('[API] Logout response:', JSON.stringify(response.data));
  return response.data;
}

export async function registerUser(data) {
  await ensureAdminToken();
  console.log('[API] Register payload:', JSON.stringify(data));
  const response = await api.post(ENDPOINTS.REGISTER_USER, {
    firstname: data.firstName,
    lastname: data.lastName,
    email: data.email,
    phone_no: data.phone,
    password: data.password,
    confirm_pwd: data.confirmPassword,
    usertype: 'end-user',
  });
  console.log('[API] Register response:', JSON.stringify(response.data));
  return response.data;
}

export async function fetchUserDetails(userId) {
  await ensureAdminToken();
  const response = await api.get(`${ENDPOINTS.FETCH_USER}/${userId}`);
  return response.data;
}

// ---------- Products ----------

export async function fetchProducts() {
  await ensureAdminToken();
  const response = await api.get(ENDPOINTS.FETCH_PRODUCTS);
  return response.data;
}

export async function addProduct(product) {
  await ensureAdminToken();
  const response = await api.post(ENDPOINTS.ADD_PRODUCT, product);
  return response.data;
}

// ---------- Local Storage Helpers ----------

export async function saveUser(user) {
  await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
}

export async function getStoredUser() {
  const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
  return data ? JSON.parse(data) : null;
}

export async function clearUser() {
  await AsyncStorage.multiRemove([STORAGE_KEYS.USER_DATA, STORAGE_KEYS.USER_TOKEN]);
}
