import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// TTL-based In-Memory Cache Engine (5 Minutes TTL)
const cacheStore = new Map();
const CACHE_TTL = 5 * 60 * 1000;

export const cachedFetch = async (url, options = {}) => {
  const forceRefresh = options.forceRefresh || false;
  const now = Date.now();

  if (!forceRefresh && cacheStore.has(url)) {
    const { timestamp, data } = cacheStore.get(url);
    if (now - timestamp < CACHE_TTL) {
      return data;
    }
  }

  const response = await api.get(url);
  cacheStore.set(url, { timestamp: now, data: response.data });
  return response.data;
};

export const clearApiCache = (urlKey = null) => {
  if (urlKey) {
    cacheStore.delete(urlKey);
  } else {
    cacheStore.clear();
  }
};

export default api;