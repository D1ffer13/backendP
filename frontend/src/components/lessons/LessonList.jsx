// frontend/src/components/lessons/LessonList.jsx

import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { lessonService } from '../../services/lessonService';
import { teacherService } from '../../services/teacherService';
import LessonForm from './LessonForm';
import LessonCard from './LessonCard';
import LessonDetails from './LessonDetails';
import Table from '../common/Table';
import Button from '../common/Button';
import { formatDate, formatTime, formatFullName } from '../../utils/formatters';

const ITEMS_PER_PAGE = 30;

const LessonList = () => {
  const [lessons, setLessons] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [filteredLessons, setFilteredLessons] = useState([]);
  const [displayedLessons, setDisplayedLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [teacherFilter, setTeacherFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [detailsLesson, setDetailsLesson] = useState(null);
  const [viewMode, setViewMode] = useState('table');

  const totalPages = Math.ceil(filteredLessons.length / ITEMS_PER_PAGE);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterLessons();
  }, [searchQuery, statusFilter, teacherFilter, lessons]);

  useEffect(() => {
    paginateLessons();
  }, [filteredLessons, currentPage]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [lessonsData, teachersData] = await Promise.all([
        lessonService.getAll(),
        teacherService.getAll()
      ]);

      const sortedLessons = lessonsData.sort(
        (a, b) => new Date(b.lesson_date) - new Date(a.lesson_date)
      );

      setLessons(sortedLessons);
      setTeachers(teachersData);
      setFilteredLessons(sortedLessons);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Ошибка при загрузке данных');
    } finally {
      setLoading(false);
    }
  };

  const filterLessons = () => {
    let filtered = lessons;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (lesson) =>
          lesson.subject?.toLowerCase().includes(query) ||
          lesson.teacher_last_name?.toLowerCase().includes(query) ||
          lesson.teacher_first_name?.toLowerCase().includes(query)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter((lesson) => lesson.status === statusFilter);
    }

    if (teacherFilter !== 'all') {
      filtered = filtered.filter(
        (lesson) => lesson.teacher_id === parseInt(teacherFilter, 10)
      );
    }

    setFilteredLessons(filtered);
    setCurrentPage(1);
  };

  const paginateLessons = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    setDisplayedLessons(filteredLessons.slice(startIndex, endIndex));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAdd = () => {
    setSelectedLesson(null);
    setIsFormOpen(true);
  };

  const handleEdit = (lesson) => {
    setSelectedLesson(lesson);
    setIsFormOpen(true);
  };

  const handleDelete = async (lesson) => {
    if (
      !window.confirm(
        `Вы уверены, что хотите удалить занятие "${lesson.subject}"?`
      )
    ) {
      return;
    }

    try {
      await lessonService.delete(lesson.id);
      alert('Занятие успешно удалено');
      loadData();
    } catch (error) {
      console.error('Error deleting lesson:', error);
      alert('Ошибка при удалении занятия');
    }
  };

  const handleViewDetails = (lesson) => {
    setDetailsLesson(lesson);
  };

  const getStatusCount = (status) => {
    if (status === 'all') return lessons.length;
    return lessons.filter((l) => l.status === status).length;
  };

  // Колонки таблицы
  const columns = [
    {
      header: '№',
      accessor: 'id',
      render: (row, index) =>
        (currentPage - 1) * ITEMS_PER_PAGE + index + 1,
      width: 60,
      nowrap: true
    },
    {
      header: 'Дата',
      accessor: 'lesson_date',
      render: (row) => formatDate(row.lesson_date),
      width: 110,
      nowrap: true
    },
    {
      header: 'Время',
      accessor: 'time',
      render: (row) =>
        `${formatTime(row.start_time)}–${formatTime(row.end_time)}`,
      width: 120,
      nowrap: true
    },
    {
      header: 'Предмет',
      accessor: 'subject',
      width: 200,
      maxWidth: 220
    },
    {
      header: 'Педагог',
      accessor: 'teacher',
      render: (row) =>
        formatFullName(
          row.teacher_first_name,
          row.teacher_last_name,
          row.teacher_middle_name
        ),
      width: 200,
      maxWidth: 230
    },
    {
      header: 'Записано',
      accessor: 'enrolled',
      render: (row) =>
        `${row.enrolled_count || 0} / ${row.max_students}`,
      width: 110,
      nowrap: true
    },
    {
      header: 'Статус',
      accessor: 'status',
      width: 150,
      maxWidth: 170,
      render: (row) => (
        <span
          style={{
            display: 'inline-block',
            padding: '3px 10px',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            backgroundColor:
              row.status === 'scheduled'
                ? '#d4edda'
                : row.status === 'completed'
                ? '#d1ecf1'
                : '#f8d7da',
            color:
              row.status === 'scheduled'
                ? '#155724'
                : row.status === 'completed'
                ? '#0c5460'
                : '#721c24'
          }}
        >
          {row.status === 'scheduled' && 'Запланировано'}
          {row.status === 'completed' && 'Завершено'}
          {row.status === 'cancelled' && 'Отменено'}
        </span>
      )
    }
  ];

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        <p>Загрузка занятий...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Панель действий */}
      <div className="actions-bar" style={{ marginBottom: '20px' }}>
        <div
          className="actions-left"
          style={{
            display: 'flex',
            gap: '10px',
            flex: 1,
            flexWrap: 'wrap'
          }}
        >
          <div className="search-box" style={{ flex: 1, maxWidth: '300px' }}>
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Поиск занятий..."
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

          <select
            value={teacherFilter}
            onChange={(e) => setTeacherFilter(e.target.value)}
            style={{
              padding: '10px 15px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: 'white',
              cursor: 'pointer',
              minWidth: '180px'
            }}
          >
            <option value="all">Все педагоги</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {formatFullName(
                  teacher.first_name,
                  teacher.last_name,
                  teacher.middle_name
                )}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '10px 15px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: 'white',
              cursor: 'pointer',
              minWidth: '180px'
            }}
          >
            <option value="all">
              Все статусы ({getStatusCount('all')})
            </option>
            <option value="scheduled">
              Запланировано ({getStatusCount('scheduled')})
            </option>
            <option value="completed">
              Завершено ({getStatusCount('completed')})
            </option>
            <option value="cancelled">
              Отменено ({getStatusCount('cancelled')})
            </option>
          </select>
        </div>

        <div
          className="actions-right"
          style={{ display: 'flex', gap: '10px' }}
        >
          <Button
            variant="primary"
            icon={<FaPlus />}
            onClick={handleAdd}
          >
            Создать занятие
          </Button>
        </div>
      </div>

      {/* Переключатель режимов */}
      <div
        style={{
          marginBottom: '20px',
          display: 'flex',
          gap: '10px',
          alignItems: 'center'
        }}
      >
        <Button
          variant={viewMode === 'table' ? 'primary' : 'outline'}
          onClick={() => setViewMode('table')}
        >
          Таблица
        </Button>
        <Button
          variant={viewMode === 'cards' ? 'primary' : 'outline'}
          onClick={() => setViewMode('cards')}
        >
          Карточки
        </Button>

        <span
          style={{
            marginLeft: 'auto',
            color: '#666',
            fontSize: '14px'
          }}
        >
          Показано {displayedLessons.length} из {filteredLessons.length}{' '}
          занятий
        </span>
      </div>

      {/* Таблица или карточки */}
      {viewMode === 'table' ? (
        <div
          style={{
            overflowX: 'auto',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}
        >
          <Table
            columns={columns}
            data={displayedLessons}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onDetails={handleViewDetails}  // кнопка "Подробнее" теперь в колонке Действия
            minWidth={900}
          />
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px'
          }}
        >
          {displayedLessons.map((lesson) => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewDetails={handleViewDetails}
            />
          ))}
        </div>
      )}

      {/* Пустое состояние, пагинация и модалки оставлены без изменений */}
      {filteredLessons.length === 0 && (
        <div
          className="empty-state"
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: 'white',
            borderRadius: '8px',
            marginTop: '20px'
          }}
        >
          <p
            style={{
              fontSize: '18px',
              color: '#666',
              marginBottom: '20px'
            }}
          >
            {searchQuery || statusFilter !== 'all' || teacherFilter !== 'all'
              ? 'Занятия не найдены'
              : 'Нет занятий'}
          </p>
          {(searchQuery ||
            statusFilter !== 'all' ||
            teacherFilter !== 'all') && (
            <Button
              variant="secondary"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setTeacherFilter('all');
              }}
            >
              Сбросить фильтры
            </Button>
          )}
        </div>
      )}

      {totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '10px',
            marginTop: '30px',
            padding: '20px',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}
        >
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            style={{ padding: '8px 12px' }}
          >
            <FaChevronLeft />
          </Button>

          {/* ... остальной код пагинации без изменений ... */}
          {/* Чтобы ответ не раздувать, оставь здесь свой текущий блок */}

          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{ padding: '8px 12px' }}
          >
            <FaChevronRight />
          </Button>
        </div>
      )}

      <LessonForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedLesson(null);
        }}
        lesson={selectedLesson}
        onSaved={loadData}
      />

      {detailsLesson && (
        <LessonDetails
          lesson={detailsLesson}
          onClose={() => setDetailsLesson(null)}
          onUpdate={loadData}
        />
      )}

      {/* styles jsx — оставь как есть */}
    </div>
  );
};

export default LessonList;
