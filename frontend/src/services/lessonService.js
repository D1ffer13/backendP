// frontend/src/services/lessonService.js
import api from './api';

export const lessonService = {
  getAll: async (filters = {}) => {
    const response = await api.get('/lessons', { params: filters });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/lessons/${id}`);
    return response.data;
  },

  create: async (lessonData) => {
    const response = await api.post('/lessons', lessonData);
    return response.data;
  },

  update: async (id, lessonData) => {
    const response = await api.put(`/lessons/${id}`, lessonData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/lessons/${id}`);
    return response.data;
  },

  getWeekSchedule: async (startDate) => {
    const response = await api.get('/lessons/week', {
      params: { start_date: startDate }
    });
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/lessons/stats');
    return response.data;
  }
};
