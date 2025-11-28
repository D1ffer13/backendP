// frontend/src/components/attendance/AttendanceTable.jsx

import React, { useEffect, useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaCalendarAlt } from 'react-icons/fa';

import { attendanceService } from '../../services/attendanceService';
import { teacherService } from '../../services/teacherService';
import { groupService } from '../../services/groupService';

import RescheduleLessonModal from './RescheduleLessonModal';
import LessonForm from '../lessons/LessonForm';
import Button from '../common/Button';
import { formatTime, formatFullName } from '../../utils/formatters';

const AttendanceTable = () => {
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  const [teachers, setTeachers] = useState([]);
  const [groups, setGroups] = useState([]);

  const [teacherFilter, setTeacherFilter] = useState('all');
  const [groupFilter, setGroupFilter] = useState('all');

  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [lessonAttendance, setLessonAttendance] = useState(null);

  const [loadingLessons, setLoadingLessons] = useState(false);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [studentsInGroup, setStudentsInGroup] = useState([]);

  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [isLessonEditOpen, setIsLessonEditOpen] = useState(false);

  const [addingStudentId, setAddingStudentId] = useState('');
  const [addingStudentLoading, setAddingStudentLoading] = useState(false);

  // ===== Загрузка фильтров =====
  useEffect(() => {
    loadFilters();
  }, []);

  // ===== Загрузка уроков по дате и фильтрам =====
  useEffect(() => {
    loadLessons();
  }, [date, teacherFilter, groupFilter]);

  // ===== Загрузка посещаемости выбранного урока =====
  useEffect(() => {
    if (selectedLesson) {
      loadLessonAttendance(selectedLesson.id);
    } else {
      setLessonAttendance(null);
    }
  }, [selectedLesson]);

  const loadFilters = async () => {
    try {
      const [t, g] = await Promise.all([
        teacherService.getAll(),
        groupService.getAll()
      ]);
      setTeachers(Array.isArray(t) ? t : []);
      setGroups(Array.isArray(g) ? g : []);
    } catch (e) {
      console.error('Error loading filters:', e);
    }
  };

  const loadLessons = async () => {
    try {
      setLoadingLessons(true);
      setSelectedLesson(null);
      setLessonAttendance(null);

      const params = { date };
      if (teacherFilter !== 'all') params.teacher_id = teacherFilter;
      if (groupFilter !== 'all') params.group_id = groupFilter;

      const data = await attendanceService.getLessonsByDate(params);
      setLessons(Array.isArray(data) ? data : []);

      if (data && data.length > 0) {
        setSelectedLesson(data[0]);
      }
    } catch (e) {
      console.error('Error loading lessons for attendance:', e);
      alert('Ошибка при загрузке уроков для посещаемости');
    } finally {
      setLoadingLessons(false);
    }
  };

  const loadLessonAttendance = async (lessonId) => {
    try {
      setLoadingAttendance(true);
      const data = await attendanceService.getLessonAttendance(lessonId);
      setLessonAttendance(data);

      if (data.lesson.group_id) {
        const groupStudents = await groupService.getStudents(
          data.lesson.group_id
        );
        setStudentsInGroup(Array.isArray(groupStudents) ? groupStudents : []);
      } else {
        setStudentsInGroup([]);
      }
    } catch (e) {
      console.error('Error loading lesson attendance:', e);
      alert('Ошибка при загрузке посещаемости урока');
    } finally {
      setLoadingAttendance(false);
    }
  };

  // ===== Управление датой =====
  const changeDateBy = (days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    setDate(d.toISOString().split('T')[0]);
  };

  const formatDateHuman = (isoDate) => {
    const d = new Date(isoDate);
    return d.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getDayName = (isoDate) => {
    const d = new Date(isoDate);
    return d.toLocaleDateString('ru-RU', { weekday: 'long' });
  };

  // ===== Статусы посещаемости =====
  const handleStatusChange = async (enrollmentId, newStatus) => {
    try {
      console.log('Changing attendance status', { enrollmentId, newStatus });
      const updated = await attendanceService.updateEnrollmentStatus(
        enrollmentId,
        newStatus
      );
      console.log('Server returned updated enrollment:', updated);

      if (selectedLesson) {
        await loadLessonAttendance(selectedLesson.id);
        await loadLessons();
      }
    } catch (e) {
      console.error('Error updating attendance status:', e);
      const msg =
        e.response?.data?.error ||
        'Ошибка при обновлении статуса посещаемости';
      alert(msg);
    }
  };

  // ===== Добавление ученика на урок =====
  const handleAddStudent = async () => {
    if (!addingStudentId || !selectedLesson) return;
    try {
      setAddingStudentLoading(true);
      await attendanceService.addStudentToLesson(
        selectedLesson.id,
        Number(addingStudentId)
      );
      setAddingStudentId('');
      await loadLessonAttendance(selectedLesson.id);
      await loadLessons();
    } catch (e) {
      console.error('Error adding student to lesson:', e);
      const msg =
        e.response?.data?.error || 'Ошибка при добавлении ученика на урок';
      alert(msg);
    } finally {
      setAddingStudentLoading(false);
    }
  };

  const availableStudentsForLesson =
    lessonAttendance && studentsInGroup.length > 0
      ? studentsInGroup.filter(
          (s) =>
            !lessonAttendance.students.some((ls) => ls.student_id === s.id)
        )
      : [];

  // ===== Render =====
  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ marginBottom: '16px' }}>Посещаемость</h1>

      {/* Панель фильтров и даты */}
      <div
        style={{
          marginBottom: '16px',
          display: 'flex',
          gap: '12px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}
      >
        {/* Дата */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid #ddd',
            backgroundColor: 'white'
          }}
        >
          <Button
            variant="outline"
            type="button"
            onClick={() => changeDateBy(-1)}
          >
            <FaChevronLeft />
          </Button>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: '14px',
                color: '#666',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <FaCalendarAlt /> {getDayName(date)}
            </div>
            <div style={{ fontSize: '16px', fontWeight: 600 }}>
              {formatDateHuman(date)}
            </div>
          </div>
          <Button
            variant="outline"
            type="button"
            onClick={() => changeDateBy(1)}
          >
            <FaChevronRight />
          </Button>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={{
              marginLeft: '8px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              padding: '4px 8px',
              fontSize: '14px'
            }}
          />
        </div>

        {/* Фильтр по преподавателю */}
        <select
          value={teacherFilter}
          onChange={(e) => setTeacherFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '14px',
            backgroundColor: 'white',
            minWidth: '200px'
          }}
        >
          <option value="all">Все преподаватели</option>
          {teachers.map((t) => (
            <option key={t.id} value={t.id}>
              {formatFullName(t.first_name, t.last_name, t.middle_name)}
            </option>
          ))}
        </select>

        {/* Фильтр по группе */}
        <select
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '14px',
            backgroundColor: 'white',
            minWidth: '200px'
          }}
        >
          <option value="all">Все группы</option>
          {groups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(260px, 340px) 1fr',
          gap: '20px',
          alignItems: 'flex-start'
        }}
      >
        {/* Список уроков слева */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            padding: '12px',
            maxHeight: 'calc(100vh - 160px)',
            overflowY: 'auto'
          }}
        >
          <h3
            style={{
              marginTop: 0,
              marginBottom: '10px',
              fontSize: '16px',
              fontWeight: 600
            }}
          >
            Уроки за день
          </h3>

          {loadingLessons ? (
            <div style={{ padding: '12px', color: '#666' }}>
              Загрузка уроков...
            </div>
          ) : lessons.length === 0 ? (
            <div style={{ padding: '12px', color: '#666' }}>
              На эту дату уроки не найдены.
            </div>
          ) : (
            lessons.map((lesson) => {
              const isSelected =
                selectedLesson && selectedLesson.id === lesson.id;

              const present = lesson.total_present || 0;
              const absent = lesson.total_absent || 0;
              const total = lesson.total_enrolled || 0;

              return (
                <div
                  key={lesson.id}
                  onClick={() => setSelectedLesson(lesson)}
                  style={{
                    padding: '10px',
                    borderRadius: '8px',
                    border: isSelected
                      ? '2px solid #3498db'
                      : '1px solid #eee',
                    marginBottom: '8px',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? '#ecf6ff' : '#fff',
                    transition: 'all 0.15s'
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginBottom: '4px',
                      fontSize: '14px'
                    }}
                  >
                    <span style={{ fontWeight: 600 }}>
                      {formatTime(lesson.start_time)} –{' '}
                      {formatTime(lesson.end_time)}
                    </span>
                    <span
                      style={{
                        fontSize: '12px',
                        color:
                          lesson.status === 'scheduled'
                            ? '#27ae60'
                            : lesson.status === 'completed'
                            ? '#2980b9'
                            : '#c0392b'
                      }}
                    >
                      {lesson.status === 'scheduled'
                        ? 'Запланировано'
                        : lesson.status === 'completed'
                        ? 'Завершено'
                        : 'Отменено'}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', marginBottom: '2px' }}>
                    <strong>Группа:</strong> {lesson.group_name || '—'}
                  </div>
                  <div style={{ fontSize: '13px', marginBottom: '2px' }}>
                    <strong>Предмет:</strong> {lesson.subject_name || '—'}
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      marginTop: '4px',
                      color: '#555',
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span>
                      {formatFullName(
                        lesson.teacher_first_name,
                        lesson.teacher_last_name,
                        lesson.teacher_middle_name
                      )}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#777',
                      marginTop: '4px'
                    }}
                  >
                    Посетили: {present} / {total} &nbsp;|&nbsp; Пропустили:{' '}
                    {absent}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Правая часть: выбранный урок */}
        <div
          style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            padding: '16px',
            minHeight: '260px'
          }}
        >
          {!selectedLesson ? (
            <div style={{ color: '#666' }}>
              Выберите урок слева, чтобы отметить посещаемость.
            </div>
          ) : loadingAttendance || !lessonAttendance ? (
            <div style={{ color: '#666' }}>Загрузка данных урока...</div>
          ) : (
            <>
              {/* Заголовок урока */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                  gap: '12px',
                  flexWrap: 'wrap'
                }}
              >
                <div>
                  <h3
                    style={{
                      margin: 0,
                      marginBottom: '4px',
                      fontSize: '18px'
                    }}
                  >
                    {lessonAttendance.lesson.subject_name ||
                      lessonAttendance.lesson.subject ||
                      'Урок'}
                  </h3>
                  <div style={{ fontSize: '14px', color: '#555' }}>
                    <strong>Группа:</strong>{' '}
                    {lessonAttendance.lesson.group_name || '—'}
                  </div>
                  <div style={{ fontSize: '14px', color: '#555' }}>
                    <strong>Педагог:</strong>{' '}
                    {formatFullName(
                      lessonAttendance.lesson.teacher_first_name,
                      lessonAttendance.lesson.teacher_last_name,
                      lessonAttendance.lesson.teacher_middle_name
                    )}
                  </div>
                  <div style={{ fontSize: '14px', color: '#555' }}>
                    <strong>Время:</strong>{' '}
                    {formatTime(lessonAttendance.lesson.start_time)} –{' '}
                    {formatTime(lessonAttendance.lesson.end_time)}
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    alignItems: 'flex-end'
                  }}
                >
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setIsLessonEditOpen(true)}
                  >
                    Редактировать урок
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setIsRescheduleOpen(true)}
                  >
                    Перенести урок
                  </Button>
                </div>
              </div>

              <hr style={{ margin: '12px 0' }} />

              {/* Добавление ученика */}
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  alignItems: 'center',
                  marginBottom: '12px',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ fontSize: '14px', fontWeight: 500 }}>
                  Добавить ученика из группы:
                </div>
                <select
                  value={addingStudentId}
                  onChange={(e) => setAddingStudentId(e.target.value)}
                  style={{
                    minWidth: '220px',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid #ddd',
                    fontSize: '14px'
                  }}
                >
                  <option value="">Выберите ученика</option>
                  {availableStudentsForLesson.map((s) => (
                    <option key={s.id} value={s.id}>
                      {formatFullName(
                        s.first_name,
                        s.last_name,
                        s.middle_name
                      )}
                    </option>
                  ))}
                </select>
                <Button
                  variant="primary"
                  type="button"
                  onClick={handleAddStudent}
                  disabled={!addingStudentId || addingStudentLoading}
                >
                  Добавить
                </Button>
                {availableStudentsForLesson.length === 0 && (
                  <span
                    style={{
                      fontSize: '12px',
                      color: '#777'
                    }}
                  >
                    Все ученики группы уже добавлены на урок.
                  </span>
                )}
              </div>

              {/* Список учеников с отметками */}
              {lessonAttendance.students.length === 0 ? (
                <div style={{ padding: '12px', color: '#666' }}>
                  На этот урок ещё не записан ни один ученик.
                </div>
              ) : (
                <table
                  style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '14px'
                  }}
                >
                  <thead>
                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                      <th style={{ padding: '8px', textAlign: 'left' }}>№</th>
                      <th style={{ padding: '8px', textAlign: 'left' }}>
                        Ученик
                      </th>
                      <th style={{ padding: '8px', textAlign: 'left' }}>
                        Телефон
                      </th>
                      <th style={{ padding: '8px', textAlign: 'center' }}>
                        Статус
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {lessonAttendance.students.map((st, index) => (
                      <tr key={st.enrollment_id}>
                        <td style={{ padding: '8px' }}>{index + 1}</td>
                        <td style={{ padding: '8px' }}>
                          {formatFullName(
                            st.first_name,
                            st.last_name,
                            st.middle_name
                          )}
                        </td>
                        <td style={{ padding: '8px' }}>{st.phone || '—'}</td>
                        <td
                          style={{
                            padding: '8px',
                            textAlign: 'center'
                          }}
                        >
                          <select
                            value={st.attendance_status || 'enrolled'}
                            onChange={(e) =>
                              handleStatusChange(
                                st.enrollment_id,
                                e.target.value
                              )
                            }
                            style={{
                              padding: '6px 8px',
                              borderRadius: '6px',
                              border: '1px solid #ddd',
                              fontSize: '13px'
                            }}
                          >
                            <option value="enrolled">Нет отметки</option>
                            <option value="present">Посетил</option>
                            <option value="absent">Пропустил</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </div>
      </div>

      {/* Модалка переноса урока */}
      {selectedLesson && (
        <RescheduleLessonModal
          isOpen={isRescheduleOpen}
          onClose={(changed) => {
            setIsRescheduleOpen(false);
            if (changed) {
              loadLessons();
              if (selectedLesson) {
                loadLessonAttendance(selectedLesson.id);
              }
            }
          }}
          lesson={lessonAttendance ? lessonAttendance.lesson : selectedLesson}
        />
      )}

      {/* Модалка редактирования урока */}
      {selectedLesson && (
        <LessonForm
          isOpen={isLessonEditOpen}
          onClose={() => setIsLessonEditOpen(false)}
          lesson={lessonAttendance ? lessonAttendance.lesson : selectedLesson}
          onSaved={async () => {
            await loadLessons();
            if (selectedLesson) {
              await loadLessonAttendance(selectedLesson.id);
            }
          }}
        />
      )}
    </div>
  );
};

export default AttendanceTable;
