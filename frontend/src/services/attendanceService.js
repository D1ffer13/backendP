// frontend/src/services/attendanceService.js
import api from './api';

export const attendanceService = {
  // уроки по дате + фильтры
  async getLessonsByDate({ date, teacher_id, group_id } = {}) {
    const res = await api.get('/attendance/lessons', {
      params: { date, teacher_id, group_id }
    });
    return res.data;
  },

  // подробности одного урока + ученики с отметками
  async getLessonAttendance(lessonId) {
    const res = await api.get(`/attendance/lessons/${lessonId}`);
    return res.data;
  },

  // смена статуса посещаемости
  async updateEnrollmentStatus(enrollmentId, status) {
    const res = await api.put(`/attendance/enrollments/${enrollmentId}`, {
      status
    });
    return res.data;
  },

  // добавить ученика на урок (только если он в группе)
  async addStudentToLesson(lessonId, studentId) {
    const res = await api.post(
      `/attendance/lessons/${lessonId}/add-student`,
      { student_id: studentId }
    );
    return res.data;
  },

  // перенос урока
  async rescheduleLesson(lessonId, data) {
    // data: { new_date, new_start_time, new_end_time, reason }
    const res = await api.put(
      `/attendance/lessons/${lessonId}/reschedule`,
      data
    );
    return res.data;
  }
};
