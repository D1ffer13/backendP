// frontend/src/pages/Login.jsx

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Если уже авторизован – редирект на главную
  useEffect(() => {
    if (user) {
      navigate('/students');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login({ email, password });
      navigate('/students');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Неверный email или пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f6fa',
        padding: '16px'
      }}
    >
      <div
        style={{
          maxWidth: '450px',
          width: '100%',
          backgroundColor: 'white',
          padding: '32px 24px',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        }}
      >
        {/* Заголовок */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎓</div>
          <h1
            style={{
              margin: '0 0 6px 0',
              fontSize: '24px',
              color: '#2c3e50'
            }}
          >
            Education CRM
          </h1>
          <p
            style={{
              margin: 0,
              color: '#7f8c8d',
              fontSize: '13px'
            }}
          >
            Вход в панель вашего центра
          </p>
        </div>

        {/* Сообщение об ошибке */}
        {error && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: '#fee',
              color: '#c33',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '13px',
              border: '1px solid #fcc'
            }}
          >
            {error}
          </div>
        )}

        {/* Форма */}
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: '18px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: 500,
                color: '#2c3e50'
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '14px',
                transition: 'border-color 0.2s',
                outline: 'none'
              }}
            />
          </div>

          {/* Пароль с глазиком */}
          <div style={{ marginBottom: '22px' }}>
            <label
              style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '14px',
                fontWeight: 500,
                color: '#2c3e50'
              }}
            >
              Пароль
            </label>
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: '10px 80px 10px 14px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  transition: 'border-color 0.2s',
                  outline: 'none'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: '#3498db',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                {showPassword ? 'Скрыть' : 'Показать'}
              </button>
            </div>
          </div>

          {/* Кнопки */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: loading ? '#95a5a6' : '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s'
            }}
          >
            {loading ? 'Входим...' : 'Войти'}
          </button>

          {/* Ссылка на регистрацию */}
          <div
            style={{
              marginTop: '14px',
              textAlign: 'center',
              fontSize: '13px',
              color: '#7f8c8d'
            }}
          >
            Нет аккаунта?{' '}
            <Link to="/register" style={{ color: '#3498db' }}>
              Зарегистрировать центр
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
