// frontend/src/components/lessons/LessonDetails.jsx

import React, { useState, useEffect } from 'react';
import { FaUserPlus, FaUserMinus, FaCheckCircle, FaTimesCircle, FaCalendarAlt, FaClock, FaChalkboardTeacher, FaUsers, FaSearch } from 'react-icons/fa';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { lessonService } from '../../services/lessonService';
import { enrollmentService } from '../../services/enrollmentService';
import { studentService } from '../../services/studentService';
import { formatDate, formatTime, formatFullName, formatPhone } from '../../utils/formatters';

const STATUS_OPTIONS = [
  { value: 'scheduled', label: 'Запланировано', color: '#28a745', bg: '#d4edda' },
  { value: 'completed', label: 'Завершено', color: '#17a2b8', bg: '#d1ecf1' },
  { value: 'cancelled', label: 'Отменено', color: '#dc3545', bg: '#f8d7da' }
];

const LessonDetails = ({ lesson, onClose, onUpdate }) => {
  const [lessonData, setLessonData] = useState(null);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (lesson) {
      loadLessonDetails();
    }
  }, [lesson]);

  useEffect(() => {
    filterStudents();
  }, [searchQuery, availableStudents]);

  const loadLessonDetails = async () => {
    try {
      setLoading(true);
      const [detailsData, studentsData] = await Promise.all([
        lessonService.getById(lesson.id),
        studentService.getAll()
      ]);
      
      setLessonData(detailsData);
      
      // Фильтруем студентов, которые еще не записаны
      const enrolledIds = detailsData.students?.map(s => s.id) || [];
      const available = studentsData.filter(s => 
        !enrolledIds.includes(s.id) && 
        s.status === 'active'
      );
      setAvailableStudents(available);
      setFilteredStudents(available);
    } catch (error) {
      console.error('Error loading lesson details:', error);
      alert('Ошибка при загрузке данных занятия');
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    if (!searchQuery.trim()) {
      setFilteredStudents(availableStudents);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = availableStudents.filter(student =>
      student.first_name?.toLowerCase().includes(query) ||
      student.last_name?.toLowerCase().includes(query) ||
      student.middle_name?.toLowerCase().includes(query) ||
      student.phone?.toLowerCase().includes(query)
    );
    setFilteredStudents(filtered);
  };

  const handleStatusChange = async (newStatus) => {
    if (newStatus === lessonData.status) return;

    const confirmMessage = 
      newStatus === 'completed' ? 'Отметить занятие как завершенное?' :
      newStatus === 'cancelled' ? 'Отменить это занятие?' :
      'Изменить статус на "Запланировано"?';

    if (!window.confirm(confirmMessage)) return;

    try {
      setIsUpdatingStatus(true);
      
      await lessonService.update(lesson.id, {
        ...lessonData,
        status: newStatus
      });

      setLessonData(prev => ({ ...prev, status: newStatus }));
      alert('Статус успешно обновлен');
      
      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Ошибка при обновлении статуса');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAddStudent = async () => {
    if (!selectedStudentId) {
      alert('Выберите ученика');
      return;
    }

    try {
      await enrollmentService.create({
        lesson_id: lesson.id,
        student_id: parseInt(selectedStudentId)
      });
      
      alert('Ученик успешно записан на занятие');
      setShowAddStudent(false);
      setSelectedStudentId('');
      setSearchQuery('');
      loadLessonDetails();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error enrolling student:', error);
      if (error.response?.data?.error) {
        alert(error.response.data.error);
      } else {
        alert('Ошибка при записи ученика');
      }
    }
  };

  const handleRemoveStudent = async (enrollmentId, studentName) => {
    if (!window.confirm(`Вы уверены, что хотите отменить запись ученика ${studentName}?`)) {
      return;
    }

    try {
      await enrollmentService.delete(enrollmentId);
      alert('Запись ученика отменена');
      loadLessonDetails();
      if (onUpdate) onUpdate();
    } catch (error) {
      console.error('Error removing student:', error);
      alert('Ошибка при отмене записи');
    }
  };

  const getCurrentStatusStyle = () => {
    const status = STATUS_OPTIONS.find(s => s.value === lessonData?.status);
    return status || STATUS_OPTIONS[0];
  };

  if (loading) {
    return (
      <Modal isOpen={true} onClose={onClose} title="Загрузка...">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 20px'
        }}>
          <div style={{
            border: '3px solid #f3f3f3',
            borderTop: '3px solid #3498db',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ marginTop: '20px', color: '#666' }}>Загрузка данных...</p>
        </div>
      </Modal>
    );
  }

  if (!lessonData) {
    return null;
  }

  const statusStyle = getCurrentStatusStyle();
  const isScheduled = lessonData.status === 'scheduled';
  const isFull = (lessonData.students?.length || 0) >= lessonData.max_students;

  return (
    <Modal isOpen={true} onClose={onClose} title="Информация о занятии" size="large">
      <div style={{ padding: '20px', maxHeight: '80vh', overflowY: 'auto' }}>
        
        {/* Статус с возможностью изменения */}
        <div style={{
          marginBottom: '25px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '12px',
          border: '2px solid #e9ecef'
        }}>
          <label style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: '600',
            color: '#495057',
            marginBottom: '12px'
          }}>
            Статус занятия
          </label>
          
          <div style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap'
          }}>
            {STATUS_OPTIONS.map(status => (
              <button
                key={status.value}
                onClick={() => handleStatusChange(status.value)}
                disabled={isUpdatingStatus}
                style={{
                  padding: '12px 24px',
                  border: lessonData.status === status.value ? `3px solid ${status.color}` : '2px solid #dee2e6',
                  borderRadius: '8px',
                  backgroundColor: lessonData.status === status.value ? status.bg : 'white',
                  color: lessonData.status === status.value ? status.color : '#6c757d',
                  fontSize: '14px',
                  fontWeight: lessonData.status === status.value ? '600' : '500',
                  cursor: isUpdatingStatus ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s',
                  opacity: isUpdatingStatus ? 0.6 : 1,
                  flex: '1',
                  minWidth: '140px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (!isUpdatingStatus && lessonData.status !== status.value) {
                    e.target.style.backgroundColor = status.bg;
                    e.target.style.borderColor = status.color;
                    e.target.style.color = status.color;
                  }
                }}
                onMouseLeave={(e) => {
                  if (lessonData.status !== status.value) {
                    e.target.style.backgroundColor = 'white';
                    e.target.style.borderColor = '#dee2e6';
                    e.target.style.color = '#6c757d';
                  }
                }}
              >
                {status.value === 'completed' && <FaCheckCircle />}
                {status.value === 'cancelled' && <FaTimesCircle />}
                {status.label}
              </button>
            ))}
          </div>
        </div>

        {/* Основная информация */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '15px',
          marginBottom: '25px'
        }}>
          
          {/* Предмет */}
          <div style={{
            padding: '15px',
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '5px' }}>
              Предмет
            </div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#2c3e50' }}>
              {lessonData.subject}
            </div>
          </div>

          {/* Дата */}
          <div style={{
            padding: '15px',
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              marginBottom: '5px'
            }}>
              <FaCalendarAlt style={{ color: '#3498db', fontSize: '14px' }} />
              <span style={{ fontSize: '12px', color: '#6c757d' }}>Дата</span>
            </div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#2c3e50' }}>
              {formatDate(lessonData.lesson_date)}
            </div>
          </div>

          {/* Время */}
          <div style={{
            padding: '15px',
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              marginBottom: '5px'
            }}>
              <FaClock style={{ color: '#e67e22', fontSize: '14px' }} />
              <span style={{ fontSize: '12px', color: '#6c757d' }}>Время</span>
            </div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#2c3e50' }}>
              {formatTime(lessonData.start_time)} - {formatTime(lessonData.end_time)}
            </div>
          </div>

          {/* Педагог */}
          <div style={{
            padding: '15px',
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid #e9ecef'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              marginBottom: '5px'
            }}>
              <FaChalkboardTeacher style={{ color: '#9b59b6', fontSize: '14px' }} />
              <span style={{ fontSize: '12px', color: '#6c757d' }}>Педагог</span>
            </div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#2c3e50' }}>
              {formatFullName(
                lessonData.teacher_first_name,
                lessonData.teacher_last_name,
                lessonData.teacher_middle_name
              )}
            </div>
          </div>

        </div>

        {/* Описание */}
        {lessonData.description && (
          <div style={{
            padding: '15px',
            backgroundColor: '#fff3cd',
            borderLeft: '4px solid #ffc107',
            borderRadius: '8px',
            marginBottom: '25px'
          }}>
            <div style={{ 
              fontSize: '12px', 
              fontWeight: '600', 
              color: '#856404',
              marginBottom: '8px'
            }}>
              Описание
            </div>
            <div style={{ 
              fontSize: '14px', 
              color: '#856404',
              lineHeight: '1.6'
            }}>
              {lessonData.description}
            </div>
          </div>
        )}

        {/* Список записанных учеников */}
        <div style={{ marginBottom: '25px' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '15px' 
          }}>
            <h4 style={{ 
              margin: 0,
              fontSize: '18px',
              fontWeight: '600',
              color: '#2c3e50',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <FaUsers style={{ color: '#27ae60' }} />
              Записанные ученики ({lessonData.students?.length || 0} / {lessonData.max_students})
            </h4>
            {isScheduled && (
              <Button
                variant={isFull ? 'secondary' : 'primary'}
                icon={<FaUserPlus />}
                onClick={() => setShowAddStudent(!showAddStudent)}
                disabled={isFull}
              >
                {isFull ? 'Группа заполнена' : 'Записать ученика'}
              </Button>
            )}
          </div>

          {/* Прогресс бар заполнения */}
          <div style={{
            marginBottom: '15px',
            height: '10px',
            backgroundColor: '#e9ecef',
            borderRadius: '5px',
            overflow: 'hidden'
          }}>
            <div style={{
              height: '100%',
              backgroundColor: isFull ? '#e74c3c' : '#27ae60',
              width: `${Math.min(100, ((lessonData.students?.length || 0) / lessonData.max_students) * 100)}%`,
              transition: 'width 0.3s'
            }} />
          </div>

          {/* Форма добавления ученика */}
          {showAddStudent && (
            <div style={{ 
              marginBottom: '20px', 
              padding: '20px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '8px',
              border: '1px solid #dee2e6'
            }}>
              <h5 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#2c3e50' }}>
                Добавить ученика на занятие
              </h5>

              {/* Поиск ученика */}
              <div style={{ position: 'relative', marginBottom: '15px' }}>
                <FaSearch style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#999',
                  fontSize: '14px'
                }} />
                <input
                  type="text"
                  placeholder="Поиск ученика по имени или телефону..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 10px 10px 35px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#495057'
                }}>
                  Выберите ученика
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: 'white'
                  }}
                >
                  <option value="">-- Выберите ученика --</option>
                  {filteredStudents.map(student => (
                    <option key={student.id} value={student.id}>
                      {formatFullName(student.first_name, student.last_name, student.middle_name)}
                      {student.phone && ` - ${formatPhone(student.phone)}`}
                    </option>
                  ))}
                </select>
                {filteredStudents.length === 0 && searchQuery && (
                  <small style={{ color: '#dc3545', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    Ученики не найдены
                  </small>
                )}
                {availableStudents.length === 0 && (
                  <small style={{ color: '#6c757d', fontSize: '12px', marginTop: '4px', display: 'block' }}>
                    Все активные ученики уже записаны на это занятие
                  </small>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <Button 
                  variant="secondary" 
                  onClick={() => {
                    setShowAddStudent(false);
                    setSearchQuery('');
                    setSelectedStudentId('');
                  }}
                >
                  Отмена
                </Button>
                <Button 
                  variant="success" 
                  onClick={handleAddStudent}
                  disabled={!selectedStudentId}
                >
                  Записать
                </Button>
              </div>
            </div>
          )}

          {/* Список студентов */}
          {lessonData.students && lessonData.students.length > 0 ? (
            <div style={{ 
              border: '1px solid #e0e0e0', 
              borderRadius: '8px', 
              overflow: 'hidden',
              backgroundColor: 'white'
            }}>
              {lessonData.students.map((student, index) => (
                <div
                  key={student.id}
                  style={{
                    padding: '15px',
                    borderBottom: index < lessonData.students.length - 1 ? '1px solid #e0e0e0' : 'none',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                >
                  <div>
                    <p style={{ 
                      fontWeight: '600', 
                      marginBottom: '5px',
                      color: '#2c3e50',
                      fontSize: '15px'
                    }}>
                      {formatFullName(student.first_name, student.last_name, student.middle_name)}
                    </p>
                    {student.phone && (
                      <p style={{ fontSize: '13px', color: '#6c757d' }}>
                        📞 {formatPhone(student.phone)}
                      </p>
                    )}
                  </div>
                  {isScheduled && (
                    <button
                      onClick={() => handleRemoveStudent(
                        student.enrollment_id,
                        formatFullName(student.first_name, student.last_name, student.middle_name)
                      )}
                      title="Отменить запись"
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '13px',
                        fontWeight: '500',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#c0392b'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#dc3545'}
                    >
                      <FaUserMinus /> Отменить
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '40px 20px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              color: '#6c757d'
            }}>
              <FaUsers style={{ fontSize: '48px', marginBottom: '15px', opacity: 0.3 }} />
              <p style={{ margin: 0, fontSize: '15px' }}>Нет записанных учеников</p>
            </div>
          )}
        </div>

        {/* Кнопки действий */}
        <div style={{
          display: 'flex',
          gap: '10px',
          justifyContent: 'flex-end',
          paddingTop: '20px',
          borderTop: '1px solid #e9ecef'
        }}>
          <Button variant="secondary" onClick={onClose}>
            Закрыть
          </Button>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </Modal>
  );
};

export default LessonDetails;
