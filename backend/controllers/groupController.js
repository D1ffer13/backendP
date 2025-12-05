// backend/controllers/groupController.js
const db = require('../config/db');

const getGroups = async (req, res) => {
  try {
    console.log('📚 GET /api/groups request');
    
    const { teacher_id, subject_id, status } = req.query;
    const where = [];
    const params = [];

    if (teacher_id) {
      where.push('g.teacher_id = ?');
      params.push(teacher_id);
    }
    if (subject_id) {
      where.push('g.subject_id = ?');
      params.push(subject_id);
    }
    if (status) {
      where.push('g.status = ?');
      params.push(status);
    }

    const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

    const [rows] = await db.query(
      `SELECT g.*, 
              COALESCE(s.name, 'Без предмета') AS subject_name,
              COALESCE(t.first_name, 'Без') AS teacher_first_name,
              COALESCE(t.last_name, 'педагога') AS teacher_last_name
       FROM lesson_groups g
       LEFT JOIN subjects s ON g.subject_id = s.id
       LEFT JOIN teachers t ON g.teacher_id = t.id
       ${whereSql}
       ORDER BY g.name`,
      params
    );

    console.log(`✅ Groups fetched: ${rows.length}`);
    res.json(rows);
  } catch (error) {
    console.error('❌ Error fetching groups:', error);
    res.status(500).json({ error: 'Failed to fetch groups', details: error.message });
  }
};

const createGroup = async (req, res) => {
  try {
    const { name, subject_id, teacher_id, max_students, status, notes } = req.body;

    if (!name || !subject_id || !teacher_id) {
      return res.status(400).json({ error: 'name, subject_id, teacher_id are required' });
    }

    const [ts] = await db.query(
      'SELECT 1 FROM teacher_subjects WHERE teacher_id = ? AND subject_id = ?',
      [teacher_id, subject_id]
    );
    if (ts.length === 0) {
      return res.status(400).json({ error: 'Teacher is not assigned to this subject' });
    }

    const [result] = await db.query(
      `INSERT INTO lesson_groups (name, subject_id, teacher_id, max_students, status, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, subject_id, teacher_id, max_students || null, status || 'active', notes || null]
    );

    const [rows] = await db.query('SELECT * FROM lesson_groups WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: 'Failed to create group', details: error.message });
  }
};

const updateGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, subject_id, teacher_id, max_students, status, notes } = req.body;

    const [existing] = await db.query('SELECT * FROM lesson_groups WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Group not found' });
    }

    const subjectId = subject_id || existing[0].subject_id;
    const teacherId = teacher_id || existing[0].teacher_id;

    const [ts] = await db.query(
      'SELECT 1 FROM teacher_subjects WHERE teacher_id = ? AND subject_id = ?',
      [teacherId, subjectId]
    );
    if (ts.length === 0) {
      return res.status(400).json({ error: 'Teacher is not assigned to this subject' });
    }

    await db.query(
      `UPDATE lesson_groups
       SET name = ?, subject_id = ?, teacher_id = ?, max_students = ?,
           status = ?, notes = ?
       WHERE id = ?`,
      [
        name || existing[0].name, subjectId, teacherId,
        max_students || null, status || existing[0].status,
        notes || null, id
      ]
    );

    const [rows] = await db.query('SELECT * FROM lesson_groups WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating group:', error);
    res.status(500).json({ error: 'Failed to update group', details: error.message });
  }
};

const deleteGroup = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM lesson_groups WHERE id = ?', [id]);
    res.json({ message: 'Group deleted' });
  } catch (error) {
    console.error('Error deleting group:', error);
    res.status(500).json({ error: 'Failed to delete group', details: error.message });
  }
};

const getGroupStudents = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      `SELECT s.*
       FROM group_students gs
       JOIN students s ON gs.student_id = s.id
       WHERE gs.group_id = ?
       ORDER BY s.last_name, s.first_name`,
      [id]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching group students:', error);
    res.status(500).json({ error: 'Failed to fetch group students', details: error.message });
  }
};

const setGroupStudents = async (req, res) => {
  try {
    const { id } = req.params;
    const { student_ids } = req.body;

    if (!Array.isArray(student_ids)) {
      return res.status(400).json({ error: 'student_ids must be an array of ids' });
    }

    await db.query('DELETE FROM group_students WHERE group_id = ?', [id]);

    if (student_ids.length) {
      const values = student_ids.map((sid) => [id, sid]);
      await db.query('INSERT INTO group_students (group_id, student_id) VALUES ?', [values]);
    }

    const [rows] = await db.query(
      `SELECT s.*
       FROM group_students gs
       JOIN students s ON gs.student_id = s.id
       WHERE gs.group_id = ?
       ORDER BY s.last_name, s.first_name`,
      [id]
    );

    res.json(rows);
  } catch (error) {
    console.error('Error setting group students:', error);
    res.status(500).json({ error: 'Failed to set group students', details: error.message });
  }
};

module.exports = {
  getGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  getGroupStudents,
  setGroupStudents
};
