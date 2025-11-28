// backend/routes/users.js

const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');

// Все роуты только для админа


router.get('/', getAllUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
