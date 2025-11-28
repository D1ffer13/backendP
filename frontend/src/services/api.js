// frontend/src/services/api.js
import axios from 'axios';
import { authService } from './authService';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: false
});

api.interceptors.request.use((config) => {
  const token = authService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
