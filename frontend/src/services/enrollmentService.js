// frontend/src/services/enrollmentService.js

import api from './api';

export const enrollmentService = {
  getAll: async (filters = {}) => {
    const response = await api.get('/enrollments', { params: filters });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/enrollments/${id}`);
    return response.data;
  },

  create: async (enrollmentData) => {
    const response = await api.post('/enrollments', enrollmentData);
    return response.data;
  },

  update: async (id, enrollmentData) => {
    const response = await api.put(`/enrollments/${id}`, enrollmentData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/enrollments/${id}`);
    return response.data;
  }
};
