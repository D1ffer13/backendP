// backend/routes/teachers.js
const express = require('express');
const { authenticate } = require('../middleware/auth');
const {
  getAllTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getTeacherSubjects,
  setTeacherSubjects,
  getTeacherGroups
} = require('../controllers/teachersController');

const router = express.Router();

router.use(authenticate);

router.get('/', getAllTeachers);
router.get('/:id', getTeacherById);
router.post('/', createTeacher);
router.put('/:id', updateTeacher);
router.delete('/:id', deleteTeacher);

router.get('/:id/subjects', getTeacherSubjects);
router.post('/:id/subjects', setTeacherSubjects);
router.get('/:id/groups', getTeacherGroups);

module.exports = router;
