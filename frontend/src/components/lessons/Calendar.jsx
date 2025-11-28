// frontend/src/components/lessons/Calendar.jsx

import React, { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight, FaPlus, FaFilter } from 'react-icons/fa';
import { lessonService } from '../../services/lessonService';
import { teacherService } from '../../services/teacherService';
import LessonForm from './LessonForm';
import LessonDetails from './LessonDetails';
import Button from '../common/Button';
import { format, startOfWeek, addDays, addWeeks, subWeeks, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { ru } from 'date-fns/locale';
import { formatTime, formatFullName, parseDateSafe, getDateString } from '../../utils/formatters';

const Calendar = () => {
  const [viewMode, setViewMode] = useState('week'); // 'week' или 'month'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [lessons, setLessons] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [detailsLesson, setDetailsLesson] = useState(null);
  const [teacherFilter, setTeacherFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadData();
  }, [currentWeekStart, currentDate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const startDate = format(
        viewMode === 'week' ? currentWeekStart : startOfMonth(currentDate), 
        'yyyy-MM-dd'
      );
      
      const [lessonsData, teachersData] = await Promise.all([
        lessonService.getWeekSchedule(startDate),
        teacherService.getAll()
      ]);
      
      setLessons(lessonsData);
      setTeachers(teachersData);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Ошибка при загрузке расписания');
    } finally {
      setLoading(false);
    }
  };

  const handlePrevPeriod = () => {
    if (viewMode === 'week') {
      setCurrentWeekStart(subWeeks(currentWeekStart, 1));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    }
  };

  const handleNextPeriod = () => {
    if (viewMode === 'week') {
      setCurrentWeekStart(addWeeks(currentWeekStart, 1));
    } else {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentWeekStart(startOfWeek(today, { weekStartsOn: 1 }));
    setCurrentDate(today);
  };

  const handleLessonClick = (lesson) => {
    setDetailsLesson(lesson);
  };

  const handleFormSubmit = async (lessonData) => {
    try {
      if (selectedLesson) {
        await lessonService.update(selectedLesson.id, lessonData);
        alert('Занятие успешно обновлено');
      } else {
        await lessonService.create(lessonData);
        alert('Занятие успешно создано');
      }
      setIsFormOpen(false);
      setSelectedLesson(null);
      loadData();
    } catch (error) {
      console.error('Error saving lesson:', error);
      alert('Ошибка при сохранении занятия');
    }
  };

  // ИСПРАВЛЕННАЯ функция для получения занятий за день
  const getLessonsForDay = (date) => {
    // Получаем строку даты в формате YYYY-MM-DD из Date объекта
    const dateStr = getDateString(date);
    
    let filtered = lessons.filter(lesson => {
      // Получаем строку даты из занятия (без времени и временных зон)
      const lessonDateStr = getDateString(lesson.lesson_date);
      return lessonDateStr === dateStr;
    });

    // Фильтрация по педагогу
    if (teacherFilter !== 'all') {
      filtered = filtered.filter(lesson => lesson.teacher_id === parseInt(teacherFilter));
    }

    // Фильтрация по статусу
    if (statusFilter !== 'all') {
      filtered = filtered.filter(lesson => lesson.status === statusFilter);
    }

    return filtered.sort((a, b) => a.start_time.localeCompare(b.start_time));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return { bg: '#d4edda', border: '#28a745', text: '#155724' };
      case 'completed': return { bg: '#d1ecf1', border: '#17a2b8', text: '#0c5460' };
      case 'cancelled': return { bg: '#f8d7da', border: '#dc3545', text: '#721c24' };
      default: return { bg: '#e2e3e5', border: '#6c757d', text: '#383d41' };
    }
  };

  const renderWeekView = () => {
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(7, 1fr)',
        gap: '15px',
        marginTop: '20px'
      }}>
        {weekDays.map((day, index) => {
          const dayLessons = getLessonsForDay(day);
          const isTodayDate = isToday(day);

          return (
            <div
              key={index}
              style={{
                border: isTodayDate ? '2px solid #3498db' : '1px solid #e0e0e0',
                borderRadius: '12px',
                padding: '15px',
                backgroundColor: isTodayDate ? '#e3f2fd' : 'white',
                minHeight: '300px',
                boxShadow: isTodayDate ? '0 4px 12px rgba(52, 152, 219, 0.2)' : '0 2px 4px rgba(0,0,0,0.05)'
              }}
            >
              <div style={{
                textAlign: 'center',
                marginBottom: '15px',
                paddingBottom: '10px',
                borderBottom: '2px solid #e0e0e0'
              }}>
                <div style={{ 
                  fontSize: '13px', 
                  color: isTodayDate ? '#3498db' : '#666', 
                  marginBottom: '5px',
                  fontWeight: isTodayDate ? '600' : '400',
                  textTransform: 'capitalize'
                }}>
                  {format(day, 'EEEE', { locale: ru })}
                </div>
                <div style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  color: isTodayDate ? '#3498db' : '#2c3e50' 
                }}>
                  {format(day, 'd')}
                </div>
                <div style={{ fontSize: '11px', color: '#999' }}>
                  {format(day, 'MMMM', { locale: ru })}
                </div>
              </div>

              {dayLessons.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {dayLessons.map(lesson => {
                    const colors = getStatusColor(lesson.status);
                    return (
                      <div
                        key={lesson.id}
                        onClick={() => handleLessonClick(lesson)}
                        style={{
                          padding: '10px',
                          backgroundColor: colors.bg,
                          borderLeft: `4px solid ${colors.border}`,
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          fontSize: '13px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateX(3px)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateX(0)';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        <div style={{ 
                          fontWeight: 'bold', 
                          marginBottom: '5px',
                          color: colors.text,
                          fontSize: '14px'
                        }}>
                          {formatTime(lesson.start_time)}
                        </div>
                        <div style={{ 
                          marginBottom: '3px',
                          fontWeight: '500',
                          color: '#2c3e50'
                        }}>
                          {lesson.subject}
                        </div>
                        <div style={{ fontSize: '11px', color: '#666', marginBottom: '5px' }}>
                          👨‍🏫 {lesson.teacher_last_name} {lesson.teacher_first_name?.charAt(0)}.
                        </div>
                        <div style={{ 
                          fontSize: '11px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <span>👥 {lesson.enrolled_count || 0}/{lesson.max_students}</span>
                          {lesson.status === 'completed' && <span>✅</span>}
                          {lesson.status === 'cancelled' && <span>❌</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  color: '#95a5a6',
                  fontSize: '13px',
                  marginTop: '50px',
                  fontStyle: 'italic'
                }}>
                  Нет занятий
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = addDays(startOfWeek(monthEnd, { weekStartsOn: 1 }), 6);
    
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const weeks = [];
    
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return (
      <div style={{ marginTop: '20px' }}>
        {/* Заголовки дней недели */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '10px',
          marginBottom: '10px',
          fontWeight: '600',
          fontSize: '14px',
          color: '#666'
        }}>
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
            <div key={day} style={{ textAlign: 'center' }}>{day}</div>
          ))}
        </div>

        {/* Сетка дней */}
        {weeks.map((week, weekIndex) => (
          <div
            key={weekIndex}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              gap: '10px',
              marginBottom: '10px'
            }}
          >
            {week.map((day, dayIndex) => {
              const dayLessons = getLessonsForDay(day);
              const isTodayDate = isToday(day);
              const isCurrentMonth = isSameMonth(day, currentDate);

              return (
                <div
                  key={dayIndex}
                  style={{
                    minHeight: '120px',
                    padding: '8px',
                    backgroundColor: isCurrentMonth ? 'white' : '#f8f9fa',
                    border: isTodayDate ? '2px solid #3498db' : '1px solid #e0e0e0',
                    borderRadius: '8px',
                    opacity: isCurrentMonth ? 1 : 0.6
                  }}
                >
                  <div style={{
                    fontSize: '16px',
                    fontWeight: isTodayDate ? 'bold' : '500',
                    color: isTodayDate ? '#3498db' : '#2c3e50',
                    marginBottom: '5px'
                  }}>
                    {format(day, 'd')}
                  </div>

                  {dayLessons.slice(0, 3).map(lesson => {
                    const colors = getStatusColor(lesson.status);
                    return (
                      <div
                        key={lesson.id}
                        onClick={() => handleLessonClick(lesson)}
                        style={{
                          fontSize: '10px',
                          padding: '3px 5px',
                          marginBottom: '3px',
                          backgroundColor: colors.bg,
                          borderLeft: `2px solid ${colors.border}`,
                          borderRadius: '3px',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {formatTime(lesson.start_time)} {lesson.subject}
                      </div>
                    );
                  })}

                  {dayLessons.length > 3 && (
                    <div style={{ fontSize: '10px', color: '#666', textAlign: 'center' }}>
                      +{dayLessons.length - 3} еще
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  const getTotalLessons = () => {
    let filtered = lessons;
    if (teacherFilter !== 'all') {
      filtered = filtered.filter(l => l.teacher_id === parseInt(teacherFilter));
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(l => l.status === statusFilter);
    }
    return filtered.length;
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Загрузка расписания...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Панель управления */}
      <div className="actions-bar" style={{ marginBottom: '20px' }}>
        <div className="actions-left" style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <Button variant="outline" icon={<FaChevronLeft />} onClick={handlePrevPeriod}>
              {viewMode === 'week' ? 'Пред. неделя' : 'Пред. месяц'}
            </Button>
            <Button variant="secondary" onClick={handleToday}>
              Сегодня
            </Button>
            <Button variant="outline" onClick={handleNextPeriod}>
              {viewMode === 'week' ? 'След. неделя' : 'След. месяц'} <FaChevronRight />
            </Button>
          </div>

          <div style={{ display: 'flex', gap: '10px', marginLeft: '20px' }}>
            <Button
              variant={viewMode === 'week' ? 'primary' : 'outline'}
              onClick={() => setViewMode('week')}
            >
              Неделя
            </Button>
            <Button
              variant={viewMode === 'month' ? 'primary' : 'outline'}
              onClick={() => setViewMode('month')}
            >
              Месяц
            </Button>
          </div>
        </div>
        <div className="actions-right">
          <Button
            variant="primary"
            icon={<FaPlus />}
            onClick={() => setIsFormOpen(true)}
          >
            Создать занятие
          </Button>
        </div>
      </div>

      {/* Фильтры */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <FaFilter style={{ color: '#666' }} />
        <select
          value={teacherFilter}
          onChange={(e) => setTeacherFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '14px',
            backgroundColor: 'white',
            cursor: 'pointer'
          }}
        >
          <option value="all">Все педагоги</option>
          {teachers.map(teacher => (
            <option key={teacher.id} value={teacher.id}>
              {formatFullName(teacher.first_name, teacher.last_name, teacher.middle_name)}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '14px',
            backgroundColor: 'white',
            cursor: 'pointer'
          }}
        >
          <option value="all">Все статусы</option>
          <option value="scheduled">Запланировано</option>
          <option value="completed">Завершено</option>
          <option value="cancelled">Отменено</option>
        </select>

        <div style={{ marginLeft: 'auto', fontSize: '14px', color: '#666' }}>
          📊 Всего занятий: <strong>{getTotalLessons()}</strong>
        </div>
      </div>

      {/* Заголовок периода */}
      <div style={{ 
        marginTop: '20px', 
        textAlign: 'center', 
        fontSize: '22px', 
        fontWeight: '600',
        marginBottom: '20px',
        color: '#2c3e50'
      }}>
        {viewMode === 'week' ? (
          <>
            {format(currentWeekStart, 'd MMMM', { locale: ru })} - {format(addDays(currentWeekStart, 6), 'd MMMM yyyy', { locale: ru })}
          </>
        ) : (
          format(currentDate, 'LLLL yyyy', { locale: ru })
        )}
      </div>

      {/* Отображение календаря */}
      {viewMode === 'week' ? renderWeekView() : renderMonthView()}

      <LessonForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedLesson(null);
        }}
        onSubmit={handleFormSubmit}
        lesson={selectedLesson}
        teachers={teachers}
      />

      {detailsLesson && (
        <LessonDetails
          lesson={detailsLesson}
          onClose={() => setDetailsLesson(null)}
          onUpdate={loadData}
        />
      )}

      <style jsx>{`
        .loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
        }

        .spinner {
          border: 3px solid #f3f3f3;
          border-top: 3px solid #3498db;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .actions-bar {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
};

export default Calendar;
