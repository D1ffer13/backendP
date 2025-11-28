// backend/routes/students.js
const express = require('express');
const { authenticate } = require('../middleware/auth');
const {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  importStudents,
  searchStudents
} = require('../controllers/studentController');

const router = express.Router();

router.use(authenticate);

router.get('/', getAllStudents);
router.get('/search', searchStudents);

// импорт учеников из Excel/массива
router.post('/import', importStudents);

router.get('/:id', getStudentById);
router.post('/', createStudent);
router.put('/:id', updateStudent);
router.delete('/:id', deleteStudent);

module.exports = router;
