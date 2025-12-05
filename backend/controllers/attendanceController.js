// backend/controllers/attendanceController.js
const db = require('../config/db');

const getLessonsForDate = async (req, res) => {
  try {
    console.log('📅 GET /api/attendance/lessons request');
    
    const { date, teacher_id, group_id } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'date is required (YYYY-MM-DD)' });
    }

    let query = `
      SELECT 
        l.*,
        COALESCE(t.first_name, 'Без') AS teacher_first_name,
        COALESCE(t.last_name, 'педагога') AS teacher_last_name,
        COALESCE(t.middle_name, '') AS teacher_middle_name,
        COALESCE(g.name, 'Без группы') AS group_name,
        COALESCE(s.name, 'Без предмета') AS subject_name,
        (SELECT COUNT(*) FROM enrollments e WHERE e.lesson_id = l.id) AS total_enrolled,
        (SELECT COUNT(*) FROM enrollments e WHERE e.lesson_id = l.id AND e.status = 'present') AS total_present,
        (SELECT COUNT(*) FROM enrollments e WHERE e.lesson_id = l.id AND e.status = 'absent') AS total_absent
      FROM lessons l
      LEFT JOIN teachers t ON l.teacher_id = t.id
      LEFT JOIN lesson_groups g ON l.group_id = g.id
      LEFT JOIN subjects s ON l.subject_id = s.id
      WHERE DATE(l.lesson_date) = ?
    `;
    const params = [date];

    if (teacher_id) {
      query += ' AND l.teacher_id = ?';
      params.push(teacher_id);
    }
    if (group_id) {
      query += ' AND l.group_id = ?';
      params.push(group_id);
    }

    query += ' ORDER BY l.start_time ASC';

    const [rows] = await db.query(query, params);

    console.log(`✅ Lessons for date fetched: ${rows.length}`);
    res.json(rows);
  } catch (error) {
    console.error('❌ Error fetching lessons for attendance:', error);
    res.status(500).json({ error: 'Failed to fetch lessons for attendance', details: error.message });
  }
};

const getLessonAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    const [lessons] = await db.query(
      `SELECT 
        l.*,
        COALESCE(t.first_name, 'Без') AS teacher_first_name,
        COALESCE(t.last_name, 'педагога') AS teacher_last_name,
        COALESCE(t.middle_name, '') AS teacher_middle_name,
        COALESCE(g.name, 'Без группы') AS group_name,
        COALESCE(s.name, 'Без предмета') AS subject_name
       FROM lessons l
       LEFT JOIN teachers t ON l.teacher_id = t.id
       LEFT JOIN lesson_groups g ON l.group_id = g.id
       LEFT JOIN subjects s ON l.subject_id = s.id
       WHERE l.id = ?`,
      [id]
    );

    if (lessons.length === 0) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const lesson = lessons[0];

    const [students] = await db.query(
      `SELECT 
        e.id AS enrollment_id,
        e.status AS attendance_status,
        s.id AS student_id,
        s.first_name,
        s.last_name,
        s.middle_name,
        s.phone
       FROM enrollments e
       JOIN students s ON e.student_id = s.id
       WHERE e.lesson_id = ?
       ORDER BY s.last_name, s.first_name`,
      [id]
    );

    res.json({ lesson, students });
  } catch (error) {
    console.error('Error fetching lesson attendance:', error);
    res.status(500).json({ error: 'Failed to fetch lesson attendance', details: error.message });
  }
};

const updateEnrollmentStatus = async (req, res) => {
  try {
    console.log('=== updateEnrollmentStatus CALLED ===');
    console.log('params:', req.params);
    console.log('raw body:', req.body);

    const { id } = req.params;
    let { status } = req.body;

    if (typeof status === 'string') {
      status = status.trim().toLowerCase();
    }

    console.log('normalized status:', status);

    const allowed = ['present', 'absent', 'enrolled'];

    if (!status || !allowed.includes(status)) {
      console.log('INVALID STATUS:', status);
      return res.status(400).json({
        error: 'Invalid status value. Allowed: present, absent, enrolled',
        received: status
      });
    }

    const [existing] = await db.query('SELECT * FROM enrollments WHERE id = ?', [id]);
    if (existing.length === 0) {
      console.log('Enrollment not found:', id);
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    await db.query('UPDATE enrollments SET status = ? WHERE id = ?', [status, id]);

    const [updated] = await db.query('SELECT * FROM enrollments WHERE id = ?', [id]);

    console.log('Updated enrollment row (from DB):', updated[0]);

    res.json(updated[0]);
  } catch (error) {
    console.error('Error updating enrollment status:', error);
    res.status(500).json({ error: 'Failed to update enrollment status', details: error.message });
  }
};

const addStudentToLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const { student_id } = req.body;

    if (!student_id) {
      return res.status(400).json({ error: 'student_id is required' });
    }

    const [lessons] = await db.query('SELECT * FROM lessons WHERE id = ?', [lessonId]);
    if (lessons.length === 0) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    const lesson = lessons[0];

    if (!lesson.group_id) {
      return res.status(400).json({ error: 'Lesson has no group, cannot validate student' });
    }

    const [gs] = await db.query(
      'SELECT 1 FROM group_students WHERE group_id = ? AND student_id = ?',
      [lesson.group_id, student_id]
    );
    if (gs.length === 0) {
      return res.status(400).json({ error: 'Student is not in this lesson group' });
    }

    const [existing] = await db.query(
      'SELECT * FROM enrollments WHERE lesson_id = ? AND student_id = ?',
      [lessonId, student_id]
    );
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Student is already enrolled to this lesson' });
    }

    const [result] = await db.query(
      `INSERT INTO enrollments (lesson_id, student_id, status, enrollment_date)
       VALUES (?, ?, 'enrolled', NOW())`,
      [lessonId, student_id]
    );

    const [created] = await db.query('SELECT * FROM enrollments WHERE id = ?', [result.insertId]);

    res.status(201).json(created[0]);
  } catch (error) {
    console.error('Error adding student to lesson:', error);
    res.status(500).json({ error: 'Failed to add student to lesson', details: error.message });
  }
};

const rescheduleLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const { new_date, new_start_time, new_end_time, reason } = req.body;

    if (!new_date || !new_start_time || !new_end_time) {
      return res.status(400).json({
        error: 'new_date, new_start_time and new_end_time are required'
      });
    }

    const [existing] = await db.query('SELECT * FROM lessons WHERE id = ?', [id]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    await db.query(
      `UPDATE lessons 
       SET lesson_date = ?, start_time = ?, end_time = ?, reschedule_reason = ?
       WHERE id = ?`,
      [new_date, new_start_time, new_end_time, reason || null, id]
    );

    const [updated] = await db.query('SELECT * FROM lessons WHERE id = ?', [id]);

    res.json(updated[0]);
  } catch (error) {
    console.error('Error rescheduling lesson:', error);
    res.status(500).json({ error: 'Failed to reschedule lesson', details: error.message });
  }
};

module.exports = {
  getLessonsForDate,
  getLessonAttendance,
  updateEnrollmentStatus,
  addStudentToLesson,
  rescheduleLesson
};
