// frontend/src/components/attendance/RescheduleLessonModal.jsx

import React, { useEffect, useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Input from '../common/Input';
import { attendanceService } from '../../services/attendanceService';
import { formatDate, formatTime } from '../../utils/formatters';

const RescheduleLessonModal = ({ isOpen, onClose, lesson }) => {
  const [form, setForm] = useState({
    new_date: '',
    new_start_time: '',
    new_end_time: '',
    reason: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && lesson) {
      const dateStr = lesson.lesson_date
        ? lesson.lesson_date.split('T')[0] || lesson.lesson_date
        : lesson.lesson_date;
      setForm({
        new_date: dateStr || '',
        new_start_time: lesson.start_time
          ? lesson.start_time.substring(0, 5)
          : '',
        new_end_time: lesson.end_time ? lesson.end_time.substring(0, 5) : '',
        reason: lesson.reschedule_reason || ''
      });
    }
  }, [isOpen, lesson]);

  if (!isOpen || !lesson) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.new_date || !form.new_start_time || !form.new_end_time) {
      alert('Заполните дату и время урока');
      return;
    }

    try {
      setSaving(true);
      await attendanceService.rescheduleLesson(lesson.id, form);
      alert('Урок успешно перенесён');
      onClose(true);
    } catch (err) {
      console.error('Error rescheduling lesson:', err);
      const msg =
        err.response?.data?.error || 'Ошибка при переносе урока';
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => onClose(false)}
      title="Перенести урок"
    >
      <form onSubmit={handleSubmit} style={{ padding: '10px 0' }}>
        <div style={{ marginBottom: '10px', fontSize: '14px', color: '#555' }}>
          <div>
            <strong>Текущая дата:</strong>{' '}
            {lesson.lesson_date ? formatDate(lesson.lesson_date) : '—'}
          </div>
          <div>
            <strong>Текущее время:</strong>{' '}
            {formatTime(lesson.start_time)} – {formatTime(lesson.end_time)}
          </div>
        </div>

        <Input
          label="Новая дата *"
          name="new_date"
          type="date"
          value={form.new_date}
          onChange={handleChange}
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '10px'
          }}
        >
          <Input
            label="Новое время начала *"
            name="new_start_time"
            type="time"
            value={form.new_start_time}
            onChange={handleChange}
          />
          <Input
            label="Новое время окончания *"
            name="new_end_time"
            type="time"
            value={form.new_end_time}
            onChange={handleChange}
          />
        </div>

        <div style={{ marginTop: '10px' }}>
          <label
            style={{
              display: 'block',
              marginBottom: '4px',
              fontSize: '14px',
              fontWeight: 500
            }}
          >
            Причина переноса
          </label>
          <textarea
            name="reason"
            value={form.reason}
            onChange={handleChange}
            rows={3}
            placeholder="Например: ученик заболел, перенос по просьбе родителей и т.п."
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '6px',
              border: '1px solid #ddd',
              fontSize: '14px',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
          />
        </div>

        <div
          style={{
            marginTop: '16px',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px'
          }}
        >
          <Button
            type="button"
            variant="secondary"
            onClick={() => onClose(false)}
            disabled={saving}
          >
            Отмена
          </Button>
          <Button type="submit" variant="primary" disabled={saving}>
            Сохранить
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default RescheduleLessonModal;
