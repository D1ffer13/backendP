// frontend/src/components/students/StudentList.jsx

import React, { useState, useEffect } from 'react';
import {
  FaPlus,
  FaFileImport,
  FaSearch,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';
import { studentService } from '../../services/studentService';
import StudentForm from './StudentForm';
import StudentCard from './StudentCard';
import StudentImport from './StudentImport';
import Table from '../common/Table';
import Button from '../common/Button';
import {
  formatDate,
  formatPhone,
  formatFullName,
  formatCurrency
} from '../../utils/formatters';

// Маппинг статусов для отображения
const STATUS_LABELS = {
  active: 'Активный',
  selecting_group: 'Подбираем группу',
  on_vacation: 'В отпуске',
  studying_elsewhere: 'Занимается в другом центре',
  dissatisfied: 'Недоволен',
  not_interested: 'Не хочет продолжать',
  moved: 'Переехал',
  archived: 'В архиве'
};

const STATUS_COLORS = {
  active: '#27ae60',
  selecting_group: '#f39c12',
  on_vacation: '#3498db',
  studying_elsewhere: '#9b59b6',
  dissatisfied: '#e74c3c',
  not_interested: '#95a5a6',
  moved: '#7f8c8d',
  archived: '#34495e'
};

const ITEMS_PER_PAGE = 30;

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [displayedStudents, setDisplayedStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [viewMode, setViewMode] = useState('table');

  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE) || 1;

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [searchQuery, statusFilter, students]);

  useEffect(() => {
    paginateStudents();
  }, [filteredStudents, currentPage]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const data = await studentService.getAll();
      const list = Array.isArray(data) ? data : [];

      // Бэкенд уже отдаёт студентов отсортированными по id DESC (новые первыми)
      setStudents(list);
      setFilteredStudents(list);
      setCurrentPage(1);
    } catch (error) {
      console.error('Error loading students:', error);
      alert('Ошибка при загрузке учеников');
      setStudents([]);
      setFilteredStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = Array.isArray(students) ? [...students] : [];

    // Фильтрация по поиску
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((student) =>
        [
          student.first_name,
          student.last_name,
          student.middle_name,
          student.phone,
          student.email
        ]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(query))
      );
    }

    // Фильтрация по статусу
    if (statusFilter !== 'all') {
      filtered = filtered.filter((student) => student.status === statusFilter);
    }

    setFilteredStudents(filtered);
    setCurrentPage(1);
  };

  const paginateStudents = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const pageData = filteredStudents.slice(startIndex, endIndex);
    setDisplayedStudents(pageData);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleAdd = () => {
    setSelectedStudent(null);
    setIsFormOpen(true);
  };

  const handleEdit = (student) => {
    setSelectedStudent(student);
    setIsFormOpen(true);
  };

  const handleDelete = async (student) => {
    if (
      !window.confirm(
        `Вы уверены, что хотите удалить ученика ${formatFullName(
          student.first_name,
          student.last_name,
          student.middle_name
        )}?`
      )
    ) {
      return;
    }

    try {
      await studentService.delete(student.id);
      alert('Ученик успешно удален');
      loadStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
      alert('Ошибка при удалении ученика');
    }
  };

  const handleFormSubmit = async (studentData) => {
    try {
      if (selectedStudent) {
        await studentService.update(selectedStudent.id, studentData);
        alert('Ученик успешно обновлен');
      } else {
        await studentService.create(studentData);
        alert('Ученик успешно добавлен');
      }
      setIsFormOpen(false);
      loadStudents();
    } catch (error) {
      console.error('Error saving student:', error);
      alert('Ошибка при сохранении ученика');
    }
  };

  const handleImportSuccess = () => {
    setIsImportOpen(false);
    loadStudents();
  };

  const getStatusCount = (status) => {
    if (status === 'all') return students.length;
    return students.filter((s) => s.status === status).length;
  };

  const columns = [
    {
      header: '№',
      accessor: 'id',
      render: (row, index) => (currentPage - 1) * ITEMS_PER_PAGE + index + 1,
      width: '50px'
    },
    {
      header: 'ФИО',
      accessor: 'full_name',
      render: (row) => (
        <div style={{ minWidth: '180px' }}>
          <strong>
            {formatFullName(row.first_name, row.last_name, row.middle_name)}
          </strong>
        </div>
      )
    },
    {
      header: 'Телефон',
      accessor: 'phone',
      render: (row) => (
        <div style={{ minWidth: '140px' }}>
          <div style={{ fontSize: '14px' }}>{formatPhone(row.phone)}</div>
          {row.phone_comment && (
            <small
              style={{
                color: '#666',
                fontSize: '11px',
                display: 'block',
                marginTop: '2px'
              }}
            >
              {row.phone_comment.length > 20
                ? row.phone_comment.substring(0, 20) + '...'
                : row.phone_comment}
            </small>
          )}
        </div>
      )
    },
    {
      header: 'Email',
      accessor: 'email',
      render: (row) => (
        <div
          style={{
            minWidth: '150px',
            maxWidth: '200px',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          {row.email || '-'}
        </div>
      )
    },
    {
      header: 'Дата рождения',
      accessor: 'birth_date',
      render: (row) => formatDate(row.birth_date),
      width: '120px'
    },
    {
      header: 'Статус',
      accessor: 'status',
      render: (row) => (
        <span
          style={{
            display: 'inline-block',
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: '500',
            backgroundColor: (STATUS_COLORS[row.status] || '#bdc3c7') + '20',
            color: STATUS_COLORS[row.status] || '#7f8c8d',
            whiteSpace: 'nowrap'
          }}
        >
          {STATUS_LABELS[row.status] || row.status || '—'}
        </span>
      ),
      width: '160px'
    },
    {
      header: 'Баланс',
      accessor: 'balance',
      render: (row) => (
        <span
          style={{
            color:
              row.balance < 0
                ? '#e74c3c'
                : row.balance > 0
                ? '#27ae60'
                : '#666',
            fontWeight: '600',
            fontSize: '14px'
          }}
        >
          {formatCurrency(row.balance)}
        </span>
      ),
      width: '100px'
    }
  ];

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Загрузка учеников...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Панель действий */}
      <div className="actions-bar" style={{ marginBottom: '20px' }}>
        <div
          className="actions-left"
          style={{ display: 'flex', gap: '10px', flex: 1 }}
        >
          <div className="search-box" style={{ flex: 1, maxWidth: '400px' }}>
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Поиск учеников..."
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '10px 15px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: 'white',
              cursor: 'pointer',
              minWidth: '200px'
            }}
          >
            <option value="all">Все статусы ({getStatusCount('all')})</option>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label} ({getStatusCount(value)})
              </option>
            ))}
          </select>
        </div>

        <div
          className="actions-right"
          style={{ display: 'flex', gap: '10px' }}
        >
          <Button
            variant="secondary"
            icon={<FaFileImport />}
            onClick={() => setIsImportOpen(true)}
          >
            Импорт
          </Button>
          <Button variant="primary" icon={<FaPlus />} onClick={handleAdd}>
            Добавить ученика
          </Button>
        </div>
      </div>

      {/* Переключатель режима отображения */}
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
          style={{ marginLeft: 'auto', color: '#666', fontSize: '14px' }}
        >
          Показано {displayedStudents.length} из {filteredStudents.length}{' '}
          учеников
        </span>
      </div>

      {viewMode === 'table' ? (
        <div
          style={{
            overflowX: 'auto',
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}
        >
          <Table
            columns={columns}
            data={displayedStudents}
            onEdit={handleEdit}
            onDelete={handleDelete}
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
          {displayedStudents.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {filteredStudents.length === 0 && (
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
            {searchQuery || statusFilter !== 'all'
              ? 'Ученики не найдены'
              : 'Нет учеников'}
          </p>
          {(searchQuery || statusFilter !== 'all') && (
            <Button
              variant="secondary"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
            >
              Сбросить фильтры
            </Button>
          )}
        </div>
      )}

      {/* Пагинация */}
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
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
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

          <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
            {currentPage > 3 && (
              <>
                <button
                  onClick={() => handlePageChange(1)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  1
                </button>
                {currentPage > 4 && (
                  <span style={{ padding: '0 5px' }}>...</span>
                )}
              </>
            )}

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (page) =>
                  page === currentPage ||
                  page === currentPage - 1 ||
                  page === currentPage - 2 ||
                  page === currentPage + 1 ||
                  page === currentPage + 2
              )
              .map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  style={{
                    padding: '8px 12px',
                    border:
                      page === currentPage
                        ? '2px solid #3498db'
                        : '1px solid #ddd',
                    borderRadius: '6px',
                    backgroundColor:
                      page === currentPage ? '#3498db' : 'white',
                    color: page === currentPage ? 'white' : '#333',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: page === currentPage ? '600' : '400',
                    minWidth: '40px'
                  }}
                >
                  {page}
                </button>
              ))}

            {currentPage < totalPages - 2 && (
              <>
                {currentPage < totalPages - 3 && (
                  <span style={{ padding: '0 5px' }}>...</span>
                )}
                <button
                  onClick={() => handlePageChange(totalPages)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #ddd',
                    borderRadius: '6px',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  {totalPages}
                </button>
              </>
            )}
          </div>

          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{ padding: '8px 12px' }}
          >
            <FaChevronRight />
          </Button>

          <span
            style={{ marginLeft: '15px', color: '#666', fontSize: '14px' }}
          >
            Страница {currentPage} из {totalPages}
          </span>
        </div>
      )}

      <StudentForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedStudent(null);
        }}
        onSubmit={handleFormSubmit}
        student={selectedStudent}
      />

      <StudentImport
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onSuccess={handleImportSuccess}
      />

      <style>{`
        .search-box {
          position: relative;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #999;
        }

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

          .actions-left,
          .actions-right {
            width: 100%;
          }

          .search-box {
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
};

export default StudentList;
