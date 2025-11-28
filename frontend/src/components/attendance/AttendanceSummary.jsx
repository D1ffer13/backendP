import React, { useState, useEffect } from 'react';
import { FaChartLine, FaCalendarCheck, FaUsers } from 'react-icons/fa';
import Modal from '../common/Modal';
import { attendanceService } from '../../services/attendanceService';
import { studentService } from '../../services/studentService';
import { formatFullName, formatPercent, formatDate } from '../../utils/formatters';

const AttendanceSummary = ({ studentId, onClose }) => {
  const [student, setStudent] = useState(null);
  const [stats, setStats] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (studentId) {
      loadData();
    }
  }, [studentId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [studentData, statsData, historyData] = await Promise.all([
        studentService.getById(studentId),
        attendanceService.getStudentStats(studentId),
        attendanceService.getAll({ student_id: studentId })
      ]);
      
      setStudent(studentData);
      setStats(statsData);
      setAttendanceHistory(historyData);
    } catch (error) {
      console.error('Error loading student attendance summary:', error);
      alert('Ошибка при загрузке данных');
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceColor = (rate) => {
    if (rate >= 90) return '#27ae60';
    if (rate >= 80) return '#2ecc71';
    if (rate >= 70) return '#f39c12';
    if (rate >= 60) return '#e67e22';
    return '#e74c3c';
  };

  const getAttendanceGrade = (rate) => {
    if (rate >= 95) return { grade: 'A+', text: 'Отлично!' };
    if (rate >= 90) return { grade: 'A', text: 'Очень хорошо' };
    if (rate >= 85) return { grade: 'B+', text: 'Хорошо' };
    if (rate >= 80) return { grade: 'B', text: 'Хорошо' };
    if (rate >= 75) return { grade: 'C+', text: 'Удовлетворительно' };
    if (rate >= 70) return { grade: 'C', text: 'Удовлетворительно' };
    if (rate >= 60) return { grade: 'D', text: 'Требует внимания' };
    return { grade: 'F', text: 'Неудовлетворительно' };
  };

  if (loading) {
    return (
      <Modal isOpen={true} onClose={onClose} title="Загрузка...">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </Modal>
    );
  }

  if (!student || !stats) {
    return null;
  }

  const gradeInfo = getAttendanceGrade(stats.attendance_rate || 0);
  const attendanceColor = getAttendanceColor(stats.attendance_rate || 0);

  return (
    <Modal 
      isOpen={true} 
      onClose={onClose} 
      title="Сводка посещаемости"
    >
      <div style={{ minHeight: '400px' }}>
        {/* Информация об ученике */}
        <div style={{ 
          marginBottom: '25px', 
          padding: '20px', 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '12px',
          color: 'white'
        }}>
          <h3 style={{ marginBottom: '10px', fontSize: '22px' }}>
            {formatFullName(student.first_name, student.last_name, student.middle_name)}
          </h3>
          {student.phone && (
            <p style={{ opacity: 0.9 }}>📞 {student.phone}</p>
          )}
          {student.email && (
            <p style={{ opacity: 0.9 }}>✉️ {student.email}</p>
          )}
        </div>

        {/* Основная статистика */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '15px',
          marginBottom: '30px'
        }}>
          <div style={{ 
            padding: '20px', 
            backgroundColor: '#e3f2fd', 
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <FaCalendarCheck style={{ fontSize: '28px', color: '#3498db', marginBottom: '10px' }} />
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#2c3e50', marginBottom: '5px' }}>
              {stats.total_lessons || 0}
            </p>
            <p style={{ color: '#666', fontSize: '14px' }}>Всего занятий</p>
          </div>

          <div style={{ 
            padding: '20px', 
            backgroundColor: '#d4edda',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <FaUsers style={{ fontSize: '28px', color: '#27ae60', marginBottom: '10px' }} />
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#2c3e50', marginBottom: '5px' }}>
              {stats.attended_lessons || 0}
            </p>
            <p style={{ color: '#666', fontSize: '14px' }}>Посещено</p>
          </div>

          <div style={{ 
            padding: '20px', 
            backgroundColor: attendanceColor === '#27ae60' ? '#d4edda' : 
                           attendanceColor === '#f39c12' ? '#fff3cd' : '#f8d7da',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <FaChartLine style={{ fontSize: '28px', color: attendanceColor, marginBottom: '10px' }} />
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#2c3e50', marginBottom: '5px' }}>
              {formatPercent(stats.attendance_rate || 0)}
            </p>
            <p style={{ color: '#666', fontSize: '14px' }}>Посещаемость</p>
          </div>
        </div>

        {/* Оценка */}
        <div style={{
          padding: '25px',
          backgroundColor: attendanceColor,
          color: 'white',
          borderRadius: '12px',
          textAlign: 'center',
          marginBottom: '30px'
        }}>
          <p style={{ fontSize: '18px', marginBottom: '10px', opacity: 0.9 }}>
            Оценка посещаемости
          </p>
          <p style={{ fontSize: '56px', fontWeight: 'bold', marginBottom: '5px' }}>
            {gradeInfo.grade}
          </p>
          <p style={{ fontSize: '20px' }}>
            {gradeInfo.text}
          </p>
        </div>

        {/* Детальная разбивка */}
        <div style={{ marginBottom: '30px' }}>
          <h4 style={{ marginBottom: '15px', color: '#2c3e50' }}>Детальная статистика</h4>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(3, 1fr)', 
            gap: '10px'
          }}>
            <div style={{ 
              padding: '15px', 
              border: '2px solid #27ae60',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#27ae60' }}>
                {stats.attended_lessons || 0}
              </p>
              <p style={{ fontSize: '13px', color: '#666' }}>✅ Присутствовал</p>
            </div>

            <div style={{ 
              padding: '15px', 
              border: '2px solid #e74c3c',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#e74c3c' }}>
                {stats.missed_lessons || 0}
              </p>
              <p style={{ fontSize: '13px', color: '#666' }}>❌ Отсутствовал</p>
            </div>

            <div style={{ 
              padding: '15px', 
              border: '2px solid #95a5a6',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#95a5a6' }}>
                {(stats.total_lessons || 0) - (stats.attended_lessons || 0) - (stats.missed_lessons || 0)}
              </p>
              <p style={{ fontSize: '13px', color: '#666' }}>⏳ Не отмечено</p>
            </div>
          </div>
        </div>

        {/* Прогресс-бар */}
        <div style={{ marginBottom: '30px' }}>
          <p style={{ marginBottom: '10px', fontWeight: '600', color: '#2c3e50' }}>
            Визуальное представление
          </p>
          <div style={{
            width: '100%',
            height: '40px',
            backgroundColor: '#e0e0e0',
            borderRadius: '20px',
            overflow: 'hidden',
            display: 'flex'
          }}>
            {stats.attended_lessons > 0 && (
              <div 
                style={{
                  width: `${(stats.attended_lessons / stats.total_lessons) * 100}%`,
                  backgroundColor: '#27ae60',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  transition: 'width 0.5s ease'
                }}
                title={`Посещено: ${stats.attended_lessons}`}
              >
                {stats.attended_lessons > 0 && stats.attended_lessons}
              </div>
            )}
            {stats.missed_lessons > 0 && (
              <div 
                style={{
                  width: `${(stats.missed_lessons / stats.total_lessons) * 100}%`,
                  backgroundColor: '#e74c3c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  transition: 'width 0.5s ease'
                }}
                title={`Пропущено: ${stats.missed_lessons}`}
              >
                {stats.missed_lessons > 0 && stats.missed_lessons}
              </div>
            )}
          </div>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginTop: '10px',
            fontSize: '12px',
            color: '#666'
          }}>
            <span>🟢 Посещено ({formatPercent((stats.attended_lessons / stats.total_lessons) * 100)})</span>
            <span>🔴 Пропущено ({formatPercent((stats.missed_lessons / stats.total_lessons) * 100)})</span>
          </div>
        </div>

        {/* История посещаемости (последние 5 занятий) */}
        {attendanceHistory.length > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ marginBottom: '15px', color: '#2c3e50' }}>
              Последние занятия
            </h4>
            <div style={{ 
              border: '1px solid #e0e0e0', 
              borderRadius: '8px', 
              overflow: 'hidden',
              maxHeight: '200px',
              overflowY: 'auto'
            }}>
              {attendanceHistory.slice(0, 5).map((record, index) => (
                <div
                  key={index}
                  style={{
                    padding: '12px 15px',
                    borderBottom: index < 4 ? '1px solid #e0e0e0' : 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white'
                  }}
                >
                  <div>
                    <p style={{ fontWeight: '500', marginBottom: '3px' }}>
                      {record.lesson_subject}
                    </p>
                    <p style={{ fontSize: '12px', color: '#666' }}>
                      {formatDate(record.lesson_date)}
                    </p>
                  </div>
                  <div>
                    {record.attended === 1 ? (
                      <span style={{
                        padding: '5px 12px',
                        backgroundColor: '#d4edda',
                        color: '#155724',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        ✅ Присутствовал
                      </span>
                    ) : record.attended === 0 ? (
                      <span style={{
                        padding: '5px 12px',
                        backgroundColor: '#f8d7da',
                        color: '#721c24',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        ❌ Отсутствовал
                      </span>
                    ) : (
                      <span style={{
                        padding: '5px 12px',
                        backgroundColor: '#e0e0e0',
                        color: '#666',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        ⏳ Не отмечено
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Рекомендации */}
        {stats.attendance_rate < 70 && (
          <div className="alert alert-error">
            <p><strong>⚠️ Требуется внимание!</strong></p>
            <p>
              {stats.attendance_rate < 50 
                ? 'Критически низкая посещаемость. Необходимо срочно связаться с родителями и выяснить причины.'
                : 'Посещаемость ниже нормы. Рекомендуется обсудить с родителями причины пропусков.'}
            </p>
          </div>
        )}

        {stats.attendance_rate >= 70 && stats.attendance_rate < 85 && (
          <div className="alert alert-info">
            <p><strong>💡 Рекомендация:</strong></p>
            <p>Посещаемость удовлетворительная, но есть потенциал для улучшения.</p>
          </div>
        )}

        {stats.attendance_rate >= 90 && (
          <div className="alert alert-success">
            <p><strong>🌟 Отлично!</strong></p>
            <p>Ученик демонстрирует превосходную посещаемость. Так держать!</p>
          </div>
        )}

        <div className="form-actions" style={{ marginTop: '20px' }}>
          <Button variant="secondary" onClick={onClose}>
            Закрыть
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AttendanceSummary;