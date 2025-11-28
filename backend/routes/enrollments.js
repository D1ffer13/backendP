// backend/routes/enrollments.js

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getAllEnrollments,
  getEnrollmentById,
  createEnrollment,
  updateEnrollment,
  deleteEnrollment
} = require('../controllers/enrollmentController');

// ВСЕ роуты требуют авторизации
router.use(authenticate);

router.get('/', getAllEnrollments);
router.get('/:id', getEnrollmentById);
router.post('/', createEnrollment);
router.put('/:id', updateEnrollment);
router.delete('/:id', deleteEnrollment);

module.exports = router;
