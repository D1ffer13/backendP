// frontend/src/components/lessons/LessonCard.jsx

import React from 'react';
import { FaEdit, FaTrash, FaEye, FaClock, FaCalendarAlt, FaUsers, FaChalkboardTeacher } from 'react-icons/fa';
import { formatDate, formatTime, formatFullName } from '../../utils/formatters';

const LessonCard = ({ lesson, onEdit, onDelete, onViewDetails }) => {
  const getStatusStyle = (status) => {
    switch (status) {
      case 'scheduled':
        return { bg: '#d4edda', color: '#155724', label: 'Запланировано' };
      case 'completed':
        return { bg: '#d1ecf1', color: '#0c5460', label: 'Завершено' };
      case 'cancelled':
        return { bg: '#f8d7da', color: '#721c24', label: 'Отменено' };
      default:
        return { bg: '#e2e3e5', color: '#383d41', label: status };
    }
  };

  const statusStyle = getStatusStyle(lesson.status);

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      transition: 'all 0.2s',
      border: '1px solid #f0f0f0',
      position: 'relative'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
    }}>
      
      {/* Заголовок */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '15px',
        paddingBottom: '15px',
        borderBottom: '2px solid #f5f5f5'
      }}>
        <div style={{ flex: 1 }}>
          <h3 style={{
            margin: '0 0 8px 0',
            fontSize: '18px',
            fontWeight: '600',
            color: '#2c3e50'
          }}>
            {lesson.subject}
          </h3>
          
          <span style={{
            display: 'inline-block',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '500',
            backgroundColor: statusStyle.bg,
            color: statusStyle.color
          }}>
            {statusStyle.label}
          </span>
        </div>

        {/* Кнопки действий */}
        <div style={{ display: 'flex', gap: '5px' }}>
          <button
            onClick={() => onViewDetails(lesson)}
            style={{
              padding: '8px',
              backgroundColor: '#9b59b6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#8e44ad'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#9b59b6'}
            title="Подробнее"
          >
            <FaEye size={14} />
          </button>
          <button
            onClick={() => onEdit(lesson)}
            style={{
              padding: '8px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2980b9'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3498db'}
            title="Редактировать"
          >
            <FaEdit size={14} />
          </button>
          <button
            onClick={() => onDelete(lesson)}
            style={{
              padding: '8px',
              backgroundColor: '#e74c3c',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#c0392b'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#e74c3c'}
            title="Удалить"
          >
            <FaTrash size={14} />
          </button>
        </div>
      </div>

      {/* Основная информация */}
      <div style={{
        display: 'grid',
        gap: '12px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        fontSize: '14px'
      }}>
        {/* Дата */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaCalendarAlt style={{ color: '#3498db', fontSize: '16px' }} />
          <div>
            <div style={{ color: '#666', fontSize: '12px' }}>Дата</div>
            <div style={{ fontWeight: '600', color: '#2c3e50' }}>
              {formatDate(lesson.lesson_date)}
            </div>
          </div>
        </div>

        {/* Время */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaClock style={{ color: '#e67e22', fontSize: '16px' }} />
          <div>
            <div style={{ color: '#666', fontSize: '12px' }}>Время</div>
            <div style={{ fontWeight: '600', color: '#2c3e50' }}>
              {formatTime(lesson.start_time)} - {formatTime(lesson.end_time)}
            </div>
          </div>
        </div>

        {/* Педагог */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaChalkboardTeacher style={{ color: '#9b59b6', fontSize: '16px' }} />
          <div>
            <div style={{ color: '#666', fontSize: '12px' }}>Педагог</div>
            <div style={{ fontWeight: '600', color: '#2c3e50' }}>
              {formatFullName(
                lesson.teacher_first_name,
                lesson.teacher_last_name,
                lesson.teacher_middle_name
              )}
            </div>
          </div>
        </div>

        {/* Записано студентов */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaUsers style={{ color: '#27ae60', fontSize: '16px' }} />
          <div>
            <div style={{ color: '#666', fontSize: '12px' }}>Записано</div>
            <div style={{ fontWeight: '600', color: '#2c3e50' }}>
              {lesson.enrolled_count || 0} / {lesson.max_students}
            </div>
          </div>
        </div>
      </div>

      {/* Описание (если есть) */}
      {lesson.description && (
        <div style={{
          marginTop: '15px',
          padding: '12px',
          backgroundColor: '#fff3cd',
          borderLeft: '3px solid #ffc107',
          borderRadius: '4px',
          fontSize: '13px'
        }}>
          <div style={{ fontWeight: '500', color: '#856404', marginBottom: '4px' }}>
            Описание:
          </div>
          <div style={{ color: '#856404', lineHeight: '1.5' }}>
            {lesson.description.length > 100
              ? lesson.description.substring(0, 100) + '...'
              : lesson.description}
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonCard;
