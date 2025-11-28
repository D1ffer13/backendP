// frontend/src/services/paymentService.js

import api from './api';

export const paymentService = {
  getAll: async (filters = {}) => {
    const response = await api.get('/payments', { params: filters });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  },

  create: async (paymentData) => {
    const response = await api.post('/payments', paymentData);
    return response.data;
  },

  update: async (id, paymentData) => {
    const response = await api.put(`/payments/${id}`, paymentData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/payments/${id}`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/payments/stats');
    return response.data;
  },

  getStudentPayments: async (studentId) => {
    const response = await api.get(`/payments/student/${studentId}`);
    return response.data;
  }
};
