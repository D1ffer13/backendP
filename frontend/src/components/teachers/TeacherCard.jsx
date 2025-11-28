import React from 'react';
import { FaEdit, FaTrash, FaPhone, FaEnvelope, FaChalkboardTeacher } from 'react-icons/fa';
import { formatPhone, formatFullName } from '../../utils/formatters';

const TeacherCard = ({ teacher, onEdit, onDelete }) => {
  return (
    <div className="card">
      <div className="card-header">
        <div>
          <h3 className="card-title">
            {formatFullName(teacher.first_name, teacher.last_name, teacher.middle_name)}
          </h3>
          <span className={`status-badge ${teacher.status}`}>
            {teacher.status === 'active' ? 'Активен' : 'Неактивен'}
          </span>
        </div>
        <div className="table-actions">
          <button className="icon-btn edit" onClick={() => onEdit(teacher)}>
            <FaEdit />
          </button>
          <button className="icon-btn delete" onClick={() => onDelete(teacher)}>
            <FaTrash />
          </button>
        </div>
      </div>
      <div className="card-body">
        {teacher.specialization && (
          <p>
            <FaChalkboardTeacher /> <strong>{teacher.specialization}</strong>
          </p>
        )}
        {teacher.phone && (
          <p>
            <FaPhone /> {formatPhone(teacher.phone)}
          </p>
        )}
        {teacher.email && (
          <p>
            <FaEnvelope /> {teacher.email}
          </p>
        )}
        {teacher.notes && (
          <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #e0e0e0' }}>
            <p><strong>Примечания:</strong></p>
            <p style={{ fontSize: '14px', color: '#666' }}>{teacher.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherCard;