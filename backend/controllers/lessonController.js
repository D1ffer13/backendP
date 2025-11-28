// backend/controllers/lessonController.js

const db = require('../config/db');

// Форматирование даты в YYYY-MM-DD
const formatDateOnly = (date) => {
  if (!date) return null;
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Обработка дат в уроках
const processLessonDates = (lessons) => {
  return lessons.map((lesson) => ({
    ...lesson,
    lesson_date: lesson.lesson_date ? formatDateOnly(lesson.lesson_date) : null
  }));
};

// Проверка связки педагог–предмет–группа
const validateTeacherSubjectGroup = async ({
  teacher_id,
  subject_id,
  group_id
}) => {
  if (!teacher_id || !subject_id || !group_id) {
    return null;
  }

  const [ts] = await db.query(
    'SELECT 1 FROM teacher_subjects WHERE teacher_id = ? AND subject_id = ?',
    [teacher_id, subject_id]
  );
  if (ts.length === 0) {
    return 'Teacher is not assigned to this subject';
  }

  const [g] = await db.query(
    'SELECT 1 FROM groups WHERE id = ? AND teacher_id = ? AND subject_id = ?',
    [group_id, teacher_id, subject_id]
  );
  if (g.length === 0) {
    return 'Group does not belong to this teacher and subject';
  }

  return null;
};

// ===== CRUD уроков =====

const getAllLessons = async (req, res) => {
  try {
    const {
      start_date,
      end_date,
      teacher_id,
      status,
      subject_id,
      group_id
    } = req.query;
    const user = req.user;

    let query = `
      SELECT 
        l.*,
        t.first_name  AS teacher_first_name,
        t.last_name   AS teacher_last_name,
        t.middle_name AS teacher_middle_name,
        s.name        AS subject_name,
        g.name        AS group_name,
        (SELECT COUNT(*) 
           FROM enrollments e 
          WHERE e.lesson_id = l.id 
            AND e.status = 'enrolled') AS enrolled_count
      FROM lessons l
      LEFT JOIN teachers t ON l.teacher_id = t.id
      LEFT JOIN subjects s ON l.subject_id = s.id
      LEFT JOIN groups   g ON l.group_id   = g.id
      WHERE 1=1
    `;

    const params = [];

    if (user.role === 'teacher' && user.teacher_id) {
      query += ' AND l.teacher_id = ?';
      params.push(user.teacher_id);
    }

    if (start_date) {
      query += ' AND l.lesson_date >= ?';
      params.push(start_date);
    }

    if (end_date) {
      query += ' AND l.lesson_date <= ?';
      params.push(end_date);
    }

    if (teacher_id && user.role === 'admin') {
      query += ' AND l.teacher_id = ?';
      params.push(teacher_id);
    }

    if (status) {
      query += ' AND l.status = ?';
      params.push(status);
    }

    if (subject_id) {
      query += ' AND l.subject_id = ?';
      params.push(subject_id);
    }

    if (group_id) {
      query += ' AND l.group_id = ?';
      params.push(group_id);
    }

    query += ' ORDER BY l.lesson_date DESC, l.start_time DESC';

    const [lessons] = await db.query(query, params);
    const processedLessons = processLessonDates(lessons);
    res.json(processedLessons);
  } catch (error) {
    console.error('Error fetching lessons:', error);
    res.status(500).json({ error: 'Failed to fetch lessons' });
  }
};

const getLessonById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const [lessons] = await db.query(
      `SELECT 
        l.*,
        t.first_name  AS teacher_first_name,
        t.last_name   AS teacher_last_name,
        t.middle_name AS teacher_middle_name,
        s.name        AS subject_name,
        g.name        AS group_name
       FROM lessons l
       LEFT JOIN teachers t ON l.teacher_id = t.id
       LEFT JOIN subjects s ON l.subject_id = s.id
       LEFT JOIN groups   g ON l.group_id   = g.id
       WHERE l.id = ?`,
      [id]
    );

    if (lessons.length === 0) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const lesson = lessons[0];

    if (user.role === 'teacher' && lesson.teacher_id !== user.teacher_id) {
      return res.status(403).json({
        error: 'Access denied. You can only view your own lessons'
      });
    }

    const [students] = await db.query(
      `SELECT 
        s.*,
        e.id     AS enrollment_id,
        e.status AS enrollment_status,
        e.enrollment_date
       FROM enrollments e
       JOIN students s ON e.student_id = s.id
       WHERE e.lesson_id = ?`,
      [id]
    );

    const processedLesson = processLessonDates([lesson])[0];
    processedLesson.students = students;

    res.json(processedLesson);
  } catch (error) {
    console.error('Error fetching lesson:', error);
    res.status(500).json({ error: 'Failed to fetch lesson' });
  }
};

