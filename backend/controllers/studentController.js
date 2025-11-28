// backend/controllers/studentController.js
const db = require('../config/db');

// Получить всех учеников
const getAllStudents = async (req, res) => {
  try {
    // новые ученики (с большими id) идут первыми
    const [students] = await db.query(
      'SELECT * FROM students ORDER BY id DESC'
    );
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
};

// Получить ученика по ID
const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const [students] = await db.query(
      'SELECT * FROM students WHERE id = ?',
      [id]
    );

    if (students.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json(students[0]);
  } catch (error) {
    console.error('Error fetching student:', error);
    res.status(500).json({ error: 'Failed to fetch student' });
  }
};

// Создать нового ученика
const createStudent = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      middle_name,
      phone,
      phone_comment,
      email,
      birth_date,
      gender,
      address,
      status,
      balance,
      comment
    } = req.body;

    if (!first_name || !last_name) {
      return res
        .status(400)
        .json({ error: 'First name and last name are required' });
    }

    const [result] = await db.query(
      `INSERT INTO students 
       (first_name, last_name, middle_name, phone, phone_comment, email, 
        birth_date, gender, address, status, balance, comment) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        first_name,
        last_name,
        middle_name || null,
        phone || null,
        phone_comment || null,
        email || null,
        birth_date || null,
        gender || null,
        address || null,
        status || 'active',
        balance || 0.0,
        comment || null
      ]
    );

    const [newStudent] = await db.query(
      'SELECT * FROM students WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(newStudent[0]);
  } catch (error) {
    console.error('Error creating student:', error);
    res.status(500).json({ error: 'Failed to create student' });
  }
};

// Обновить ученика
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      first_name,
      last_name,
      middle_name,
      phone,
      phone_comment,
      email,
      birth_date,
      gender,
      address,
      status,
      balance,
      comment
    } = req.body;

    const [existing] = await db.query('SELECT * FROM students WHERE id = ?', [
      id
    ]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    await db.query(
      `UPDATE students 
       SET first_name = ?, last_name = ?, middle_name = ?, phone = ?, 
           phone_comment = ?, email = ?, birth_date = ?, gender = ?,
           address = ?, status = ?, balance = ?, comment = ?
       WHERE id = ?`,
      [
        first_name,
        last_name,
        middle_name || null,
        phone || null,
        phone_comment || null,
        email || null,
        birth_date || null,
        gender || null,
        address || null,
        status || 'active',
        balance || 0.0,
        comment || null,
        id
      ]
    );

    const [updatedStudent] = await db.query(
      'SELECT * FROM students WHERE id = ?',
      [id]
    );

    res.json(updatedStudent[0]);
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).json({ error: 'Failed to update student' });
  }
};

// Удалить ученика
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query('SELECT * FROM students WHERE id = ?', [
      id
    ]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    await db.query('DELETE FROM students WHERE id = ?', [id]);
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ error: 'Failed to delete student' });
  }
};

// ИМПОРТ УЧЕНИКОВ (максимально безопасный)
const importStudents = async (req, res) => {
  try {
    const students = req.body;

    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({ error: 'Invalid data format' });
    }

    const results = [];
    const errors = [];

    for (const [index, student] of students.entries()) {
      try {
        const firstName = String(student.first_name || 'Без имени').slice(
          0,
          100
        );
        const lastName = String(student.last_name || 'Без фамилии').slice(
          0,
          100
        );
        const phone = student.phone
          ? String(student.phone).slice(0, 20)
          : null;
        const email = student.email
          ? String(student.email).slice(0, 100)
          : null;

        const [result] = await db.query(
          `INSERT INTO students 
           (first_name, last_name, middle_name, phone, phone_comment, email, 
            birth_date, gender, address, status, balance, comment) 
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            firstName,
            lastName,
            null,
            phone,
            null,
            email,
            null,
            null,
            null,
            'active',
            0.0,
            null
          ]
        );

        results.push(result.insertId);
      } catch (error) {
        console.error('Error inserting student row', index, student, error);
        errors.push({
          row: index + 1,
          student: `${student.last_name || ''} ${
            student.first_name || ''
          }`.trim(),
          sqlMessage: error.sqlMessage || error.message
        });
      }
    }

    console.log(
      `Import finished. Inserted: ${results.length}, errors: ${errors.length}`
    );

    res.status(errors.length ? 207 : 200).json({
      message: 'Import completed',
      imported: results.length,
      errors: errors.length,
      errorDetails: errors
    });
  } catch (error) {
    console.error('Error importing students (outer):', error);
    res.status(500).json({ error: 'Failed to import students' });
  }
};

// Поиск учеников
const searchStudents = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return getAllStudents(req, res);
    }

    const searchPattern = `%${query}%`;
    const [students] = await db.query(
      `SELECT * FROM students 
       WHERE first_name LIKE ? 
          OR last_name LIKE ? 
          OR middle_name LIKE ? 
          OR phone LIKE ? 
          OR email LIKE ?
       ORDER BY id DESC`,
      [searchPattern, searchPattern, searchPattern, searchPattern, searchPattern]
    );

    res.json(students);
  } catch (error) {
    console.error('Error searching students:', error);
    res.status(500).json({ error: 'Failed to search students' });
  }
};

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
  importStudents,
  searchStudents
};
