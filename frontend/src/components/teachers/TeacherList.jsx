// frontend/src/components/teachers/TeacherList.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaCogs } from 'react-icons/fa';
import { teacherService } from '../../services/teacherService';
import Button from '../common/Button';
import TeacherForm from './TeacherForm';

const TeacherList = () => {
  const [teachers, setTeachers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('table'); // table | cards
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    loadTeachers();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [search, teachers]);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      const data = await teacherService.getAll();
      setTeachers(data);
      setFiltered(data);
    } catch (error) {
      console.error('Error loading teachers:', error);
      alert('Ошибка при загрузке педагогов');
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    if (!search.trim()) {
      setFiltered(teachers);
      return;
    }
    const q = search.toLowerCase();
    setFiltered(
      teachers.filter(
        (t) =>
          t.first_name?.toLowerCase().includes(q) ||
          t.last_name?.toLowerCase().includes(q) ||
          t.middle_name?.toLowerCase().includes(q) ||
          t.specialization?.toLowerCase().includes(q) ||
          t.phone?.toLowerCase().includes(q)
      )
    );
  };

  const openCreateModal = () => {
    setEditingTeacher(null);
    setIsModalOpen(true);
  };

  const openEditModal = (teacher) => {
    setEditingTeacher(teacher);
    setIsModalOpen(true);
  };

  const handleDelete = async (teacher) => {
    if (
      !window.confirm(
        `Полностью удалить преподавателя ${teacher.last_name} ${teacher.first_name}?`
      )
    ) {
      return;
    }
    try {
      await teacherService.delete(teacher.id);
      await loadTeachers();
    } catch (e) {
      console.error('Error deleting teacher:', e);
      alert(
        e.response?.data?.error ||
          'Не удалось удалить педагога.'
      );
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>Загрузка...</div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* Заголовок и действия */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '20px',
          alignItems: 'center'
        }}
      >
        <h1 style={{ margin: 0 }}>Педагоги</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="secondary">Импорт из Excel</Button>
          <Button variant="primary" icon={<FaPlus />} onClick={openCreateModal}>
            Добавить педагога
          </Button>
        </div>
      </div>

      {/* Поиск и переключатель вида */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
          marginBottom: '15px',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: 320 }}>
          <FaSearch
            style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#999'
            }}
          />
          <input
            type="text"
            placeholder="Поиск педагогов..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 8px 8px 30px',
              borderRadius: '6px',
              border: '1px solid #ddd',
              fontSize: '14px'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
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
        </div>
      </div>

      {/* Таблица / Карточки */}
      {viewMode === 'table' ? (
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
                <th style={{ padding: '12px' }}>№</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>ФИО</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>
                  Специализация
                </th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Телефон</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Статус</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>
                  Действия
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, index) => (
                <tr key={t.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    {index + 1}
                  </td>
                  <td style={{ padding: '12px' }}>
                    {t.last_name} {t.first_name} {t.middle_name}
                  </td>
                  <td style={{ padding: '12px' }}>{t.specialization}</td>
                  <td style={{ padding: '12px' }}>{t.phone}</td>
                  <td style={{ padding: '12px' }}>{t.email}</td>
                  <td style={{ padding: '12px' }}>
                    <span
                      style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        backgroundColor:
                          t.status === 'active' ? '#d4edda' : '#f8d7da',
                        color:
                          t.status === 'active' ? '#155724' : '#721c24'
                      }}
                    >
                      {t.status === 'active' ? 'Активен' : 'Неактивен'}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: '12px',
                      textAlign: 'center',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <button
                      onClick={() => openEditModal(t)}
                      style={{
                        padding: '6px 8px',
                        marginRight: '6px',
                        backgroundColor: '#3498db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                      title="Редактировать"
                    >
                      <FaEdit />
                    </button>

                    <button
                      onClick={() => navigate(`/teachers/${t.id}`)}
                      style={{
                        padding: '6px 8px',
                        marginRight: '6px',
                        backgroundColor: '#6c5ce7',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                      title="Настроить предметы и группы"
                    >
                      <FaCogs />
                    </button>

                    <button
                      onClick={() => handleDelete(t)}
                      style={{
                        padding: '6px 8px',
                        backgroundColor: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                      title="Удалить"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* КАРТОЧКИ */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: '16px'
          }}
        >
          {filtered.map((t) => (
            <div
              key={t.id}
              style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
                padding: '12px 14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '8px'
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: 600,
                      fontSize: '15px',
                      marginBottom: '2px'
                    }}
                  >
                    {t.last_name} {t.first_name}{' '}
                    {t.middle_name && t.middle_name}
                  </div>
                  <div
                    style={{
                      fontSize: '13px',
                      color: '#666'
                    }}
                  >
                    {t.specialization || 'Без специализации'}
                  </div>
                </div>
                <span
                  style={{
                    padding: '3px 10px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    backgroundColor:
                      t.status === 'active' ? '#d4edda' : '#f8d7da',
                    color: t.status === 'active' ? '#155724' : '#721c24',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {t.status === 'active' ? 'Активен' : 'Неактивен'}
                </span>
              </div>

              <div
                style={{
                  fontSize: '13px',
                  color: '#555',
                  marginTop: '6px'
                }}
              >
                {t.phone && (
                  <div>
                    <strong>Телефон:</strong> {t.phone}
                  </div>
                )}
                {t.email && (
                  <div>
                    <strong>Email:</strong> {t.email}
                  </div>
                )}
              </div>

              {t.notes && (
                <div
                  style={{
                    fontSize: '12px',
                    color: '#777',
                    marginTop: '4px'
                  }}
                >
                  <strong>Примечание:</strong> {t.notes}
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '6px',
                  marginTop: '8px'
                }}
              >
                <button
                  onClick={() => navigate(`/teachers/${t.id}`)}
                  style={{
                    padding: '5px 8px',
                    backgroundColor: '#6c5ce7',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                  title="Настроить предметы и группы"
                >
                  Настроить
                </button>
                <button
                  onClick={() => openEditModal(t)}
                  style={{
                    padding: '5px 8px',
                    backgroundColor: '#3498db',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                  title="Редактировать"
                >
                  Изменить
                </button>
                <button
                  onClick={() => handleDelete(t)}
                  style={{
                    padding: '5px 8px',
                    backgroundColor: '#e74c3c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                  title="Удалить"
                >
                  Удалить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Модалка создания/редактирования педагога */}
      <TeacherForm
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTeacher(null);
        }}
        onSaved={loadTeachers}
        teacher={editingTeacher}
      />
    </div>
  );
};

export default TeacherList;
