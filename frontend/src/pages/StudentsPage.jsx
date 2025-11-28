// frontend/src/pages/StudentsPage.jsx

import React, { useState, useEffect } from 'react';
import { studentService } from '../services/studentService';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaPhone, FaEnvelope } from 'react-icons/fa';
import StudentModal from '../components/Modals/StudentModal';

const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const data = await studentService.getAll();
      console.log('📚 Students loaded:', data); // DEBUG
      setStudents(data);
    } catch (error) {
      console.error('❌ Error loading students:', error);
      alert('Ошибка при загрузке студентов');
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student =>
    `${student.first_name} ${student.last_name} ${student.phone}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddStudent = () => {
    console.log('🔵 Add button clicked!'); // DEBUG
    console.log('🔵 showModal before:', showModal); // DEBUG
    setCurrentStudent(null);
    setShowModal(true);
    console.log('🔵 Setting showModal to true'); // DEBUG
  };

  const handleEditStudent = (student) => {
    console.log('✏️ Edit button clicked for:', student); // DEBUG
    setCurrentStudent(student);
    setShowModal(true);
  };

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm('Удалить студента?')) {
      try {
        await studentService.delete(studentId);
        console.log('🗑️ Student deleted:', studentId); // DEBUG
        loadStudents();
      } catch (error) {
        console.error('❌ Error deleting student:', error);
        alert('Ошибка при удалении');
      }
    }
  };

  const handleCloseModal = () => {
    console.log('🔴 Closing modal...'); // DEBUG
    setShowModal(false);
    setCurrentStudent(null);
  };

  const handleSaveStudent = () => {
    console.log('💾 Student saved, reloading...'); // DEBUG
    loadStudents();
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        ⏳ Загрузка...
      </div>
    );
  }

  console.log('🟢 Rendering StudentsPage, showModal =', showModal); // DEBUG

  return (
    <div>
      {/* Заголовок и кнопка */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px' 
      }}>
        <h1 style={{ margin: 0 }}>👨‍🎓 Студенты</h1>
        <button
          onClick={handleAddStudent}
          style={{
            padding: '12px 24px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: '600',
            fontSize: '15px'
          }}
        >
          <FaPlus /> Добавить студента
        </button>
      </div>

      {/* Поиск */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <FaSearch style={{ 
            position: 'absolute', 
            left: '12px', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            color: '#999' 
          }} />
          <input
            type="text"
            placeholder="Поиск студента..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 12px 12px 40px',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
        </div>
      </div>

      {/* Таблица */}
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '12px', 
        overflow: 'hidden', 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>ФИО</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Телефон</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Статус</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                  📭 Студенты не найдены
                </td>
              </tr>
            ) : (
              filteredStudents.map(student => (
                <tr key={student.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: '500' }}>
                      {student.last_name} {student.first_name} {student.middle_name}
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FaPhone style={{ fontSize: '12px', color: '#666' }} />
                      {student.phone}
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {student.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaEnvelope style={{ fontSize: '12px', color: '#666' }} />
                        {student.email}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      backgroundColor: student.status === 'active' ? '#d4edda' : '#f8d7da',
                      color: student.status === 'active' ? '#155724' : '#721c24'
                    }}>
                      {student.status === 'active' ? '✅ Активен' : '❌ Неактивен'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleEditStudent(student)}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#3498db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        marginRight: '8px'
                      }}
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => handleDeleteStudent(student.id)}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Модальное окно */}
      {console.log('🟣 Rendering StudentModal component, isOpen =', showModal)}
      <StudentModal
        isOpen={showModal}
        onClose={handleCloseModal}
        student={currentStudent}
        onSave={handleSaveStudent}
      />
    </div>
  );
};

export default StudentsPage;
