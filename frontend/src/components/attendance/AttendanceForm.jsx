import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { FaCheck, FaTimes } from 'react-icons/fa';

const AttendanceForm = ({ isOpen, onClose, onSubmit, enrollment, initialData }) => {
  const [formData, setFormData] = useState({
    attended: null,
    notes: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        attended: initialData.attended,
        notes: initialData.notes || ''
      });
    } else {
      setFormData({
        attended: null,
        notes: ''
      });
    }
  }, [initialData, isOpen]);

  const handleAttendanceChange = (attended) => {
    setFormData(prev => ({
      ...prev,
      attended: attended
    }));
  };

  const handleNotesChange = (e) => {
    setFormData(prev => ({
      ...prev,
      notes: e.target.value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.attended === null) {
      alert('Пожалуйста, отметьте посещаемость');
      return;
    }

    onSubmit(formData);
  };

  if (!enrollment) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Отметить посещаемость"
    >
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <p style={{ fontWeight: '600', marginBottom: '10px' }}>
            Ученик: {enrollment.student_name}
          </p>
          {enrollment.student_phone && (
            <p style={{ color: '#666', fontSize: '14px' }}>
              Телефон: {enrollment.student_phone}
            </p>
          )}
        </div>

        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: '500' }}>
            Посещаемость <span style={{ color: 'red' }}>*</span>
          </label>
          <div style={{ display: 'flex', gap: '15px' }}>
            <button
              type="button"
              onClick={() => handleAttendanceChange(true)}
              style={{
                flex: 1,
                padding: '15px',
                border: formData.attended === true ? '3px solid #27ae60' : '2px solid #e0e0e0',
                backgroundColor: formData.attended === true ? '#d4edda' : 'white',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.2s',
                fontSize: '16px'
              }}
            >
              <FaCheck 
                style={{ 
                  fontSize: '32px', 
                  color: formData.attended === true ? '#27ae60' : '#95a5a6' 
                }} 
              />
              <span style={{ 
                fontWeight: formData.attended === true ? '600' : '400',
                color: formData.attended === true ? '#27ae60' : '#333'
              }}>
                Присутствовал
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleAttendanceChange(false)}
              style={{
                flex: 1,
                padding: '15px',
                border: formData.attended === false ? '3px solid #e74c3c' : '2px solid #e0e0e0',
                backgroundColor: formData.attended === false ? '#f8d7da' : 'white',
                borderRadius: '12px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.2s',
                fontSize: '16px'
              }}
            >
              <FaTimes 
                style={{ 
                  fontSize: '32px', 
                  color: formData.attended === false ? '#e74c3c' : '#95a5a6' 
                }} 
              />
              <span style={{ 
                fontWeight: formData.attended === false ? '600' : '400',
                color: formData.attended === false ? '#e74c3c' : '#333'
              }}>
                Отсутствовал
              </span>
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>Примечания</label>
          <textarea
            value={formData.notes}
            onChange={handleNotesChange}
            rows="4"
            placeholder="Причина отсутствия или дополнительная информация..."
            style={{
              width: '100%',
              padding: '10px',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
        </div>

        <div className="form-actions">
          <Button type="button" variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" variant="primary">
            Сохранить
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AttendanceForm;