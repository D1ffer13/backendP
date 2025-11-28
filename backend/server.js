// backend/server.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const db = require('./config/db');

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Frontend URL
  credentials: true
}));

// УВЕЛИЧЕННЫЙ ЛИМИТ ДЛЯ ТЕЛА ЗАПРОСА (важно для импорта)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use(cookieParser());

// Проверка подключения к БД
db.query('SELECT 1')
  .then(() => console.log('✅ Database connected'))
  .catch(err => console.error('❌ Database connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/teachers', require('./routes/teachers'));
app.use('/api/lessons', require('./routes/lessons'));
app.use('/api/enrollments', require('./routes/enrollments'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/users', require('./routes/users'));
app.use('/api/subjects', require('./routes/subjects'));
app.use('/api/groups', require('./routes/groups'));


// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 API docs: http://localhost:${PORT}/api`);
});
