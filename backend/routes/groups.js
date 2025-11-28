// backend/routes/groups.js
const express = require('express');
const { authenticate } = require('../middleware/auth');
const {
  getGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  getGroupStudents,
  setGroupStudents
} = require('../controllers/groupController');

const router = express.Router();

router.use(authenticate);

router.get('/', getGroups);
router.post('/', createGroup);
router.put('/:id', updateGroup);
router.delete('/:id', deleteGroup);

router.get('/:id/students', getGroupStudents);
router.post('/:id/students', setGroupStudents);

module.exports = router;
