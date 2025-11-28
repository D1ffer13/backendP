// backend/routes/attendance.js
const express = require('express');
const { authenticate } = require('../middleware/auth');
const {
  getLessonsForDate,
  getLessonAttendance,
  updateEnrollmentStatus,
  addStudentToLesson,
  rescheduleLesson
} = require('../controllers/attendanceController');

const router = express.Router();

router.use(authenticate);

// список уроков по дате + фильтры
router.get('/lessons', getLessonsForDate);

// подробная информация об одном уроке (для правой части страницы)
router.get('/lessons/:id', getLessonAttendance);

// обновить статус посещаемости записи
router.put('/enrollments/:id', updateEnrollmentStatus);

// добавить ученика на урок (только если он в группе)
router.post('/lessons/:lessonId/add-student', addStudentToLesson);

// перенести урок
router.put('/lessons/:id/reschedule', rescheduleLesson);

module.exports = router;