const createLesson = async (req, res) => {
  try {
    const {
      teacher_id,
      subject,
      subject_id,
      group_id,
      lesson_date,
      start_time,
      end_time,
      max_students,
      description,
      status,
      auto_enroll_group_students
    } = req.body;

    const user = req.user;

    if (!lesson_date || !start_time || !end_time) {
      return res.status(400).json({
        error: 'Date, start time, and end time are required'
      });
    }

    let finalTeacherId = teacher_id;

    if (user.role === 'teacher') {
      if (!user.teacher_id) {
        return res
          .status(400)
          .json({ error: 'Teacher ID not found for your account' });
      }
      finalTeacherId = user.teacher_id;
    } else if (user.role === 'admin') {
      if (!teacher_id) {
        return res.status(400).json({ error: 'Teacher ID is required' });
      }
      finalTeacherId = teacher_id;
    }

    const [teacher] = await db.query('SELECT * FROM teachers WHERE id = ?', [
      finalTeacherId
    ]);
    if (teacher.length === 0) {
      return res.status(404).json({ error: 'Teacher not found' });
    }

    if (subject_id && group_id) {
      const validationError = await validateTeacherSubjectGroup({
        teacher_id: finalTeacherId,
        subject_id,
        group_id
      });
      if (validationError) {
        return res.status(400).json({ error: validationError });
      }
    }

    const formattedDate = formatDateOnly(lesson_date);

    const [result] = await db.query(
      `INSERT INTO lessons 
       (teacher_id, subject, subject_id, group_id, lesson_date, start_time, end_time, max_students, description, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        finalTeacherId,
        subject || null,
        subject_id || null,
        group_id || null,
        formattedDate,
        start_time,
        end_time,
        max_students || 10,
        description || null,
        status || 'scheduled'
      ]
    );

    const lessonId = result.insertId;

    // авто‑запись всех учеников группы при создании
    if (auto_enroll_group_students && group_id) {
      try {
        const [groupStudents] = await db.query(
          'SELECT student_id FROM group_students WHERE group_id = ?',
          [group_id]
        );

        if (groupStudents.length > 0) {
          const values = groupStudents.map((row) => [
            lessonId,
            row.student_id,
            'enrolled'
          ]);

          await db.query(
            `INSERT IGNORE INTO enrollments (lesson_id, student_id, status)
             VALUES ?`,
            [values]
          );
        }
      } catch (e) {
        console.error(
          'Error auto-enrolling group students for lesson',
          lessonId,
          e
        );
      }
    }

    const [newLesson] = await db.query(
      `SELECT 
        l.*,
        t.first_name  AS teacher_first_name,
        t.last_name   AS teacher_last_name,
        t.middle_name AS teacher_middle_name,
        s.name        AS subject_name,
        g.name        AS group_name
       FROM lessons l
       LEFT JOIN teachers t ON l.teacher_id = t.id
       LEFT JOIN subjects s ON l.subject_id = s.id
       LEFT JOIN groups   g ON l.group_id   = g.id
       WHERE l.id = ?`,
      [lessonId]
    );

    const processedLesson = processLessonDates(newLesson)[0];
    res.status(201).json(processedLesson);
  } catch (error) {
    console.error('Error creating lesson:', error);
    res
      .status(500)
      .json({ error: 'Failed to create lesson', details: error.message });
  }
};

const updateLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      teacher_id,
      subject,
      subject_id,
      group_id,
      lesson_date,
      start_time,
      end_time,
      max_students,
      description,
      status,
      auto_enroll_on_update
    } = req.body;

    const user = req.user;

    const [existing] = await db.query('SELECT * FROM lessons WHERE id = ?', [
      id
    ]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const lesson = existing[0];

    if (user.role === 'teacher' && lesson.teacher_id !== user.teacher_id) {
      return res.status(403).json({
        error: 'Access denied. You can only edit your own lessons'
      });
    }

    let finalTeacherId = lesson.teacher_id;
    if (user.role === 'admin' && teacher_id) {
      finalTeacherId = teacher_id;
    }

    const newSubjectId = subject_id || lesson.subject_id;
    const newGroupId = group_id || lesson.group_id;

    if (newSubjectId && newGroupId) {
      const validationError = await validateTeacherSubjectGroup({
        teacher_id: finalTeacherId,
        subject_id: newSubjectId,
        group_id: newGroupId
      });
      if (validationError) {
        return res.status(400).json({ error: validationError });
      }
    }

    const formattedDate = formatDateOnly(lesson_date || lesson.lesson_date);

    await db.query(
      `UPDATE lessons 
       SET teacher_id = ?, subject = ?, subject_id = ?, group_id = ?,
           lesson_date = ?, start_time = ?, end_time = ?, 
           max_students = ?, description = ?, status = ?
       WHERE id = ?`,
      [
        finalTeacherId,
        subject !== undefined ? subject : lesson.subject,
        newSubjectId,
        newGroupId,
        formattedDate,
        start_time || lesson.start_time,
        end_time || lesson.end_time,
        max_students != null ? max_students : lesson.max_students,
        description !== undefined ? description : lesson.description,
        status || lesson.status,
        id
      ]
    );

    // дозаписать учеников группы при редактировании
    if (auto_enroll_on_update && newGroupId) {
      try {
        const [groupStudents] = await db.query(
          'SELECT student_id FROM group_students WHERE group_id = ?',
          [newGroupId]
        );

        if (groupStudents.length > 0) {
          const values = groupStudents.map((row) => [
            id,
            row.student_id,
            'enrolled'
          ]);

          await db.query(
            `INSERT IGNORE INTO enrollments (lesson_id, student_id, status)
             VALUES ?`,
            [values]
          );
        }
      } catch (e) {
        console.error(
          'Error auto-enrolling group students on update for lesson',
          id,
          e
        );
      }
    }

    const [updatedLesson] = await db.query(
      `SELECT 
        l.*,
        t.first_name  AS teacher_first_name,
        t.last_name   AS teacher_last_name,
        t.middle_name AS teacher_middle_name,
        s.name        AS subject_name,
        g.name        AS group_name
       FROM lessons l
       LEFT JOIN teachers t ON l.teacher_id = t.id
       LEFT JOIN subjects s ON l.subject_id = s.id
       LEFT JOIN groups   g ON l.group_id   = g.id
       WHERE l.id = ?`,
      [id]
    );

    const processedLesson = processLessonDates(updatedLesson)[0];
    res.json(processedLesson);
  } catch (error) {
    console.error('Error updating lesson:', error);
    res.status(500).json({ error: 'Failed to update lesson' });
  }
};

const deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;

    const [existing] = await db.query('SELECT * FROM lessons WHERE id = ?', [
      id
    ]);
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    await db.query('DELETE FROM enrollments WHERE lesson_id = ?', [id]);
    await db.query('DELETE FROM lessons WHERE id = ?', [id]);

    res.json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    res.status(500).json({ error: 'Failed to delete lesson' });
  }
};

const getWeekSchedule = async (req, res) => {
  try {
    const { start_date } = req.query;
    const user = req.user;

    if (!start_date) {
      return res.status(400).json({ error: 'Start date is required' });
    }

    let query = `
      SELECT 
        l.*,
        t.first_name  AS teacher_first_name,
        t.last_name   AS teacher_last_name,
        t.middle_name AS teacher_middle_name,
        s.name        AS subject_name,
        g.name        AS group_name,
        (SELECT COUNT(*) 
           FROM enrollments e 
          WHERE e.lesson_id = l.id 
            AND e.status = 'enrolled') AS enrolled_count
       FROM lessons l
       LEFT JOIN teachers t ON l.teacher_id = t.id
       LEFT JOIN subjects s ON l.subject_id = s.id
       LEFT JOIN groups   g ON l.group_id   = g.id
       WHERE l.lesson_date >= ? 
         AND l.lesson_date < DATE_ADD(?, INTERVAL 30 DAY)
    `;

    const params = [start_date, start_date];

    if (user.role === 'teacher' && user.teacher_id) {
      query += ' AND l.teacher_id = ?';
      params.push(user.teacher_id);
    }

    query += ' ORDER BY l.lesson_date, l.start_time';

    const [lessons] = await db.query(query, params);
    const processedLessons = processLessonDates(lessons);
    res.json(processedLessons);
  } catch (error) {
    console.error('Error fetching week schedule:', error);
    res.status(500).json({ error: 'Failed to fetch week schedule' });
  }
};

const getLessonStats = async (req, res) => {
  try {
    const user = req.user;

    let whereClause = '';
    const params = [];

    if (user.role === 'teacher' && user.teacher_id) {
      whereClause = 'WHERE teacher_id = ?';
      params.push(user.teacher_id);
    }

    const [stats] = await db.query(
      `
      SELECT 
        COUNT(*) as total_lessons,
        SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) as scheduled_lessons,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_lessons,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_lessons,
        SUM(CASE WHEN lesson_date = CURDATE() THEN 1 ELSE 0 END) as lessons_today,
        SUM(CASE WHEN lesson_date >= CURDATE() AND lesson_date < DATE_ADD(CURDATE(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as lessons_this_week
      FROM lessons
      ${whereClause}
    `,
      params
    );

    res.json(stats[0]);
  } catch (error) {
    console.error('Error fetching lesson stats:', error);
    res.status(500).json({ error: 'Failed to fetch lesson statistics' });
  }
};

module.exports = {
  getAllLessons,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
  getWeekSchedule,
  getLessonStats
};
