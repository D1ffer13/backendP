// backend/controllers/subjectController.js
const db = require('../config/db');

// GET /api/subjects
const getAllSubjects = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM subjects WHERE is_active = 1 ORDER BY name'
    );
    res.json(rows);
  } catch (e) {
    console.error('Error fetching subjects:', e);
    res.status(500).json({ error: 'Failed to fetch subjects' });
  }
};

// POST /api/subjects
const createSubject = async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const [result] = await db.query(
      'INSERT INTO subjects (name, description) VALUES (?, ?)',
      [name, description || null]
    );

    const [rows] = await db.query('SELECT * FROM subjects WHERE id = ?', [
      result.insertId
    ]);
    res.status(201).json(rows[0]);
  } catch (e) {
    console.error('Error creating subject:', e);
    res.status(500).json({ error: 'Failed to create subject' });
  }
};

// PUT /api/subjects/:id
const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, is_active } = req.body;

    const [existing] = await db.query('SELECT * FROM subjects WHERE id = ?', [
      id
    ]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Subject not found' });
    }

    await db.query(
      'UPDATE subjects SET name = ?, description = ?, is_active = ? WHERE id = ?',
      [name || existing[0].name, description || null, is_active ? 1 : 0, id]
    );

    const [rows] = await db.query('SELECT * FROM subjects WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (e) {
    console.error('Error updating subject:', e);
    res.status(500).json({ error: 'Failed to update subject' });
  }
};

// DELETE /api/subjects/:id
const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM subjects WHERE id = ?', [id]);
    res.json({ message: 'Subject deleted' });
  } catch (e) {
    console.error('Error deleting subject:', e);
    res.status(500).json({ error: 'Failed to delete subject' });
  }
};

module.exports = {
  getAllSubjects,
  createSubject,
  updateSubject,
  deleteSubject
};
