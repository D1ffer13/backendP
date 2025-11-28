// frontend/src/components/teachers/TeacherForm.jsx

import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { subjectService } from '../../services/subjectService';
import { teacherService } from '../../services/teacherService';

const TeacherForm = ({ isOpen, onClose, onSaved, teacher }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    middle_name: '',
    phone: '',
    email: '',
    specialization: '',
    notes: '',
    status: 'active'
  });

  const [errors, setErrors] = useState({});

  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  // Подгружаем предметы при открытии модалки
  useEffect(() => {
    if (!isOpen) return;
    loadSubjects();
  }, [isOpen]);

  const loadSubjects = async () => {
    try {
      setLoadingSubjects(true);
      const data = await subjectService.getAll();
      setSubjects(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Error loading subjects:', e);
      setSubjects([]);
    } finally {
      setLoadingSubjects(false);
    }
  };

  // Заполняем форму и отмечаем предметы педагога
  useEffect(() => {
    if (teacher) {
      setFormData({
        first_name: teacher.first_name || '',
        last_name: teacher.last_name || '',
        middle_name: teacher.middle_name || '',
        phone: teacher.phone || '',
        email: teacher.email || '',
        specialization: teacher.specialization || '',
        notes: teacher.notes || '',
        status: teacher.status || 'active'
      });

      (async () => {
        try {
          const ts = await teacherService.getSubjects(teacher.id);
          const ids = Array.isArray(ts) ? ts.map((s) => s.id) : [];
          setSelectedSubjectIds(ids);
        } catch (e) {
          console.error('Error loading teacher subjects:', e);
          setSelectedSubjectIds([]);
        }
      })();
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        middle_name: '',
        phone: '',
        email: '',
        specialization: '',
        notes: '',
        status: 'active'
      });
      setSelectedSubjectIds([]);
    }
    setErrors({});
  }, [teacher, isOpen]);

  const validate = () => {
    const e = {};
    if (!formData.last_name.trim()) e.last_name = 'Фамилия обязательна';
    if (!formData.first_name.trim()) e.first_name = 'Имя обязательно';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (evt) => {
    const { name, value } = evt.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubjectToggle = (subjectId) => {
    setSelectedSubjectIds((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    if (!validate()) return;

    try {
      let savedTeacher;
      if (teacher) {
        savedTeacher = await teacherService.update(teacher.id, formData);
      } else {
        savedTeacher = await teacherService.create(formData);
      }

      await teacherService.setSubjects(savedTeacher.id, selectedSubjectIds);

      if (onSaved) onSaved();
      onClose();
    } catch (e) {
      console.error('Error saving teacher:', e);
      alert(
        e.response?.data?.error || 'Ошибка при сохранении педагога и предметов'
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={teacher ? 'Редактировать педагога' : 'Добавить педагога'}
    >
      <form onSubmit={handleSubmit} style={{ padding: '10px 0' }}>
        <div className="form-row">
          <Input
            label="Фамилия *"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            error={errors.last_name}
          />
          <Input
            label="Имя *"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            error={errors.first_name}
          />
        </div>

        <Input
          label="Отчество"
          name="middle_name"
          value={formData.middle_name}
          onChange={handleChange}
        />

        <Input
          label="Специализация (общий текст)"
          name="specialization"
          value={formData.specialization}
          onChange={handleChange}
          placeholder="Например: Математика, Английский язык"
        />

        <div className="form-row">
          <Input
            label="Телефон"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+7 (999) 123-45-67"
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>

        <Input
          label="Примечания"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
        />

        <div className="form-group" style={{ marginTop: '10px' }}>
          <label>Статус</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '8px 10px',
              borderRadius: '6px',
              border: '1px solid #ddd',
              fontSize: '14px',
              backgroundColor: 'white'
            }}
          >
            <option value="active">Активен</option>
            <option value="inactive">Неактивен</option>
          </select>
        </div>

        {/* Блок выбора предметов */}
        <div
          className="form-group"
          style={{
            marginTop: '15px',
            padding: '12px 14px',
            borderRadius: '6px',
            border: '1px solid #e0e0e0',
            maxHeight: '240px',
            overflowY: 'auto',
            backgroundColor: '#fafafa'
          }}
        >
          <label
            style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 500,
              fontSize: '14px',
              color: '#333'
            }}
          >
            Предметы педагога
          </label>

          {loadingSubjects ? (
            <div style={{ fontSize: '13px', color: '#666' }}>
              Загрузка предметов...
            </div>
          ) : subjects.length === 0 ? (
            <div style={{ fontSize: '13px', color: '#666' }}>
              Список предметов пуст. Добавьте предметы в разделе «Предметы».
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                rowGap: '6px',
                columnGap: '8px',
                alignItems: 'center',
                fontSize: '14px'
              }}
            >
              {subjects.map((s) => (
                <React.Fragment key={s.id}>
                  <input
                    type="checkbox"
                    checked={selectedSubjectIds.includes(s.id)}
                    onChange={() => handleSubjectToggle(s.id)}
                    style={{
                      width: 16,
                      height: 16,
                      margin: 0,
                      cursor: 'pointer',
                      justifySelf: 'center'
                    }}
                  />
                  <span
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {s.name}
                  </span>
                </React.Fragment>
              ))}
            </div>
          )}
        </div>

        <div
          className="form-actions"
          style={{
            marginTop: '20px',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px'
          }}
        >
          <Button type="button" variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" variant="primary">
            {teacher ? 'Сохранить' : 'Добавить'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TeacherForm;
