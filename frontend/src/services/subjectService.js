// frontend/src/services/subjectService.js
import api from './api';

export const subjectService = {
  async getAll() {
    const res = await api.get('/subjects');
    return res.data;
  }
};
