// frontend/src/components/layout/Header.jsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const getPageTitle = () => {
    const titles = {
      '/students': 'Ученики',
      '/teachers': 'Педагоги',
      '/lessons': 'Занятия',
      '/schedule': 'Расписание',
      '/attendance': 'Посещаемость'
    };
    return titles[location.pathname] || 'Панель управления';
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="header">
      <div className="header-left">
        <h1>{getPageTitle()}</h1>
      </div>

      {user && (
        <div className="header-right">
          <div className="header-user-info">
            <div className="header-user-name">
              {user.first_name} {user.last_name}
            </div>
            <div className="header-user-role">
              {user.role === 'admin' ? 'Администратор' : 'Преподаватель'}
            </div>
          </div>
          <button className="btn btn-secondary header-logout-btn" onClick={handleLogout}>
            Выйти
          </button>
        </div>
      )}
    </header>
  );
};

export default Header;
