// frontend/src/pages/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FaUsers, FaChalkboardTeacher, FaCalendarAlt, FaMoneyBillWave, FaChartLine } from 'react-icons/fa';
import { lessonService } from '../services/lessonService';
import { studentService } from '../services/studentService';
import { teacherService } from '../services/teacherService';

const Dashboard = () => {
  const { user, isAdmin, isTeacher } = useAuth();
  const [stats, setStats] = useState({
    lessonStats: null,
    studentsCount: 0,
    teachersCount: 0,
    loading: true
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [lessonStats, students, teachers] = await Promise.all([
        lessonService.getStats(),
        studentService.getAll(),
        isAdmin ? teacherService.getAll() : Promise.resolve([])
      ]);

      setStats({
        lessonStats,
        studentsCount: students.length,
        teachersCount: teachers.length,
        loading: false
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  if (stats.loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '400px' 
      }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Приветствие */}
      <div style={{
        marginBottom: '30px',
        padding: '30px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '16px',
        color: 'white'
      }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '32px' }}>
          Добро пожаловать, {user?.teacher_name || user?.email}! 👋
        </h1>
        <p style={{ margin: 0, fontSize: '16px', opacity: 0.9 }}>
          {isAdmin ? '👑 Панель администратора' : '👨‍🏫 Панель преподавателя'}
        </p>
      </div>

      {/* Статистика */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {/* Всего занятий */}
        <StatCard
          icon={<FaCalendarAlt />}
          title="Всего занятий"
          value={stats.lessonStats?.total_lessons || 0}
          color="#3498db"
        />

        {/* Запланировано */}
        <StatCard
          icon={<FaChartLine />}
          title="Запланировано"
          value={stats.lessonStats?.scheduled_lessons || 0}
          color="#2ecc71"
        />

        {/* Завершено */}
        <StatCard
          icon={<FaMoneyBillWave />}
          title="Завершено"
          value={stats.lessonStats?.completed_lessons || 0}
          color="#9b59b6"
        />

        {/* Студенты */}
        <StatCard
          icon={<FaUsers />}
          title="Студентов"
          value={stats.studentsCount}
          color="#e67e22"
        />

        {/* Преподаватели (только для админа) */}
        {isAdmin && (
          <StatCard
            icon={<FaChalkboardTeacher />}
            title="Преподавателей"
            value={stats.teachersCount}
            color="#e74c3c"
          />
        )}
      </div>

      {/* Быстрый доступ */}
      <div style={{
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginTop: 0 }}>Быстрый доступ</h3>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <QuickLink href="/lessons" icon="📅" text="Расписание" />
          <QuickLink href="/students" icon="👥" text="Студенты" />
          <QuickLink href="/enrollments" icon="📝" text="Записи" />
          {isAdmin && <QuickLink href="/teachers" icon="👨‍🏫" text="Преподаватели" />}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, color }) => (
  <div style={{
    padding: '25px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  }}>
    <div style={{
      width: '60px',
      height: '60px',
      borderRadius: '12px',
      backgroundColor: `${color}20`,
      color: color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '28px'
    }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
        {title}
      </div>
      <div style={{ fontSize: '32px', fontWeight: '700', color: '#2c3e50' }}>
        {value}
      </div>
    </div>
  </div>
);

const QuickLink = ({ href, icon, text }) => (
  <a
    href={href}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '12px 20px',
      backgroundColor: '#f8f9fa',
      borderRadius: '8px',
      textDecoration: 'none',
      color: '#2c3e50',
      transition: 'all 0.2s'
    }}
    onMouseEnter={(e) => {
      e.target.style.backgroundColor = '#e9ecef';
      e.target.style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={(e) => {
      e.target.style.backgroundColor = '#f8f9fa';
      e.target.style.transform = 'translateY(0)';
    }}
  >
    <span style={{ fontSize: '20px' }}>{icon}</span>
    <span style={{ fontWeight: '500' }}>{text}</span>
  </a>
);

export default Dashboard;
