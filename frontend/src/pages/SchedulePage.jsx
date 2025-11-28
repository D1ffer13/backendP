// frontend/src/pages/SchedulePage.jsx

import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaCalendar, FaClock, FaUser } from 'react-icons/fa';

const SchedulePage = () => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('📅 SchedulePage mounted'); // DEBUG
    loadLessons();
  }, []);

  const loadLessons = async () => {
    try {
      setLoading(true);
      // TODO: Заменить на реальный API
      console.log('📚 Loading lessons...'); // DEBUG
      
      // Временные тестовые данные
      const testData = [
        {
          id: 1,
          date: '2024-01-20',
          time: '10:00',
          subject: 'Математика',
          teacher: 'Иванова М.П.',
          students_count: 5
        },
        {
          id: 2,
          date: '2024-01-20',
          time: '12:00',
          subject: 'Физика',
          teacher: 'Петров А.С.',
          students_count: 3
        }
      ];
      
      setLessons(testData);
      console.log('✅ Lessons loaded:', testData); // DEBUG
    } catch (error) {
      console.error('❌ Error loading lessons:', error);
      alert('Ошибка при загрузке расписания');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        ⏳ Загрузка...
      </div>
    );
  }

  return (
    <div>
      {/* Заголовок */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px' 
      }}>
        <h1 style={{ margin: 0 }}>📅 Расписание</h1>
        <button
          onClick={() => alert('Добавление занятия - в разработке')}
          style={{
            padding: '12px 24px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: '600',
            fontSize: '15px'
          }}
        >
          <FaPlus /> Добавить занятие
        </button>
      </div>

      {/* Таблица расписания */}
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '12px', 
        overflow: 'hidden', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>
                <FaCalendar style={{ marginRight: '8px' }} />
                Дата
              </th>
              <th style={{ padding: '12px', textAlign: 'left' }}>
                <FaClock style={{ marginRight: '8px' }} />
                Время
              </th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Предмет</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>
                <FaUser style={{ marginRight: '8px' }} />
                Преподаватель
              </th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Студентов</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {lessons.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                  📭 Занятий не найдено
                </td>
              </tr>
            ) : (
              lessons.map(lesson => (
                <tr key={lesson.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                  <td style={{ padding: '12px' }}>
                    {new Date(lesson.date).toLocaleDateString('ru-RU')}
                  </td>
                  <td style={{ padding: '12px' }}>{lesson.time}</td>
                  <td style={{ padding: '12px', fontWeight: '500' }}>{lesson.subject}</td>
                  <td style={{ padding: '12px' }}>{lesson.teacher}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      backgroundColor: '#e3f2fd',
                      color: '#1976d2'
                    }}>
                      {lesson.students_count}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button
                      onClick={() => alert(`Редактирование занятия ${lesson.id}`)}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#3498db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        marginRight: '8px'
                      }}
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => alert(`Удаление занятия ${lesson.id}`)}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      <FaTrash />
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

export default SchedulePage;
