// frontend/src/components/layout/Sidebar.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaUsers,
  FaChalkboardTeacher,
  FaBook,
  FaCalendarAlt,
  FaClipboardCheck
} from 'react-icons/fa';

const Sidebar = () => {
  const menuItems = [
    { path: '/students', icon: FaUsers, label: 'Ученики' },
    { path: '/teachers', icon: FaChalkboardTeacher, label: 'Педагоги' },
    { path: '/lessons', icon: FaBook, label: 'Занятия' },
    { path: '/schedule', icon: FaCalendarAlt, label: 'Расписание' },
    { path: '/attendance', icon: FaClipboardCheck, label: 'Посещаемость' }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        🎓 Учебный центр
      </div>
      <nav>
        <ul className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => (isActive ? 'active' : '')}
                >
                  <Icon />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
