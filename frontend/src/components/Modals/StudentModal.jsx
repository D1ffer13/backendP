// frontend/src/components/Modals/StudentModal.jsx

import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService';

const StudentModal = ({ isOpen, onClose, student, onSave }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    middle_name: '',
    phone: '',
    email: '',
    birth_date: '',
    address: '',
    notes: '',
    status: 'active'
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (student) {
      setFormData({
        first_name: student.first_name || '',
        last_name: student.last_name || '',
        middle_name: student.middle_name || '',
        phone: student.phone || '',
        email: student.email || '',
        birth_date: student.birth_date ? student.birth_date.split('T')[0] : '',
        address: student.address || '',
        notes: student.notes || '',
        status: student.status || 'active'
      });
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        middle_name: '',
        phone: '',
        email: '',
        birth_date: '',
        address: '',
        notes: '',
        status: 'active'
      });
    }
  }, [student, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (student) {
        await studentService.update(student.id, formData);
      } else {
        await studentService.create(formData);
      }
      onSave();
      onClose();
    } catch (error) {
      alert('Ошибка при сохранении: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        maxWidth: '600px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <h2 style={{ marginBottom: '20px' }}>
          {student ? '✏️ Редактировать студента' : '➕ Добавить студента'}
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Фамилия */}
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                Фамилия *
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Имя */}
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                Имя *
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Отчество */}
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                Отчество
              </label>
              <input
                type="text"
                name="middle_name"
                value={formData.middle_name}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Телефон */}
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                Телефон *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="+79001234567"
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>

            {/* Дата рождения */}
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
                Дата рождения
              </label>
              <input
                type="date"
                name="birth_date"
                value={formData.birth_date}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          {/* Адрес */}
          <div style={{ marginTop: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
              Адрес
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '2px solid #e0e0e0',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Примечания */}
          <div style={{ marginTop: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
              Примечания
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              style={{
                width: '100%',
                padding: '10px',
                border: '2px solid #e0e0e0',
                borderRadius: '6px',
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Статус */}
          <div style={{ marginTop: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500' }}>
              Статус
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '2px solid #e0e0e0',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="active">✅ Активен</option>
              <option value="inactive">❌ Неактивен</option>
            </select>
          </div>

          {/* Кнопки */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: loading ? '#95a5a6' : '#3498db',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '15px'
              }}
            >
              {loading ? '⏳ Сохранение...' : '💾 Сохранить'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#95a5a6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '15px'
              }}
            >
              ❌ Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentModal;
