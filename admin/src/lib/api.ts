import axios from 'axios';
import Cookies from 'js-cookie';

export const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL as string ?? 'http://localhost:4000') + '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('adminToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      Cookies.remove('adminToken');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);
