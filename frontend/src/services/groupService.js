// frontend/src/services/groupService.js
import api from './api';

export const groupService = {
  async getAll(params = {}) {
    const res = await api.get('/groups', { params });
    return res.data;
  },

  async create(data) {
    const res = await api.post('/groups', data);
    return res.data;
  },

  async update(id, data) {
    const res = await api.put(`/groups/${id}`, data);
    return res.data;
  },

  async delete(id) {
    const res = await api.delete(`/groups/${id}`);
    return res.data;
  },

  async getStudents(groupId) {
    const res = await api.get(`/groups/${groupId}/students`);
    return res.data;
  },

  async setStudents(groupId, studentIds) {
    const res = await api.post(`/groups/${groupId}/students`, {
      student_ids: studentIds
    });
    return res.data;
  }
};
