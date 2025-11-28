// frontend/src/pages/TeachersPage.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { teacherService } from '../services/teacherService';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaPhone,
  FaEnvelope,
  FaCogs
} from 'react-icons/fa';

const TeachersPage = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      const data = await teacherService.getAll();
      setTeachers(data);
    } catch (error) {
      console.error('Error loading teachers:', error);
      alert('Ошибка при загрузке преподавателей');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        Загрузка...
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}
      >
        <h1 style={{ margin: 0 }}>Преподаватели</h1>
        <button
          style={{
            padding: '12px 24px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <FaPlus /> Добавить преподавателя
        </button>
      </div>

      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr
              style={{
                backgroundColor: '#f8f9fa',
                borderBottom: '2px solid #dee2e6'
              }}
            >
              <th style={{ padding: '12px', textAlign: 'left' }}>ФИО</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Телефон</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Статус</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {teachers.map((teacher) => (
              <tr
                key={teacher.id}
                style={{ borderBottom: '1px solid #dee2e6' }}
              >
                <td style={{ padding: '12px' }}>
                  {teacher.last_name} {teacher.first_name}{' '}
                  {teacher.middle_name}
                </td>
                <td style={{ padding: '12px' }}>
                  <FaPhone style={{ marginRight: '8px', color: '#666' }} />
                  {teacher.phone}
                </td>
                <td style={{ padding: '12px' }}>
                  {teacher.email && (
                    <>
                      <FaEnvelope
                        style={{ marginRight: '8px', color: '#666' }}
                      />
                      {teacher.email}
                    </>
                  )}
                </td>
                <td style={{ padding: '12px' }}>
                  <span
                    style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      backgroundColor:
                        teacher.status === 'active' ? '#d4edda' : '#f8d7da',
                      color:
                        teacher.status === 'active' ? '#155724' : '#721c24'
                    }}
                  >
                    {teacher.status === 'active' ? 'Активен' : 'Неактивен'}
                  </span>
                </td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <button
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
                    onClick={() => navigate(`/teachers/${teacher.id}`)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#6c5ce7',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <FaCogs /> Настроить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeachersPage;
