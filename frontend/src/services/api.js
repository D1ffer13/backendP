// frontend/src/services/api.js
import axios from 'axios';
import { authService } from './authService';

// Базовый URL API:
// - в продакшене на Railway берём из VITE_API_BASE_URL
// - локально (vite dev) по умолчанию используем localhost:5000/api
const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL &&
    // убираем лишний слэш в конце, если вдруг есть
    import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '')) ||
  'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = authService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
