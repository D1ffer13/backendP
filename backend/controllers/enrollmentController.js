// backend/controllers/enrollmentController.js

const db = require('../config/db');

// Получить все записи
const getAllEnrollments = async (req, res) => {
  try {
    const { lesson_id, student_id, status } = req.query;
    const user = req.user; // Получаем пользователя из middleware
    
    let query = `
      SELECT 
        e.*,
        s.first_name as student_first_name,
        s.last_name as student_last_name,
        s.middle_name as student_middle_name,
        s.phone as student_phone,
        l.subject as lesson_subject,
        l.lesson_date,
        l.start_time,
        l.end_time,
        t.first_name as teacher_first_name,
        t.last_name as teacher_last_name
      FROM enrollments e
      JOIN students s ON e.student_id = s.id
      JOIN lessons l ON e.lesson_id = l.id
      JOIN teachers t ON l.teacher_id = t.id
      WHERE 1=1
    `;
    
    const params = [];

    // 🔐 Фильтрация по роли учителя
    if (user.role === 'teacher' && user.teacher_id) {
      query += ' AND l.teacher_id = ?';
      params.push(user.teacher_id);
    }

    if (lesson_id) {
      query += ' AND e.lesson_id = ?';
      params.push(lesson_id);
    }

    if (student_id) {
      query += ' AND e.student_id = ?';
      params.push(student_id);
    }

    if (status) {
      query += ' AND e.status = ?';
      params.push(status);
    }

    query += ' ORDER BY e.enrollment_date DESC';

    const [enrollments] = await db.query(query, params);
    res.json(enrollments);
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    res.status(500).json({ error: 'Failed to fetch enrollments' });
  }
};

// Получить запись по ID
const getEnrollmentById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [enrollments] = await db.query(
      `SELECT 
        e.*,
        s.first_name as student_first_name,
        s.last_name as student_last_name,
        s.phone as student_phone,
        l.subject as lesson_subject,
        l.lesson_date,
        l.start_time
       FROM enrollments e
       JOIN students s ON e.student_id = s.id
       JOIN lessons l ON e.lesson_id = l.id
       WHERE e.id = ?`,
      [id]
    );
    
    if (enrollments.length === 0) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }
    
    res.json(enrollments[0]);
  } catch (error) {
    console.error('Error fetching enrollment:', error);
    res.status(500).json({ error: 'Failed to fetch enrollment' });
  }
};

// Создать запись на занятие
const createEnrollment = async (req, res) => {
  try {
    const { lesson_id, student_id } = req.body;

    if (!lesson_id || !student_id) {
      return res.status(400).json({ 
        error: 'Lesson ID and Student ID are required' 
      });
    }

    // Проверка существования ученика
    const [student] = await db.query('SELECT * FROM students WHERE id = ?', [student_id]);
    if (student.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    // Проверка существования занятия
    const [lesson] = await db.query(
      `SELECT l.*, 
        (SELECT COUNT(*) FROM enrollments WHERE lesson_id = l.id AND status = 'enrolled') as enrolled_count
       FROM lessons l 
       WHERE l.id = ?`,
      [lesson_id]
    );
    
    if (lesson.length === 0) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    // Проверка на дублирование записи
    const [existing] = await db.query(
      'SELECT * FROM enrollments WHERE lesson_id = ? AND student_id = ? AND status = "enrolled"',
      [lesson_id, student_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({ 
        error: 'Student is already enrolled in this lesson' 
      });
    }

    // Проверка на превышение лимита учеников
    if (lesson[0].enrolled_count >= lesson[0].max_students) {
      return res.status(400).json({ 
        error: 'Lesson is full. Maximum students limit reached.' 
      });
    }

    const [result] = await db.query(
      'INSERT INTO enrollments (lesson_id, student_id, status) VALUES (?, ?, ?)',
      [lesson_id, student_id, 'enrolled']
    );

    const [newEnrollment] = await db.query(
      `SELECT 
        e.*,
        s.first_name as student_first_name,
        s.last_name as student_last_name,
        l.subject as lesson_subject,
        l.lesson_date
       FROM enrollments e
       JOIN students s ON e.student_id = s.id
       JOIN lessons l ON e.lesson_id = l.id
       WHERE e.id = ?`,
      [result.insertId]
    );

    res.status(201).json(newEnrollment[0]);
  } catch (error) {
    console.error('Error creating enrollment:', error);
    res.status(500).json({ error: 'Failed to create enrollment' });
  }
};

// Обновить запись (изменить статус)
const updateEnrollment = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const [existing] = await db.query('SELECT * FROM enrollments WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    await db.query(
      'UPDATE enrollments SET status = ? WHERE id = ?',
      [status, id]
    );

    const [updatedEnrollment] = await db.query(
      `SELECT 
        e.*,
        s.first_name as student_first_name,
        s.last_name as student_last_name,
        l.subject as lesson_subject,
        l.lesson_date
       FROM enrollments e
       JOIN students s ON e.student_id = s.id
       JOIN lessons l ON e.lesson_id = l.id
       WHERE e.id = ?`,
      [id]
    );

    res.json(updatedEnrollment[0]);
  } catch (error) {
    console.error('Error updating enrollment:', error);
    res.status(500).json({ error: 'Failed to update enrollment' });
  }
};

// Удалить запись
const deleteEnrollment = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query('SELECT * FROM enrollments WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    await db.query('DELETE FROM enrollments WHERE id = ?', [id]);
    res.json({ message: 'Enrollment deleted successfully' });
  } catch (error) {
    console.error('Error deleting enrollment:', error);
    res.status(500).json({ error: 'Failed to delete enrollment' });
  }
};

// Получить записи ученика
const getStudentEnrollments = async (req, res) => {
  try {
    const { student_id } = req.params;

    const [enrollments] = await db.query(
      `SELECT 
        e.*,
        l.subject,
        l.lesson_date,
        l.start_time,
        l.end_time,
        l.status as lesson_status,
        t.first_name as teacher_first_name,
        t.last_name as teacher_last_name
       FROM enrollments e
       JOIN lessons l ON e.lesson_id = l.id
       JOIN teachers t ON l.teacher_id = t.id
       WHERE e.student_id = ?
       ORDER BY l.lesson_date DESC`,
      [student_id]
    );

    res.json(enrollments);
  } catch (error) {
    console.error('Error fetching student enrollments:', error);
    res.status(500).json({ error: 'Failed to fetch student enrollments' });
  }
};

module.exports = {
  getAllEnrollments,
  getEnrollmentById,
  createEnrollment,
  updateEnrollment,  // ✅ Экспортируем updateEnrollment вместо cancelEnrollment
  deleteEnrollment,
  getStudentEnrollments
};
