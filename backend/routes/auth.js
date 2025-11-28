// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  register,
  login,
  getCurrentUser,
  changePassword,
  logout
} = require('../controllers/authController');

// Регистрация (один аккаунт центра)
router.post('/register', register);

// Вход
router.post('/login', login);

// Текущий пользователь
router.get('/me', authenticate, getCurrentUser);

// Смена пароля
router.post('/change-password', authenticate, changePassword);

// Выход
router.post('/logout', authenticate, logout);

module.exports = router;
