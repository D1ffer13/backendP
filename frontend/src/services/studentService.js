// frontend/src/services/studentService.js
import api from './api';
import { parseStudentsExcel } from '../utils/excelParser';

export const studentService = {
  // получить всех студентов
  async getAll() {
    const res = await api.get('/students');
    // гарантируем массив, чтобы не падать в .sort()
    return Array.isArray(res.data) ? res.data : [];
  },

  // поиск
  async search(query) {
    const res = await api.get('/students/search', {
      params: { q: query }
    });
    return Array.isArray(res.data) ? res.data : [];
  },

  // получить одного
  async getById(id) {
    const res = await api.get(`/students/${id}`);
    return res.data;
  },

  // создать
  async create(data) {
    const res = await api.post('/students', data);
    return res.data;
  },

  // обновить
  async update(id, data) {
    const res = await api.put(`/students/${id}`, data);
    return res.data;
  },

  // удалить
  async delete(id) {
    const res = await api.delete(`/students/${id}`);
    return res.data;
  },

  // импорт массива учеников
  async import(list) {
    const res = await api.post('/students/import', list);
    return res.data;
  },

  // импорт из Excel‑файла
  async importFromExcel(file) {
    const students = await parseStudentsExcel(file);

    const valid = Array.isArray(students)
      ? students.filter((s) => s.first_name && s.last_name)
      : [];

    if (valid.length === 0) {
      return {
        message: 'Нет валидных учеников в файле',
        imported: 0,
        errors: 0,
        errorDetails: []
      };
    }

    const res = await this.import(valid);
    return res; // backend уже возвращает { imported, errors, ... }
  }
};
