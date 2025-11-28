// frontend/src/pages/Register.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError('Заполните все поля');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    try {
      setLoading(true);
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        confirmPassword: form.confirmPassword
      });
      navigate('/students');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Регистрация центра</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Название центра</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Например: Лингва Плюс"
              required
            />
          </div>

          <div className="form-group">
            <label>Email для входа</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Пароль</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(s => !s)}
              >
                {showPassword ? 'Скрыть' : 'Показать'}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Подтверждение пароля</label>
            <div className="password-wrapper">
              <input
                type={showConfirm ? 'text' : 'password'}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirm(s => !s)}
              >
                {showConfirm ? 'Скрыть' : 'Показать'}
              </button>
            </div>
          </div>

          <div className="form-actions" style={{ justifyContent: 'space-between' }}>
            <Link to="/login">У меня уже есть аккаунт</Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
