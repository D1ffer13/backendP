// frontend/src/components/layout/MainLayout.jsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const MainLayout = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="app-header-left">
          <span className="app-logo">Paraplan CRM</span>
          <nav className="app-nav">
            <NavLink to="/" end className="app-nav-link">
              Главная
            </NavLink>
            <NavLink to="/students" className="app-nav-link">
              Ученики
            </NavLink>
            {isAdmin && (
              <NavLink to="/teachers" className="app-nav-link">
                Преподаватели
              </NavLink>
            )}
            <NavLink to="/lessons" className="app-nav-link">
              Занятия
            </NavLink>
            <NavLink to="/enrollments" className="app-nav-link">
              Записи
            </NavLink>
            <NavLink to="/payments" className="app-nav-link">
              Платежи
            </NavLink>
            <NavLink to="/attendance" className="app-nav-link">
              Посещаемость
            </NavLink>
            <NavLink to="/schedule" className="app-nav-link">
              Расписание
            </NavLink>
          </nav>
        </div>

        <div className="app-header-right">
          {user && (
            <>
              <span className="app-user">
                {user.first_name} {user.last_name} ({user.role})
              </span>
              <button className="app-logout-btn" onClick={handleLogout}>
                Выйти
              </button>
            </>
          )}
        </div>
      </header>

      <main className="app-content">{children}</main>
    </div>
  );
};

export default MainLayout;
