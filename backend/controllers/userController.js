// backend/controllers/userController.js

const bcrypt = require('bcryptjs');
const db = require('../config/db');

// Получить всех пользователей
const getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(`
      SELECT 
        u.id,
        u.email,
        u.role,
        u.teacher_id,
        u.is_active,
        u.created_at,
        u.last_login,
        t.first_name,
        t.last_name,
        t.middle_name
      FROM users u
      LEFT JOIN teachers t ON u.teacher_id = t.id
      ORDER BY u.created_at DESC
    `);

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Создать пользователя (регистрация через админа)
const createUser = async (req, res) => {
  try {
    const { email, password, role, teacher_id } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email и пароль обязательны' });
    }

    // Проверка существования
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }

    // Хеширование пароля
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Создание
    const [result] = await db.query(
      'INSERT INTO users (email, password_hash, role, teacher_id) VALUES (?, ?, ?, ?)',
      [email, password_hash, role || 'teacher', teacher_id || null]
    );

    const [newUser] = await db.query(
      'SELECT id, email, role, teacher_id, created_at FROM users WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(newUser[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

// Обновить пользователя
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, role, is_active, teacher_id } = req.body;

    await db.query(
      'UPDATE users SET email = ?, role = ?, is_active = ?, teacher_id = ? WHERE id = ?',
      [email, role, is_active, teacher_id, id]
    );

    const [updated] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
    res.json(updated[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

// Удалить пользователя
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser
};
