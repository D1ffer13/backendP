// frontend/src/services/teacherService.js
import api from './api';

export const teacherService = {
  async getAll() {
    const res = await api.get('/teachers');
    return res.data;
  },

  async getById(id) {
    const res = await api.get(`/teachers/${id}`);
    return res.data;
  },

  async create(data) {
    const res = await api.post('/teachers', data);
    return res.data;
  },

  async update(id, data) {
    const res = await api.put(`/teachers/${id}`, data);
    return res.data;
  },

  async delete(id) {
    const res = await api.delete(`/teachers/${id}`);
    return res.data;
  },

  async getSubjects(teacherId) {
    const res = await api.get(`/teachers/${teacherId}/subjects`);
    return res.data;
  },

  async setSubjects(teacherId, subjectIds) {
    const res = await api.post(`/teachers/${teacherId}/subjects`, {
      subject_ids: subjectIds
    });
    return res.data;
  },

  async getGroups(teacherId) {
    const res = await api.get(`/teachers/${teacherId}/groups`);
    return res.data;
  }
};
