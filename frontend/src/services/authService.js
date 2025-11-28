// frontend/src/services/authService.js
import api from './api';

const TOKEN_KEY = 'authToken';
const USER_KEY = 'authUser';

export const authService = {
  async register(data) {
    const res = await api.post('/auth/register', data);
    const { token, user } = res.data;
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
    return res.data;
  },

  async login(data) {
    const res = await api.post('/auth/login', data);
    const { token, user } = res.data;
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
    return res.data;
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  async getCurrentUser() {
    const cached = localStorage.getItem(USER_KEY);
    if (cached) {
      return JSON.parse(cached);
    }
    const res = await api.get('/auth/me');
    const user = res.data;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return user;
  }
};
