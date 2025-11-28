// frontend/src/components/students/StudentCard.jsx

import React from 'react';
import { FaEdit, FaTrash, FaPhone, FaEnvelope, FaMapMarkerAlt, FaBirthdayCake, FaWallet } from 'react-icons/fa';
import { formatDate, formatPhone, formatFullName, formatCurrency } from '../../utils/formatters';

const STATUS_LABELS = {
  'active': 'Активный',
  'selecting_group': 'Подбираем группу',
  'on_vacation': 'В отпуске',
  'studying_elsewhere': 'Занимается в другом центре',
  'dissatisfied': 'Недоволен',
  'not_interested': 'Не хочет продолжать',
  'moved': 'Переехал',
  'archived': 'В архиве'
};

const STATUS_COLORS = {
  'active': '#27ae60',
  'selecting_group': '#f39c12',
  'on_vacation': '#3498db',
  'studying_elsewhere': '#9b59b6',
  'dissatisfied': '#e74c3c',
  'not_interested': '#95a5a6',
  'moved': '#7f8c8d',
  'archived': '#34495e'
};

const GENDER_LABELS = {
  'male': 'Мужской',
  'female': 'Женский',
  'other': 'Другой'
};

const StudentCard = ({ student, onEdit, onDelete }) => {
  const handleEdit = () => {
    onEdit(student);
  };

  const handleDelete = () => {
    onDelete(student);
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      transition: 'transform 0.2s, box-shadow 0.2s',
      cursor: 'pointer',
      position: 'relative',
      border: '1px solid #f0f0f0'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
    }}>
      
      {/* Заголовок карточки */}
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
            margin: 0, 
            fontSize: '18px', 
            fontWeight: '600',
            color: '#2c3e50',
            marginBottom: '8px'
          }}>
            {formatFullName(student.first_name, student.last_name, student.middle_name)}
          </h3>
          
          {/* Статус */}
          <span style={{
            display: 'inline-block',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '500',
            backgroundColor: (STATUS_COLORS[student.status] || '#95a5a6') + '20',
            color: STATUS_COLORS[student.status] || '#95a5a6'
          }}>
            {STATUS_LABELS[student.status] || student.status}
          </span>
        </div>

        {/* Кнопки действий */}
        <div style={{ display: 'flex', gap: '5px' }}>
          <button
            onClick={handleEdit}
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
            onClick={handleDelete}
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

      {/* Контактная информация */}
      <div style={{ marginBottom: '15px' }}>
        {student.phone && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            marginBottom: '8px',
            fontSize: '14px'
          }}>
            <FaPhone style={{ color: '#3498db', fontSize: '14px' }} />
            <div>
              <div style={{ fontWeight: '500' }}>{formatPhone(student.phone)}</div>
              {student.phone_comment && (
                <div style={{ fontSize: '12px', color: '#7f8c8d', marginTop: '2px' }}>
                  {student.phone_comment}
                </div>
              )}
            </div>
          </div>
        )}

        {student.email && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            marginBottom: '8px',
            fontSize: '14px'
          }}>
            <FaEnvelope style={{ color: '#e74c3c', fontSize: '14px' }} />
            <span style={{ 
              wordBreak: 'break-word',
              color: '#555'
            }}>
              {student.email}
            </span>
          </div>
        )}
      </div>

      {/* Дополнительная информация */}
      <div style={{ 
        display: 'grid',
        gap: '10px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        fontSize: '13px'
      }}>
        {student.birth_date && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FaBirthdayCake style={{ color: '#f39c12', fontSize: '14px' }} />
            <span style={{ color: '#666' }}>Дата рождения:</span>
            <span style={{ fontWeight: '500', color: '#2c3e50' }}>{formatDate(student.birth_date)}</span>
          </div>
        )}

        {student.gender && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#666' }}>Пол:</span>
            <span style={{ fontWeight: '500', color: '#2c3e50' }}>
              {GENDER_LABELS[student.gender] || student.gender}
            </span>
          </div>
        )}

        {student.address && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <FaMapMarkerAlt style={{ color: '#e74c3c', fontSize: '14px', marginTop: '2px' }} />
            <div>
              <div style={{ color: '#666', marginBottom: '2px' }}>Адрес:</div>
              <div style={{ fontWeight: '500', color: '#2c3e50', fontSize: '12px' }}>
                {student.address}
              </div>
            </div>
          </div>
        )}

        {/* Баланс */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          paddingTop: '10px',
          marginTop: '10px',
          borderTop: '1px solid #dee2e6'
        }}>
          <FaWallet style={{ 
            color: student.balance < 0 ? '#e74c3c' : student.balance > 0 ? '#27ae60' : '#95a5a6',
            fontSize: '14px' 
          }} />
          <span style={{ color: '#666' }}>Баланс:</span>
          <span style={{ 
            fontWeight: '600',
            fontSize: '15px',
            color: student.balance < 0 ? '#e74c3c' : student.balance > 0 ? '#27ae60' : '#95a5a6'
          }}>
            {formatCurrency(student.balance)}
          </span>
        </div>
      </div>

      {/* Комментарий */}
      {student.comment && (
        <div style={{ 
          marginTop: '15px',
          padding: '12px',
          backgroundColor: '#fff3cd',
          borderLeft: '3px solid #ffc107',
          borderRadius: '4px',
          fontSize: '13px'
        }}>
          <div style={{ fontWeight: '500', color: '#856404', marginBottom: '4px' }}>
            Комментарий:
          </div>
          <div style={{ color: '#856404', lineHeight: '1.5' }}>
            {student.comment.length > 100 
              ? student.comment.substring(0, 100) + '...' 
              : student.comment}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentCard;
