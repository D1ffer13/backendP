// backend/routes/lessons.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getAllLessons,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
  getWeekSchedule,
  getLessonStats
} = require('../controllers/lessonController');

router.use(authenticate);

router.get('/stats', getLessonStats);
router.get('/week', getWeekSchedule);
router.get('/', getAllLessons);
router.get('/:id', getLessonById);
router.post('/', createLesson);
router.put('/:id', updateLesson);
router.delete('/:id', deleteLesson);

module.exports = router;
