// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

import Layout from './components/layout/Layout';

import StudentList from './components/students/StudentList';
import TeacherList from './components/teachers/TeacherList';
import LessonList from './components/lessons/LessonList';
import Calendar from './components/lessons/Calendar';
import AttendanceTable from './components/attendance/AttendanceTable';

import Login from './pages/Login';
import Register from './pages/Register';

// НОВОЕ: страница настроек педагога
import TeacherDetailsPage from './pages/TeacherDetailsPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Публичные страницы */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Защищённые */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <StudentList />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/students"
            element={
              <ProtectedRoute>
                <Layout>
                  <StudentList />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/teachers"
            element={
              <ProtectedRoute>
                <Layout>
                  <TeacherList />
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* НОВЫЙ РОУТ НАСТРОЙКИ ПЕДАГОГА */}
          <Route
            path="/teachers/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <TeacherDetailsPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/lessons"
            element={
              <ProtectedRoute>
                <Layout>
                  <LessonList />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/schedule"
            element={
              <ProtectedRoute>
                <Layout>
                  <Calendar />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/attendance"
            element={
              <ProtectedRoute>
                <Layout>
                  <AttendanceTable />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/students" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
