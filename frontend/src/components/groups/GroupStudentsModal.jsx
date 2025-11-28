// frontend/src/components/groups/GroupStudentsModal.jsx

import React, { useEffect, useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { groupService } from '../../services/groupService';
import { studentService } from '../../services/studentService';
import { formatFullName, formatPhone } from '../../utils/formatters';
import { FaSearch } from 'react-icons/fa';

const GroupStudentsModal = ({ isOpen, onClose, group }) => {
  const [allStudents, setAllStudents] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (isOpen && group) {
      loadData();
    }
  }, [isOpen, group]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [students, groupStudents] = await Promise.all([
        studentService.getAll(),
        groupService.getStudents(group.id)
      ]);

      setAllStudents(students);
      setSelectedIds(groupStudents.map((s) => s.id));
    } catch (e) {
      console.error('Error loading group students:', e);
      alert('Ошибка при загрузке учеников группы');
    } finally {
      setLoading(false);
    }
  };

  const toggleStudent = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // 1. Сохраняем список учеников в группе
      await groupService.setStudents(group.id, selectedIds);

      // 2. Обновляем max_students = количество выбранных учеников
      const maxStudents = selectedIds.length;
      await groupService.update(group.id, { max_students: maxStudents });

      onClose(true); // сообщаем, что были изменения
    } catch (e) {
      console.error('Error saving group students:', e);
      alert('Ошибка при сохранении учеников группы');
      onClose(false);
    } finally {
      setSaving(false);
    }
  };

  if (!group) return null;

  const filteredStudents = allStudents.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.first_name?.toLowerCase().includes(q) ||
      s.last_name?.toLowerCase().includes(q) ||
      s.middle_name?.toLowerCase().includes(q) ||
      s.phone?.toLowerCase().includes(q)
    );
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => onClose(false)}
      title={`Ученики группы: ${group.name}`}
      size="large"
    >
      {loading ? (
        <div style={{ padding: '20px' }}>Загрузка...</div>
      ) : (
        <div style={{ padding: '20px' }}>
          {/* Поиск */}
          <div style={{ position: 'relative', marginBottom: '12px' }}>
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
              placeholder="Поиск ученика по имени или телефону..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 8px 8px 32px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Список учеников */}
          <div
            style={{
              maxHeight: '60vh',
              overflowY: 'auto',
              padding: '10px 0',
              border: '1px solid #eee',
              borderRadius: '6px'
            }}
          >
            {filteredStudents.length === 0 ? (
              <div style={{ padding: '10px', color: '#999' }}>
                Ученики не найдены
              </div>
            ) : (
              filteredStudents.map((s) => (
                <label
                  key={s.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '6px',
                    padding: '4px 8px'
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(s.id)}
                    onChange={() => toggleStudent(s.id)}
                  />
                  <span>
                    {formatFullName(
                      s.first_name,
                      s.last_name,
                      s.middle_name
                    )}
                    {s.phone && ` — ${formatPhone(s.phone)}`}
                  </span>
                </label>
              ))
            )}
          </div>

          {/* Итог и кнопки */}
          <div
            style={{
              marginTop: '16px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span style={{ fontSize: '13px', color: '#666' }}>
              Выбрано учеников: {selectedIds.length}
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                variant="secondary"
                type="button"
                onClick={() => onClose(false)}
                disabled={saving}
              >
                Отмена
              </Button>
              <Button
                variant="primary"
                type="button"
                onClick={handleSave}
                disabled={saving}
              >
                Сохранить
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default GroupStudentsModal;
