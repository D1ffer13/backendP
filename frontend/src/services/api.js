import axios from 'axios';
import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://backendp-production.up.railway.app';

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
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
