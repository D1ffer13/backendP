
// backend/config/db.js

const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'mysql.railway.internal',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'xtFBfIsguBZFCHUZtkGoaAjVaPHhZKoP',
  database: process.env.DB_NAME || 'railway',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  // ВАЖНО: отключаем автоматическую конвертацию дат в UTC
  timezone: '+00:00',
  dateStrings: true // Возвращаем даты как строки
});

// Промисифицируем pool
const promisePool = pool.promise();

module.exports = promisePool;
