// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

// Проверка токена
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token) {
    return res.status(401).json({ message: 'Нет токена' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded: { id, email, name }
    req.user = decoded;
    next();
  } catch (error) {
    console.error('JWT error:', error);
    return res.status(401).json({ message: 'Неверный или истёкший токен' });
  }
};

module.exports = { authenticate };
