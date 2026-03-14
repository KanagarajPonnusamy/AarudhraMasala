/**
 * Created by: Kanagaraj P
 * Created on: 01-03-2026
 */
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ---------- Constants ----------


const PRODUCTION_URL = 'https://www.aarudhramasala.com';
const BASE_URL = PRODUCTION_URL;
const APP_ID = 'APP-REG-WEB';

// API Endpoints
const ENDPOINTS = {
  ADMIN_LOGIN: `am/auth/sites/v1/validate/gettoken/${APP_ID}`,
  VALIDATE_USER: `/api/am/users/v1/validateUser`, // GET /{email}/{password}
  REGISTER_USER: `/api/am/users/v1/registerUser/${APP_ID}`, // POST
  FETCH_USER: `/api/am/users/v1/fetchUserDetails/${APP_ID}`, // GET /{userId}
  LOGOUT_USER: `/api/am/users/v1/logoutUser/${APP_ID}`, // GET /{email}/{token}
  FETCH_PRODUCTS: `/api/am/products/v1/fetchProducts/${APP_ID}`, // GET
  FETCH_HOME_PRODUCTS: `/api/am/products/v1/fetchHomeProductsList/${APP_ID}`, // GET
  ADD_PRODUCT: `/api/am/products/v1/addProduct/${APP_ID}`, // POST
  PLACE_ORDER: `/api/am/orders/v1/orderProducts`, // POST /{userid}/{APP_ID}
  FETCH_ORDERS: `/api/am/orders/v1/fetchOrders`, // GET /{userid}/{APP_ID}
  FETCH_PRODUCTS_BY_CODE: `/api/am/products/v1/fetchProductsByCode/${APP_ID}`, // GET /{code}
  FETCH_PRODUCT: `/api/am/products/v1/fetchProduct`, // GET /{id}/{APP_ID}
};

// Storage Keys
const STORAGE_KEYS = {
  ADMIN_TOKEN: '@admin_token',
  USER_DATA: '@user_data',
  USER_TOKEN: '@user_token',
};

// Admin Credentials
const ADMIN_CREDENTIALS = {
  username: 'aarudhra_public_token_user',
  password: 'AarudhraPublicToken@2026',
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

// Track whether admin token changed (signals user should re-login)
let _adminTokenChanged = false;

export function isAdminTokenChanged() {
  return _adminTokenChanged;
}

export function resetAdminTokenChanged() {
  _adminTokenChanged = false;
}

// On 403 or 500, refresh admin token and retry once
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    if (
      (status === 403 || status === 500) &&
      !originalRequest._retry &&
      !originalRequest.url?.includes(ENDPOINTS.ADMIN_LOGIN)
    ) {
      originalRequest._retry = true;
      console.log(`[API] ${status} received, refreshing admin token...`);
      await AsyncStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
      try {
        const storedUser = await getStoredUser();
        const userId = storedUser?.user_id || storedUser?.id;
        const newToken = await fetchAdminToken(userId);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (tokenError) {
        console.log('[API] Admin token refresh failed — user should re-login');
        _adminTokenChanged = true;
        return Promise.reject(tokenError);
      }
    }
    return Promise.reject(error);
  }
);

// ---------- Admin Token ----------

async function fetchAdminToken(userId) {
  console.log('[API] Fetching admin token...', userId ? `with userId: ${userId}` : '(no user)');
  const payload = { ...ADMIN_CREDENTIALS };
  if (userId) {
    payload.user_id = String(userId);
  }
  const response = await api.post(ENDPOINTS.ADMIN_LOGIN, payload);
  console.log('[API] Admin login response:', JSON.stringify(response.data));

  const token = response.data?.token || response.data;
  if (token) {
    await AsyncStorage.setItem(STORAGE_KEYS.ADMIN_TOKEN, String(token));
    console.log('[API] Admin token saved');
  }
  return String(token);
}

// Use cached admin token if available; only fetch when missing
export async function getAdminToken(userId) {
  const cached = await AsyncStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
  if (cached) {
    console.log('[API] Using cached admin token');
    return cached;
  }
  console.log('[API] No cached token, fetching fresh admin token...');
  return fetchAdminToken(userId);
}

// Force re-fetch admin token with user-id (call after login)
export async function refreshAdminTokenForUser(userId) {
  console.log('[API] Refreshing admin token for logged-in user:', userId);
  await AsyncStorage.removeItem(STORAGE_KEYS.ADMIN_TOKEN);
  return fetchAdminToken(userId);
}

async function ensureAdminToken() {
  let token = await AsyncStorage.getItem(STORAGE_KEYS.ADMIN_TOKEN);
  if (!token) {
    const storedUser = await getStoredUser();
    const userId = storedUser?.user_id || storedUser?.id;
    token = await fetchAdminToken(userId);
  }
  return token;
}

// ---------- Auth ----------

export async function loginUser(email, password) {
  await ensureAdminToken();
  console.log('[API] User login with:', email);
  const response = await api.get(
    `${ENDPOINTS.VALIDATE_USER}/${encodeURIComponent(email)}/${encodeURIComponent(password)}/${APP_ID}`
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

export async function fetchHomeProducts() {
  await ensureAdminToken();
  const response = await api.get(ENDPOINTS.FETCH_HOME_PRODUCTS);
  return response.data;
}

export async function addProduct(product) {
  await ensureAdminToken();
  const response = await api.post(ENDPOINTS.ADD_PRODUCT, product);
  return response.data;
}

export async function fetchProductsByCode(code) {
  await ensureAdminToken();
  const response = await api.get(`${ENDPOINTS.FETCH_PRODUCTS_BY_CODE}/${code}`);
  return response.data;
}

export async function fetchProduct(id) {
  await ensureAdminToken();
  const response = await api.get(`${ENDPOINTS.FETCH_PRODUCT}/${id}/${APP_ID}`);
  return response.data;
}

// ---------- Orders ----------

export async function placeOrderAPI(userid, orderData) {
  await ensureAdminToken();
  console.log('[API] Placing order for userid:', userid);
  const response = await api.post(
    `${ENDPOINTS.PLACE_ORDER}/${userid}/${APP_ID}`,
    orderData
  );
  console.log('[API] Place order response:', JSON.stringify(response.data));
  return response.data;
}

export async function fetchOrdersAPI(userid) {
  await ensureAdminToken();
  console.log('[API] Fetching orders for userid:', userid);
  const response = await api.get(
    `${ENDPOINTS.FETCH_ORDERS}/${userid}/${APP_ID}`
  );
  console.log('[API] Fetch orders response:', JSON.stringify(response.data));
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
