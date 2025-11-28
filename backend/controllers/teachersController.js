// backend/controllers/teachersController.js
const db = require('../config/db');

// Получить всех педагогов
const getAllTeachers = async (req, res) => {
  try {
    const [teachers] = await db.query(
      'SELECT * FROM teachers ORDER BY last_name, first_name'
    );
    res.json(teachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    res.status(500).json({ error: 'Failed to fetch teachers' });
  }
};

// Получить педагога по ID
const getTeacherById = async (req, res) => {
  try {
    const { id } = req.params;
    const [teachers] = await db.query('SELECT * FROM teachers WHERE id = ?', [
      id
    ]);

    if (teachers.length === 0) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    res.json(teachers[0]);
  } catch (error) {
    console.error('Error fetching teacher:', error);
    res.status(500).json({ error: 'Failed to fetch teacher' });
  }
};

// Создать нового педагога
const createTeacher = async (req, res) => {
  try {
    const {
      first_name,
      last_name,
      middle_name,
      phone,
      email,
      specialization,
      notes,
      status
    } = req.body;

    if (!first_name || !last_name) {
      return res
        .status(400)
        .json({ error: 'First name and last name are required' });
    }

    const [result] = await db.query(
      `INSERT INTO teachers 
       (first_name, last_name, middle_name, phone, email, specialization, notes, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        first_name,
        last_name,
        middle_name || null,
        phone || null,
        email || null,
        specialization || null,
        notes || null,
        status || 'active'
      ]
    );

    const [newTeacher] = await db.query(
      'SELECT * FROM teachers WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(newTeacher[0]);
  } catch (error) {
    console.error('Error creating teacher:', error);
    res.status(500).json({ error: 'Failed to create teacher' });
  }
};

// Обновить педагога
const updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      first_name,
      last_name,
      middle_name,
      phone,
      email,
      specialization,
      notes,
      status
    } = req.body;

    const [existing] = await db.query('SELECT * FROM teachers WHERE id = ?', [
      id
    ]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    await db.query(
      `UPDATE teachers 
       SET first_name = ?, 
           last_name = ?, 
           middle_name = ?, 
           phone = ?, 
           email = ?, 
           specialization = ?, 
           notes = ?, 
           status = ?
       WHERE id = ?`,
      [
        first_name,
        last_name,
        middle_name || null,
        phone || null,
        email || null,
        specialization || null,
        notes || null,
        status || 'active',
        id
      ]
    );

    const [updatedTeacher] = await db.query(
      'SELECT * FROM teachers WHERE id = ?',
      [id]
    );

    res.json(updatedTeacher[0]);
  } catch (error) {
    console.error('Error updating teacher:', error);
    res.status(500).json({ error: 'Failed to update teacher' });
  }
};

// ПОЛНОЕ удаление педагога:
// - у уроков teacher_id обнуляем
// - удаляем связи teacher_subjects
// - удаляем самого педагога
const deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query('SELECT * FROM teachers WHERE id = ?', [
      id
    ]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    // Обнуляем привязку к педагогу в уроках
    await db.query('UPDATE lessons SET teacher_id = NULL WHERE teacher_id = ?', [
      id
    ]);

    // Удаляем связи "педагог-предмет"
    await db.query('DELETE FROM teacher_subjects WHERE teacher_id = ?', [id]);

    // Удаляем самого педагога
    await db.query('DELETE FROM teachers WHERE id = ?', [id]);

    res.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    console.error('Error deleting teacher:', error);
    res.status(500).json({ error: 'Failed to delete teacher' });
  }
};

// ===== Предметы и группы педагога =====

// GET /api/teachers/:id/subjects
const getTeacherSubjects = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      `SELECT s.*
       FROM teacher_subjects ts
       JOIN subjects s ON ts.subject_id = s.id
       WHERE ts.teacher_id = ?
       ORDER BY s.name`,
      [id]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching teacher subjects:', error);
    res.status(500).json({ error: 'Failed to fetch teacher subjects' });
  }
};

// POST /api/teachers/:id/subjects { subject_ids: [...] }
const setTeacherSubjects = async (req, res) => {
  try {
    const { id } = req.params;
    const { subject_ids } = req.body;

    if (!Array.isArray(subject_ids)) {
      return res
        .status(400)
        .json({ error: 'subject_ids must be an array of ids' });
    }

    await db.query('DELETE FROM teacher_subjects WHERE teacher_id = ?', [id]);

    if (subject_ids.length > 0) {
      const values = subject_ids.map((sid) => [id, sid]);
      await db.query(
        'INSERT INTO teacher_subjects (teacher_id, subject_id) VALUES ?',
        [values]
      );
    }

    const [rows] = await db.query(
      `SELECT s.*
       FROM teacher_subjects ts
       JOIN subjects s ON ts.subject_id = s.id
       WHERE ts.teacher_id = ?
       ORDER BY s.name`,
      [id]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error setting teacher subjects:', error);
    res.status(500).json({ error: 'Failed to set teacher subjects' });
  }
};

// GET /api/teachers/:id/groups
const getTeacherGroups = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      `SELECT g.*, s.name AS subject_name
       FROM groups g
       JOIN subjects s ON g.subject_id = s.id
       WHERE g.teacher_id = ?
       ORDER BY g.name`,
      [id]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching teacher groups:', error);
    res.status(500).json({ error: 'Failed to fetch teacher groups' });
  }
};

module.exports = {
  getAllTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getTeacherSubjects,
  setTeacherSubjects,
  getTeacherGroups
};
