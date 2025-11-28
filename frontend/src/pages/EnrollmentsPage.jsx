// frontend/src/pages/EnrollmentsPage.jsx

import React, { useState, useEffect } from 'react';
import { enrollmentService } from '../services/enrollmentService';
import { FaPlus, FaCalendar, FaUser, FaBook } from 'react-icons/fa';

const EnrollmentsPage = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEnrollments();
  }, []);

  const loadEnrollments = async () => {
    try {
      setLoading(true);
      const data = await enrollmentService.getAll();
      setEnrollments(data);
    } catch (error) {
      console.error('Error loading enrollments:', error);
      alert('Ошибка при загрузке записей');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Загрузка...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>📝 Записи на занятия</h1>
        <button
          onClick={() => alert('Форма записи будет добавлена позже')}
          style={{
            padding: '12px 24px',
            backgroundColor: '#2ecc71',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: '500'
          }}
        >
          <FaPlus /> Записать на занятие
        </button>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaUser /> Студент
                </div>
              </th>
              <th style={{ padding: '12px', textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaBook /> Занятие
                </div>
              </th>
              <th style={{ padding: '12px', textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaCalendar /> Дата занятия
                </div>
              </th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Время</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Статус</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
                  <div>Записей не найдено</div>
                </td>
              </tr>
            ) : (
              enrollments.map(enrollment => (
                <tr key={enrollment.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: '500' }}>
                      {enrollment.student_last_name} {enrollment.student_first_name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {enrollment.student_phone}
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: '500' }}>{enrollment.lesson_subject}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {enrollment.teacher_last_name} {enrollment.teacher_first_name}
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {formatDate(enrollment.lesson_date)}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {enrollment.start_time} - {enrollment.end_time}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor: enrollment.status === 'enrolled' ? '#d4edda' : '#f8d7da',
                      color: enrollment.status === 'enrolled' ? '#155724' : '#721c24'
                    }}>
                      {enrollment.status === 'enrolled' ? '✅ Записан' : '❌ Отменено'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button
                      onClick={async () => {
                        if (window.confirm('Отменить запись?')) {
                          try {
                            await enrollmentService.update(enrollment.id, { status: 'cancelled' });
                            loadEnrollments();
                          } catch (error) {
                            alert('Ошибка при отмене записи');
                          }
                        }
                      }}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Отменить
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EnrollmentsPage;
