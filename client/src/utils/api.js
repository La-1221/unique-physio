import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Attach bearer token as a fallback (in case cookies are blocked, e.g. some mobile webviews)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('upsc_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
