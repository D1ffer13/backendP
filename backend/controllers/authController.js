// backend/controllers/authController.js
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const JWT_EXPIRES_IN = '7d';

// Создание JWT
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      teacher_id: user.teacher_id
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// POST /api/auth/register
// Регистрируем ОДИН аккаунт центра (админ)
const register = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'Заполните все поля' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Пароли не совпадают' });
    }

    // Проверка: есть ли уже пользователь в users
    const [countRows] = await db.query('SELECT COUNT(*) AS cnt FROM users');
    if (countRows[0].cnt > 0) {
      return res.status(400).json({
        message: 'Аккаунт уже создан. Можно зарегистрировать только один центр.'
      });
    }

    // Проверка email на существование
    const [existing] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );
    if (existing.length > 0) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Создаём пользователя-админа центра
    const [result] = await db.query(
      `INSERT INTO users (email, password_hash, role, teacher_id, is_active)
       VALUES (?, ?, 'admin', NULL, 1)`,
      [email, passwordHash]
    );

    const user = {
      id: result.insertId,
      email,
      role: 'admin',
      teacher_id: null
    };

    const token = generateToken(user);

    res.status(201).json({
      user,
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Ошибка при регистрации' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Введите email и пароль' });
    }

    const [rows] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    const userRow = rows[0];

    if (!userRow) {
      return res.status(400).json({ message: 'Неверный email или пароль' });
    }

    if (userRow.is_active === 0) {
      return res.status(403).json({ message: 'Аккаунт неактивен' });
    }

    const isMatch = await bcrypt.compare(password, userRow.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Неверный email или пароль' });
    }

    // обновим last_login
    await db.query(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [userRow.id]
    );

    const user = {
      id: userRow.id,
      email: userRow.email,
      role: userRow.role,
      teacher_id: userRow.teacher_id
    };

    const token = generateToken(user);

    res.json({
      user,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Ошибка при входе' });
  }
};

// GET /api/auth/me
const getCurrentUser = async (req, res) => {
  try {
    const { id } = req.user;

    const [rows] = await db.query(
      'SELECT id, email, role, teacher_id, is_active, created_at, updated_at, last_login FROM users WHERE id = ?',
      [id]
    );
    const user = rows[0];

    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    res.json(user);
  } catch (error) {
    console.error('GetCurrentUser error:', error);
    res.status(500).json({ message: 'Ошибка при получении пользователя' });
  }
};

// POST /api/auth/change-password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    const { id } = req.user;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      return res.status(400).json({ message: 'Заполните все поля' });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({ message: 'Новые пароли не совпадают' });
    }

    const [rows] = await db.query(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    const userRow = rows[0];

    if (!userRow) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }

    const isMatch = await bcrypt.compare(currentPassword, userRow.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Текущий пароль неверный' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await db.query(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [passwordHash, id]
    );

    res.json({ message: 'Пароль успешно изменён' });
  } catch (error) {
    console.error('ChangePassword error:', error);
    res.status(500).json({ message: 'Ошибка при смене пароля' });
  }
};

// POST /api/auth/logout
const logout = async (req, res) => {
  // Токен хранится на фронте, тут просто отвечаем успехом
  res.json({ message: 'Выход выполнен' });
};

module.exports = {
  register,
  login,
  getCurrentUser,
  changePassword,
  logout
};
