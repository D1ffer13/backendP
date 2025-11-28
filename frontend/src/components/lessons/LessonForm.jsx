// frontend/src/components/lessons/LessonForm.jsx

import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { formatFullName } from '../../utils/formatters';
import { teacherService } from '../../services/teacherService';
import { groupService } from '../../services/groupService';
import { lessonService } from '../../services/lessonService';

const LessonForm = ({ isOpen, onClose, lesson, onSaved }) => {
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [groups, setGroups] = useState([]);

  const [formData, setFormData] = useState({
    teacher_id: '',
    subject_id: '',
    group_id: '',
    subject: '',
    lesson_date: '',
    start_time: '',
    end_time: '',
    max_students: 10,
    description: '',
    status: 'scheduled',
    auto_enroll_group_students: true,
    auto_enroll_on_update: false
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadTeachers();
    }
  }, [isOpen]);

  useEffect(() => {
    if (lesson) {
      const lessonDate = lesson.lesson_date
        ? lesson.lesson_date.split('T')[0]
        : lesson.lesson_date || '';

      setFormData({
        teacher_id: lesson.teacher_id || '',
        subject_id: lesson.subject_id || '',
        group_id: lesson.group_id || '',
        subject: lesson.subject || lesson.subject_name || '',
        lesson_date: lessonDate,
        start_time: lesson.start_time
          ? lesson.start_time.substring(0, 5)
          : '',
        end_time: lesson.end_time ? lesson.end_time.substring(0, 5) : '',
        max_students: lesson.max_students || 10,
        description: lesson.description || '',
        status: lesson.status || 'scheduled',
        auto_enroll_group_students: false,
        auto_enroll_on_update: false
      });

      if (lesson.teacher_id) {
        loadTeacherSubjects(lesson.teacher_id, lesson.subject_id);
      }
      if (lesson.teacher_id && lesson.subject_id) {
        loadGroups(lesson.teacher_id, lesson.subject_id);
      }
    } else {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      setFormData({
        teacher_id: '',
        subject_id: '',
        group_id: '',
        subject: '',
        lesson_date: dateStr,
        start_time: '',
        end_time: '',
        max_students: 10,
        description: '',
        status: 'scheduled',
        auto_enroll_group_students: true,
        auto_enroll_on_update: false
      });

      setSubjects([]);
      setGroups([]);
    }
    setErrors({});
    setTouched({});
    setServerError('');
  }, [lesson, isOpen]);

  const loadTeachers = async () => {
    try {
      const data = await teacherService.getAll();
      setTeachers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error loading teachers:', e);
    }
  };

  const loadTeacherSubjects = async (teacherId, preselectSubjectId) => {
    if (!teacherId) {
      setSubjects([]);
      return;
    }
    try {
      const subs = await teacherService.getSubjects(teacherId);
      setSubjects(Array.isArray(subs) ? subs : []);

      if (
        preselectSubjectId &&
        !subs.find((s) => String(s.id) === String(preselectSubjectId))
      ) {
        setFormData((prev) => ({ ...prev, subject_id: '', group_id: '' }));
      }
    } catch (e) {
      console.error('Error loading teacher subjects:', e);
      setSubjects([]);
    }
  };

  const loadGroups = async (teacherId, subjectId) => {
    if (!teacherId || !subjectId) {
      setGroups([]);
      return;
    }
    try {
      const gs = await groupService.getAll({
        teacher_id: teacherId,
        subject_id: subjectId
      });
      setGroups(Array.isArray(gs) ? gs : []);
    } catch (e) {
      console.error('Error loading groups:', e);
      setGroups([]);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.teacher_id) {
      newErrors.teacher_id = 'Выберите педагога';
    }
    if (!formData.subject_id) {
      newErrors.subject_id = 'Выберите предмет';
    }
    if (!formData.group_id) {
      newErrors.group_id = 'Выберите группу';
    }
    if (!formData.lesson_date) {
      newErrors.lesson_date = 'Дата обязательна';
    }
    if (!formData.start_time) {
      newErrors.start_time = 'Время начала обязательно';
    }
    if (!formData.end_time) {
      newErrors.end_time = 'Время окончания обязательно';
    }
    if (formData.start_time && formData.end_time) {
      const start = new Date(`2000-01-01T${formData.start_time}`);
      const end = new Date(`2000-01-01T${formData.end_time}`);
      if (end <= start) {
        newErrors.end_time =
          'Время окончания должно быть позже времени начала';
      }
    }
    const maxStr = String(formData.max_students).trim();
    const maxNum = maxStr === '' ? null : Number(maxStr);

    if (maxStr === '' || maxNum === null || Number.isNaN(maxNum)) {
      newErrors.max_students = 'Укажите максимальное количество учеников';
    } else if (maxNum < 1) {
      newErrors.max_students = 'Минимум 1 ученик';
    } else if (maxNum > 100) {
      newErrors.max_students = 'Максимум 100 учеников';
    }


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setServerError('');

    if (name === 'auto_enroll_group_students') {
      setFormData((prev) => ({
        ...prev,
        auto_enroll_group_students: checked
      }));
      return;
    }

    if (name === 'auto_enroll_on_update') {
      setFormData((prev) => ({
        ...prev,
        auto_enroll_on_update: checked
      }));
      return;
    }

    if (name === 'teacher_id') {
      const teacherId = value;
      setFormData((prev) => ({
        ...prev,
        teacher_id: teacherId,
        subject_id: '',
        group_id: ''
      }));
      setSubjects([]);
      setGroups([]);
      if (teacherId) {
        loadTeacherSubjects(teacherId);
      }
    } else if (name === 'subject_id') {
      const subjectId = value;
      const subjectName =
        subjects.find((s) => String(s.id) === String(subjectId))?.name || '';
      setFormData((prev) => ({
        ...prev,
        subject_id: subjectId,
        group_id: '',
        subject: subjectName
      }));
      setGroups([]);
      if (formData.teacher_id && subjectId) {
        loadGroups(formData.teacher_id, subjectId);
      }
    } else if (name === 'group_id') {
      const groupId = value;
      const selectedGroup = groups.find(
        (g) => String(g.id) === String(groupId)
      );
      setFormData((prev) => ({
        ...prev,
        group_id: groupId,
        max_students:
          selectedGroup && selectedGroup.max_students != null
            ? String(selectedGroup.max_students)
            : prev.max_students

      }));
    } else if (name === 'max_students') {
      // просто сохраняем строку как есть, чтобы можно было очистить поле
      setFormData((prev) => ({
        ...prev,
        max_students: value
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
    }

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({
      ...prev,
      [name]: true
    }));
  };

  const handleStartTimeChange = (e) => {
    const startTime = e.target.value;
    handleChange(e);

    if (startTime && !formData.end_time) {
      const [hours, minutes] = startTime.split(':');
      const endHours = (parseInt(hours, 10) + 1) % 24;
      const endTime = `${endHours.toString().padStart(2, '0')}:${minutes}`;
      setFormData((prev) => ({
        ...prev,
        end_time: endTime
      }));
    }
  };

  const setQuickTime = (startHour, duration = 1) => {
    const startTime = `${startHour.toString().padStart(2, '0')}:00`;
    const endHour = startHour + duration;
    const endTime = `${endHour.toString().padStart(2, '0')}:00`;

    setFormData((prev) => ({
      ...prev,
      start_time: startTime,
      end_time: endTime
    }));

    setErrors((prev) => ({
      ...prev,
      start_time: '',
      end_time: ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    if (!validateForm()) {
      return;
    }

    try {
      const payload = {
        teacher_id: Number(formData.teacher_id),
        subject_id: Number(formData.subject_id),
        group_id: Number(formData.group_id),
        subject: formData.subject || null,
        lesson_date: formData.lesson_date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        max_students: Number(formData.max_students),
        description: formData.description || null,
        status: formData.status,
        auto_enroll_group_students: !!formData.auto_enroll_group_students,
        auto_enroll_on_update: !!formData.auto_enroll_on_update
      };

      let saved;
      if (lesson) {
        saved = await lessonService.update(lesson.id, payload);
      } else {
        saved = await lessonService.create(payload);
      }

      if (onSaved) onSaved(saved);
      onClose();
    } catch (err) {
      console.error('Error saving lesson:', err);
      const msg =
        err.response?.data?.error ||
        'Ошибка при сохранении занятия. Проверьте данные.';
      setServerError(msg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={lesson ? 'Редактировать занятие' : 'Создать занятие'}
      size="large"
    >
      <form
        onSubmit={handleSubmit}
        style={{ maxHeight: '75vh', overflowY: 'auto', padding: '20px' }}
      >
        {serverError && (
          <div
            style={{
              marginBottom: '12px',
              padding: '10px',
              borderRadius: '4px',
              backgroundColor: '#fdecea',
              color: '#c0392b',
              fontSize: '13px'
            }}
          >
            {serverError}
          </div>
        )}

        {/* Основная информация */}
        <div className="form-section">
          <h3 className="form-section-title">Основная информация</h3>

          <div className="form-group">
            <label>Педагог *</label>
            <select
              name="teacher_id"
              value={formData.teacher_id}
              onChange={handleChange}
              onBlur={handleBlur}
              style={{
                width: '100%',
                padding: '10px',
                border:
                  touched.teacher_id && errors.teacher_id
                    ? '1px solid #e74c3c'
                    : '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
              required
            >
              <option value="">Выберите педагога</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {formatFullName(
                    teacher.first_name,
                    teacher.last_name,
                    teacher.middle_name
                  )}
                </option>
              ))}
            </select>
            {touched.teacher_id && errors.teacher_id && (
              <small
                style={{
                  color: '#e74c3c',
                  fontSize: '12px',
                  marginTop: '4px',
                  display: 'block'
                }}
              >
                {errors.teacher_id}
              </small>
            )}
          </div>

          <div className="form-group">
            <label>Предмет *</label>
            <select
              name="subject_id"
              value={formData.subject_id}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={!formData.teacher_id}
              style={{
                width: '100%',
                padding: '10px',
                border:
                  touched.subject_id && errors.subject_id
                    ? '1px solid #e74c3c'
                    : '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: !formData.teacher_id ? '#f9f9f9' : 'white'
              }}
              required
            >
              <option value="">
                {formData.teacher_id
                  ? 'Выберите предмет'
                  : 'Сначала выберите педагога'}
              </option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
            {touched.subject_id && errors.subject_id && (
              <small
                style={{
                  color: '#e74c3c',
                  fontSize: '12px',
                  marginTop: '4px',
                  display: 'block'
                }}
              >
                {errors.subject_id}
              </small>
            )}
          </div>

          <div className="form-group">
            <label>Группа *</label>
            <select
              name="group_id"
              value={formData.group_id}
              onChange={handleChange}
              onBlur={handleBlur}
              disabled={!formData.teacher_id || !formData.subject_id}
              style={{
                width: '100%',
                padding: '10px',
                border:
                  touched.group_id && errors.group_id
                    ? '1px solid #e74c3c'
                    : '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor:
                  !formData.teacher_id || !formData.subject_id
                    ? '#f9f9f9'
                    : 'white'
              }}
              required
            >
              <option value="">
                {formData.teacher_id && formData.subject_id
                  ? 'Выберите группу'
                  : 'Сначала выберите педагога и предмет'}
              </option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
            {touched.group_id && errors.group_id && (
              <small
                style={{
                  color: '#e74c3c',
                  fontSize: '12px',
                  marginTop: '4px',
                  display: 'block'
                }}
              >
                {errors.group_id}
              </small>
            )}
          </div>

          <div className="form-group">
            <label>Статус</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'white'
              }}
            >
              <option value="scheduled">Запланировано</option>
              <option value="completed">Завершено</option>
              <option value="cancelled">Отменено</option>
            </select>
          </div>
        </div>

        {/* Дата и время */}
        <div className="form-section">
          <h3 className="form-section-title">Дата и время</h3>

          <div className="form-group">
            <Input
              label="Дата занятия *"
              name="lesson_date"
              type="date"
              value={formData.lesson_date}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.lesson_date && errors.lesson_date}
              required
            />
            <small
              style={{
                color: '#666',
                fontSize: '12px',
                marginTop: '4px',
                display: 'block'
              }}
            >
              Можно выбрать прошлую, текущую или будущую дату
            </small>
          </div>

          <div className="form-row">
            <div className="form-group">
              <Input
                label="Время начала *"
                name="start_time"
                type="time"
                value={formData.start_time}
                onChange={handleStartTimeChange}
                onBlur={handleBlur}
                error={touched.start_time && errors.start_time}
                required
              />
            </div>

            <div className="form-group">
              <Input
                label="Время окончания *"
                name="end_time"
                type="time"
                value={formData.end_time}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.end_time && errors.end_time}
                required
              />
            </div>
          </div>

          <div style={{ marginTop: '10px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '13px',
                color: '#666'
              }}
            >
              Быстрый выбор времени:
            </label>
            <div
              style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}
            >
              {[9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map((hour) => (
                <button
                  key={hour}
                  type="button"
                  onClick={() => setQuickTime(hour)}
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#3498db';
                    e.target.style.color = 'white';
                    e.target.style.borderColor = '#3498db';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'white';
                    e.target.style.color = '#333';
                    e.target.style.borderColor = '#ddd';
                  }}
                >
                  {hour}:00
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Дополнительные параметры */}
        <div className="form-section">
          <h3 className="form-section-title">Дополнительные параметры</h3>

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="checkbox"
                name="auto_enroll_group_students"
                checked={formData.auto_enroll_group_students}
                onChange={handleChange}
                disabled={!formData.group_id || !!lesson}
              />
              <span>
                Записать всех учеников выбранной группы на это занятие (только
                при создании)
              </span>
            </label>
          </div>

          {lesson && (
            <div className="form-group">
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <input
                  type="checkbox"
                  name="auto_enroll_on_update"
                  checked={formData.auto_enroll_on_update}
                  onChange={handleChange}
                  disabled={!formData.group_id}
                />
                <span>
                  При сохранении добавить всех учеников группы к этому занятию
                </span>
              </label>
              <small
                style={{
                  color: '#666',
                  fontSize: '12px',
                  marginTop: '4px',
                  display: 'block'
                }}
              >
                Будут добавлены только те ученики, которых ещё нет на занятии.
              </small>
            </div>
          )}

          <Input
            label="Максимум учеников *"
            name="max_students"
            type="number"
            min="1"
            max="100"
            value={formData.max_students}
            onChange={handleChange}
            onBlur={handleBlur}
            error={touched.max_students && errors.max_students}
            required
          />

          <div className="form-group">
            <label>Описание занятия</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Краткое описание занятия, тема, план урока..."
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>
        </div>

        <div
          style={{
            padding: '12px',
            backgroundColor: '#e3f2fd',
            borderLeft: '3px solid #2196f3',
            borderRadius: '4px',
            fontSize: '13px',
            marginBottom: '20px'
          }}
        >
          <strong>Примечание:</strong> записи учеников группы в
          «Записи на занятия» создаются автоматически при включённых галочках.
        </div>

        <div
          className="form-actions"
          style={{
            marginTop: '30px',
            paddingTop: '20px',
            borderTop: '1px solid #eee',
            display: 'flex',
            gap: '10px',
            justifyContent: 'flex-end'
          }}
        >
          <Button type="button" variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" variant="primary">
            {lesson ? 'Сохранить изменения' : 'Создать занятие'}
          </Button>
        </div>
      </form>

      <style jsx>{`
        .form-section {
          margin-bottom: 30px;
        }

        .form-section-title {
          margin: 0 0 15px 0;
          padding-bottom: 10px;
          border-bottom: 2px solid #f0f0f0;
          color: #333;
          font-size: 16px;
          font-weight: 600;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }

        .form-group {
          margin-bottom: 15px;
        }

        .form-group label {
          display: block;
          margin-bottom: 6px;
          color: #333;
          font-size: 14px;
          font-weight: 500;
        }

        @media (max-width: 768px) {
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </Modal>
  );
};

export default LessonForm;
