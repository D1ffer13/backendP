// frontend/src/pages/TeacherDetailsPage.jsx

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { teacherService } from '../services/teacherService';
import { subjectService } from '../services/subjectService';
import { groupService } from '../services/groupService';
import GroupStudentsModal from '../components/groups/GroupStudentsModal';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Modal from '../components/common/Modal';
import { formatFullName } from '../utils/formatters';

const TeacherDetailsPage = () => {
  const { id } = useParams();
  const teacherId = Number(id);

  const [teacher, setTeacher] = useState(null);
  const [allSubjects, setAllSubjects] = useState([]);
  const [teacherSubjectIds, setTeacherSubjectIds] = useState([]);
  const [groups, setGroups] = useState([]);

  const [studentsModalGroup, setStudentsModalGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [groupForm, setGroupForm] = useState({
    name: '',
    subject_id: '',
    status: 'active'
  });

  useEffect(() => {
    loadData();
  }, [teacherId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [t, subs, ts, gs] = await Promise.all([
        teacherService.getById(teacherId),
        subjectService.getAll(),
        teacherService.getSubjects(teacherId),
        teacherService.getGroups(teacherId)
      ]);

      setTeacher(t);
      setAllSubjects(subs);
      setTeacherSubjectIds(ts.map((s) => s.id));
      setGroups(gs);
    } catch (e) {
      console.error('Error loading teacher details:', e);
      alert('Ошибка при загрузке данных преподавателя');
    } finally {
      setLoading(false);
    }
  };

  // ===== ПРЕДМЕТЫ =====

  const toggleSubject = (subjectId) => {
    setTeacherSubjectIds((prev) =>
      prev.includes(subjectId)
        ? prev.filter((id) => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  const saveSubjects = async () => {
    try {
      await teacherService.setSubjects(teacherId, teacherSubjectIds);
      await loadData();
      alert('Предметы преподавателя сохранены');
    } catch (e) {
      console.error('Error saving teacher subjects:', e);
      alert('Ошибка при сохранении предметов');
    }
  };

  // ===== ГРУППЫ =====

  const openCreateGroupModal = () => {
    if (teacherSubjectIds.length === 0) {
      alert('Сначала назначьте преподавателю хотя бы один предмет');
      return;
    }
    setEditingGroup(null);
    setGroupForm({
      name: '',
      subject_id: teacherSubjectIds[0] || '',
      status: 'active'
    });
    setIsGroupModalOpen(true);
  };

  const openEditGroupModal = (group) => {
    setEditingGroup(group);
    setGroupForm({
      name: group.name || '',
      subject_id: group.subject_id || '',
      status: group.status || 'active'
    });
    setIsGroupModalOpen(true);
  };

  const handleGroupFormChange = (e) => {
    const { name, value } = e.target;
    setGroupForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveGroup = async (e) => {
    e.preventDefault();

    if (!groupForm.name.trim()) {
      alert('Введите название группы');
      return;
    }
    if (!groupForm.subject_id) {
      alert('Выберите предмет для группы');
      return;
    }

    try {
      if (editingGroup) {
        await groupService.update(editingGroup.id, {
          name: groupForm.name.trim(),
          subject_id: Number(groupForm.subject_id),
          teacher_id: teacherId,
          status: groupForm.status
        });
      } else {
        await groupService.create({
          name: groupForm.name.trim(),
          subject_id: Number(groupForm.subject_id),
          teacher_id: teacherId,
          status: groupForm.status
        });
      }
      setIsGroupModalOpen(false);
      setEditingGroup(null);
      const gs = await teacherService.getGroups(teacherId);
      setGroups(gs);
    } catch (e) {
      console.error('Error saving group:', e);
      alert('Ошибка при сохранении группы');
    }
  };

  const deleteGroup = async (group) => {
    if (!window.confirm(`Удалить группу "${group.name}"?`)) return;
    try {
      await groupService.delete(group.id);
      const gs = await teacherService.getGroups(teacherId);
      setGroups(gs);
    } catch (e) {
      console.error('Error deleting group:', e);
      alert('Ошибка при удалении группы');
    }
  };

  const openGroupStudents = (group) => {
    setStudentsModalGroup(group);
  };

  const closeGroupStudents = async (changed) => {
    setStudentsModalGroup(null);
    if (changed) {
      const gs = await teacherService.getGroups(teacherId);
      setGroups(gs);
    }
  };

  if (loading || !teacher) {
    return (
      <div style={{ padding: '20px' }}>
        Загрузка данных преподавателя...
      </div>
    );
  }

  const teacherSubjectsList = allSubjects.filter((s) =>
    teacherSubjectIds.includes(s.id)
  );

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '10px' }}>
        Преподаватель:{' '}
        {formatFullName(
          teacher.first_name,
          teacher.last_name,
          teacher.middle_name
        )}
      </h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Настройте предметы, группы и учеников этого преподавателя.
      </p>

      {/* ПРЕДМЕТЫ */}
      <section
        style={{
          marginBottom: '30px',
          padding: '20px',
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: '10px' }}>
          Предметы преподавателя
        </h3>
        <div
          style={{
            border: '1px solid #eee',
            borderRadius: '6px',
            padding: '10px',
            maxWidth: '450px',
            maxHeight: '220px',
            overflowY: 'auto'
          }}
        >
          {allSubjects.length === 0 ? (
            <p style={{ color: '#999' }}>Пока нет ни одного предмета.</p>
          ) : (
            allSubjects.map((s) => (
              <label
                key={s.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '6px'
                }}
              >
                <input
                  type="checkbox"
                  checked={teacherSubjectIds.includes(s.id)}
                  onChange={() => toggleSubject(s.id)}
                />
                <span>{s.name}</span>
              </label>
            ))
          )}
        </div>
        <div style={{ marginTop: '10px' }}>
          <Button variant="primary" type="button" onClick={saveSubjects}>
            Сохранить предметы
          </Button>
        </div>
      </section>

      {/* ГРУППЫ */}
      <section
        style={{
          padding: '20px',
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '15px',
            alignItems: 'center'
          }}
        >
          <h3 style={{ margin: 0 }}>Группы преподавателя</h3>
          <Button
            variant="primary"
            type="button"
            onClick={openCreateGroupModal}
          >
            Создать группу
          </Button>
        </div>

        {groups.length === 0 ? (
          <p style={{ color: '#999' }}>
            У преподавателя пока нет групп. Создайте первую группу.
          </p>
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
                <th style={{ padding: '8px', textAlign: 'left' }}>Группа</th>
                <th style={{ padding: '8px', textAlign: 'left' }}>Предмет</th>
                <th style={{ padding: '8px', textAlign: 'center' }}>
                  Макс. уч-ков
                </th>
                <th style={{ padding: '8px', textAlign: 'center' }}>Статус</th>
                <th style={{ padding: '8px', textAlign: 'center' }}>Ученики</th>
                <th style={{ padding: '8px', textAlign: 'center' }}>
                  Действия
                </th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g) => (
                <tr key={g.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '8px' }}>{g.name}</td>
                  <td style={{ padding: '8px' }}>{g.subject_name}</td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>
                    {g.max_students || '-'}
                  </td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>
                    {g.status === 'active' ? 'Активна' : 'Архив'}
                  </td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => openGroupStudents(g)}
                    >
                      Ученики
                    </Button>
                  </td>
                  <td style={{ padding: '8px', textAlign: 'center' }}>
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => openEditGroupModal(g)}
                      style={{ marginRight: '5px' }}
                    >
                      Ред.
                    </Button>
                    <Button
                      variant="secondary"
                      type="button"
                      onClick={() => deleteGroup(g)}
                    >
                      Удалить
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Модалка создания/редактирования группы */}
      {isGroupModalOpen && (
        <Modal
          isOpen={isGroupModalOpen}
          onClose={() => {
            setIsGroupModalOpen(false);
            setEditingGroup(null);
          }}
          title={editingGroup ? 'Редактировать группу' : 'Создать группу'}
        >
          <form onSubmit={saveGroup} style={{ padding: '10px 0' }}>
            <Input
              label="Название группы *"
              name="name"
              value={groupForm.name}
              onChange={handleGroupFormChange}
            />

            <div className="form-group" style={{ marginBottom: '12px' }}>
              <label>Предмет *</label>
              <select
                name="subject_id"
                value={groupForm.subject_id}
                onChange={handleGroupFormChange}
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #ddd',
                  fontSize: '14px'
                }}
              >
                <option value="">Выберите предмет</option>
                {teacherSubjectsList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div
              style={{
                marginTop: '12px',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '8px'
              }}
            >
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsGroupModalOpen(false);
                  setEditingGroup(null);
                }}
              >
                Отмена
              </Button>
              <Button type="submit" variant="primary">
                Сохранить
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Модалка учеников группы */}
      <GroupStudentsModal
        isOpen={!!studentsModalGroup}
        onClose={closeGroupStudents}
        group={studentsModalGroup}
      />
    </div>
  );
};

export default TeacherDetailsPage;
