// frontend/src/pages/AttendancePage.jsx

import React, { useState, useEffect } from 'react';
import { attendanceService } from '../services/attendanceService';
import { FaCheckCircle, FaTimesCircle, FaClock, FaUser, FaBook, FaCalendar } from 'react-icons/fa';

const AttendancePage = () => {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      const data = await attendanceService.getAll();
      setAttendance(data);
    } catch (error) {
      console.error('Error loading attendance:', error);
      alert('Ошибка при загрузке посещаемости');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getStatusConfig = (status) => {
    const configs = {
      'present': { 
        icon: <FaCheckCircle />, 
        color: '#2ecc71', 
        bg: '#d4edda',
        text: '✅ Присутствовал' 
      },
      'absent': { 
        icon: <FaTimesCircle />, 
        color: '#e74c3c', 
        bg: '#f8d7da',
        text: '❌ Отсутствовал' 
      },
      'late': { 
        icon: <FaClock />, 
        color: '#f39c12', 
        bg: '#fff3cd',
        text: '⏰ Опоздал' 
      }
    };
    return configs[status] || { 
      icon: null, 
      color: '#95a5a6', 
      bg: '#e9ecef',
      text: '❓ Не отмечен' 
    };
  };

  const filteredAttendance = attendance.filter(record => {
    if (filterStatus === 'all') return true;
    return record.status === filterStatus;
  });

  // Подсчет статистики
  const stats = {
    total: attendance.length,
    present: attendance.filter(r => r.status === 'present').length,
    absent: attendance.filter(r => r.status === 'absent').length,
    late: attendance.filter(r => r.status === 'late').length
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: '48px', 
            marginBottom: '16px' 
          }}>⏳</div>
          <div style={{ color: '#666' }}>Загрузка посещаемости...</div>
        </div>
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
        <h1 style={{ margin: 0 }}>✅ Посещаемость занятий</h1>
      </div>

      {/* Статистика */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div style={{
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #3498db'
        }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
            Всего записей
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#3498db' }}>
            {stats.total}
          </div>
        </div>

        <div style={{
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #2ecc71'
        }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
            Присутствовали
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#2ecc71' }}>
            {stats.present}
          </div>
          {stats.total > 0 && (
            <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
              {((stats.present / stats.total) * 100).toFixed(1)}%
            </div>
          )}
        </div>

        <div style={{
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #e74c3c'
        }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
            Отсутствовали
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#e74c3c' }}>
            {stats.absent}
          </div>
          {stats.total > 0 && (
            <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
              {((stats.absent / stats.total) * 100).toFixed(1)}%
            </div>
          )}
        </div>

        <div style={{
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderLeft: '4px solid #f39c12'
        }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
            Опоздали
          </div>
          <div style={{ fontSize: '32px', fontWeight: '700', color: '#f39c12' }}>
            {stats.late}
          </div>
          {stats.total > 0 && (
            <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
              {((stats.late / stats.total) * 100).toFixed(1)}%
            </div>
          )}
        </div>
      </div>

      {/* Фильтры */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {[
          { value: 'all', label: '📋 Все', count: stats.total },
          { value: 'present', label: '✅ Присутствовали', count: stats.present },
          { value: 'absent', label: '❌ Отсутствовали', count: stats.absent },
          { value: 'late', label: '⏰ Опоздали', count: stats.late }
        ].map(filter => (
          <button
            key={filter.value}
            onClick={() => setFilterStatus(filter.value)}
            style={{
              padding: '10px 20px',
              backgroundColor: filterStatus === filter.value ? '#3498db' : '#f8f9fa',
              color: filterStatus === filter.value ? 'white' : '#333',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: filterStatus === filter.value ? '600' : '400',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {filter.label}
            <span style={{
              padding: '2px 8px',
              borderRadius: '10px',
              fontSize: '12px',
              backgroundColor: filterStatus === filter.value ? 'rgba(255,255,255,0.3)' : '#e9ecef'
            }}>
              {filter.count}
            </span>
          </button>
        ))}
      </div>

      {/* Таблица посещаемости */}
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '12px', 
        overflow: 'hidden', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
              <th style={{ padding: '14px', textAlign: 'left', fontWeight: '600' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaUser style={{ color: '#3498db' }} /> Студент
                </div>
              </th>
              <th style={{ padding: '14px', textAlign: 'left', fontWeight: '600' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaBook style={{ color: '#9b59b6' }} /> Занятие
                </div>
              </th>
              <th style={{ padding: '14px', textAlign: 'left', fontWeight: '600' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaCalendar style={{ color: '#e67e22' }} /> Дата
                </div>
              </th>
              <th style={{ padding: '14px', textAlign: 'left', fontWeight: '600' }}>
                Время
              </th>
              <th style={{ padding: '14px', textAlign: 'left', fontWeight: '600' }}>
                Преподаватель
              </th>
              <th style={{ padding: '14px', textAlign: 'center', fontWeight: '600' }}>
                Статус
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAttendance.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '60px', textAlign: 'center' }}>
                  <div style={{ fontSize: '64px', marginBottom: '16px' }}>
                    {filterStatus === 'all' ? '📭' : '🔍'}
                  </div>
                  <div style={{ fontSize: '18px', color: '#666', marginBottom: '8px' }}>
                    {filterStatus === 'all' 
                      ? 'Записей посещаемости нет' 
                      : 'Записей с таким статусом не найдено'}
                  </div>
                  <div style={{ fontSize: '14px', color: '#999' }}>
                    {filterStatus !== 'all' && 'Попробуйте изменить фильтр'}
                  </div>
                </td>
              </tr>
            ) : (
              filteredAttendance.map((record, index) => {
                const statusConfig = getStatusConfig(record.status);
                return (
                  <tr 
                    key={record.id} 
                    style={{ 
                      borderBottom: '1px solid #dee2e6',
                      backgroundColor: index % 2 === 0 ? 'white' : '#f8f9fa',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f7ff'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'white' : '#f8f9fa'}
                  >
                    <td style={{ padding: '14px' }}>
                      <div style={{ fontWeight: '500', fontSize: '15px', marginBottom: '4px' }}>
                        {record.student_last_name} {record.student_first_name}
                      </div>
                      {record.student_middle_name && (
                        <div style={{ fontSize: '13px', color: '#666' }}>
                          {record.student_middle_name}
                        </div>
                      )}
                      {record.student_phone && (
                        <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>
                          📞 {record.student_phone}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '14px' }}>
                      <div style={{ fontWeight: '500', fontSize: '15px' }}>
                        {record.lesson_subject}
                      </div>
                    </td>
                    <td style={{ padding: '14px' }}>
                      <div style={{ fontWeight: '500' }}>
                        {formatDate(record.lesson_date)}
                      </div>
                    </td>
                    <td style={{ padding: '14px' }}>
                      <div style={{ fontSize: '14px', color: '#666' }}>
                        {record.start_time}
                      </div>
                    </td>
                    <td style={{ padding: '14px' }}>
                      <div style={{ fontSize: '14px' }}>
                        {record.teacher_last_name} {record.teacher_first_name}
                      </div>
                    </td>
                    <td style={{ padding: '14px', textAlign: 'center' }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        backgroundColor: statusConfig.bg,
                        color: statusConfig.color,
                        fontWeight: '500',
                        fontSize: '14px'
                      }}>
                        <span style={{ fontSize: '16px' }}>
                          {statusConfig.icon}
                        </span>
                        {statusConfig.text}
                      </div>
                      {record.notes && (
                        <div style={{ 
                          marginTop: '8px', 
                          fontSize: '12px', 
                          color: '#666',
                          fontStyle: 'italic' 
                        }}>
                          💬 {record.notes}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendancePage;
