import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://backendp-production.up.railway.app';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: false,
});

// Interceptor для добавления токена
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');  // ✅ Прямое обращение к localStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
