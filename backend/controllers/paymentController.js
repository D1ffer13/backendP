// backend/controllers/paymentController.js

const db = require('../config/db');

// Получить все платежи
const getAllPayments = async (req, res) => {
  try {
    const { student_id, status, start_date, end_date } = req.query;
    const user = req.user;
    
    let query = `
      SELECT 
        p.*,
        s.first_name as student_first_name,
        s.last_name as student_last_name,
        s.middle_name as student_middle_name,
        l.subject as lesson_subject,
        l.lesson_date,
        t.first_name as teacher_first_name,
        t.last_name as teacher_last_name
      FROM payments p
      JOIN students s ON p.student_id = s.id
      LEFT JOIN lessons l ON p.lesson_id = l.id
      LEFT JOIN teachers t ON l.teacher_id = t.id
      WHERE 1=1
    `;
    
    const params = [];

    // 🔐 Фильтрация по роли учителя
    if (user.role === 'teacher' && user.teacher_id) {
      query += ' AND l.teacher_id = ?';
      params.push(user.teacher_id);
    }

    if (student_id) {
      query += ' AND p.student_id = ?';
      params.push(student_id);
    }

    if (status) {
      query += ' AND p.status = ?';
      params.push(status);
    }

    if (start_date) {
      query += ' AND p.payment_date >= ?';
      params.push(start_date);
    }

    if (end_date) {
      query += ' AND p.payment_date <= ?';
      params.push(end_date);
    }

    query += ' ORDER BY p.payment_date DESC';

    const [payments] = await db.query(query, params);
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
};

// Получить платеж по ID
const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [payments] = await db.query(
      `SELECT 
        p.*,
        s.first_name as student_first_name,
        s.last_name as student_last_name,
        s.phone as student_phone,
        l.subject as lesson_subject,
        l.lesson_date
       FROM payments p
       JOIN students s ON p.student_id = s.id
       LEFT JOIN lessons l ON p.lesson_id = l.id
       WHERE p.id = ?`,
      [id]
    );
    
    if (payments.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    res.json(payments[0]);
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({ error: 'Failed to fetch payment' });
  }
};

// Создать платеж
const createPayment = async (req, res) => {
  try {
    const {
      student_id,
      lesson_id,
      amount,
      payment_date,
      payment_method,
      status,
      notes
    } = req.body;

    if (!student_id || !amount || !payment_date) {
      return res.status(400).json({ 
        error: 'Student ID, amount, and payment date are required' 
      });
    }

    // Проверка существования студента
    const [student] = await db.query('SELECT * FROM students WHERE id = ?', [student_id]);
    if (student.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Проверка существования занятия (если указано)
    if (lesson_id) {
      const [lesson] = await db.query('SELECT * FROM lessons WHERE id = ?', [lesson_id]);
      if (lesson.length === 0) {
        return res.status(404).json({ error: 'Lesson not found' });
      }
    }

    const [result] = await db.query(
      `INSERT INTO payments 
       (student_id, lesson_id, amount, payment_date, payment_method, status, notes) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        student_id,
        lesson_id || null,
        amount,
        payment_date,
        payment_method || 'cash',
        status || 'completed',
        notes || null
      ]
    );

    const [newPayment] = await db.query(
      `SELECT 
        p.*,
        s.first_name as student_first_name,
        s.last_name as student_last_name,
        l.subject as lesson_subject
       FROM payments p
       JOIN students s ON p.student_id = s.id
       LEFT JOIN lessons l ON p.lesson_id = l.id
       WHERE p.id = ?`,
      [result.insertId]
    );

    res.status(201).json(newPayment[0]);
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
};

// Обновить платеж
const updatePayment = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      student_id,
      lesson_id,
      amount,
      payment_date,
      payment_method,
      status,
      notes
    } = req.body;

    const [existing] = await db.query('SELECT * FROM payments WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    await db.query(
      `UPDATE payments 
       SET student_id = ?, lesson_id = ?, amount = ?, payment_date = ?, 
           payment_method = ?, status = ?, notes = ?
       WHERE id = ?`,
      [
        student_id,
        lesson_id || null,
        amount,
        payment_date,
        payment_method,
        status,
        notes || null,
        id
      ]
    );

    const [updatedPayment] = await db.query(
      `SELECT 
        p.*,
        s.first_name as student_first_name,
        s.last_name as student_last_name,
        l.subject as lesson_subject
       FROM payments p
       JOIN students s ON p.student_id = s.id
       LEFT JOIN lessons l ON p.lesson_id = l.id
       WHERE p.id = ?`,
      [id]
    );

    res.json(updatedPayment[0]);
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ error: 'Failed to update payment' });
  }
};

// Удалить платеж (только админ)
const deletePayment = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query('SELECT * FROM payments WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    await db.query('DELETE FROM payments WHERE id = ?', [id]);
    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error('Error deleting payment:', error);
    res.status(500).json({ error: 'Failed to delete payment' });
  }
};

// Получить платежи студента
const getStudentPayments = async (req, res) => {
  try {
    const { student_id } = req.params;

    const [payments] = await db.query(
      `SELECT 
        p.*,
        l.subject as lesson_subject,
        l.lesson_date
       FROM payments p
       LEFT JOIN lessons l ON p.lesson_id = l.id
       WHERE p.student_id = ?
       ORDER BY p.payment_date DESC`,
      [student_id]
    );

    res.json(payments);
  } catch (error) {
    console.error('Error fetching student payments:', error);
    res.status(500).json({ error: 'Failed to fetch student payments' });
  }
};

// Получить статистику платежей
const getPaymentStats = async (req, res) => {
  try {
    const user = req.user;
    
    let whereClause = '';
    const params = [];

    // Фильтрация по роли учителя
    if (user.role === 'teacher' && user.teacher_id) {
      whereClause = `
        JOIN lessons l ON p.lesson_id = l.id 
        WHERE l.teacher_id = ?
      `;
      params.push(user.teacher_id);
    }

    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total_payments,
        SUM(CASE WHEN p.status = 'completed' THEN p.amount ELSE 0 END) as total_amount,
        SUM(CASE WHEN p.status = 'pending' THEN p.amount ELSE 0 END) as pending_amount,
        SUM(CASE WHEN p.status = 'cancelled' THEN p.amount ELSE 0 END) as cancelled_amount,
        SUM(CASE WHEN p.payment_date >= CURDATE() - INTERVAL 30 DAY THEN p.amount ELSE 0 END) as amount_last_month
      FROM payments p
      ${whereClause}
    `, params);

    res.json(stats[0]);
  } catch (error) {
    console.error('Error fetching payment stats:', error);
    res.status(500).json({ error: 'Failed to fetch payment statistics' });
  }
};

module.exports = {
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment,
  getStudentPayments,
  getPaymentStats
};
