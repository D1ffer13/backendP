// frontend/src/components/students/StudentForm.jsx

import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';

const STATUS_OPTIONS = [
  { value: 'active', label: 'Активный' },
  { value: 'selecting_group', label: 'Хочет продолжить. Подбираем группу' },
  { value: 'on_vacation', label: 'В отпуске' },
  { value: 'studying_elsewhere', label: 'Уже занимается в другом центре' },
  { value: 'dissatisfied', label: 'Недоволен' },
  { value: 'not_interested', label: 'Не хочет продолжать' },
  { value: 'moved', label: 'Переехал в другой город' },
  { value: 'archived', label: 'В архиве' }
];

const GENDER_OPTIONS = [
  { value: '', label: 'Не указан' },
  { value: 'male', label: 'Мужской' },
  { value: 'female', label: 'Женский' },
  { value: 'other', label: 'Другой' }
];

// Нормализация телефона к формату +7XXXXXXXXXX
const normalizePhone = (value) => {
  if (!value) return '+7';

  // Оставляем только цифры
  let digits = value.replace(/\D/g, '');

  // Если первый символ 8 — меняем на 7
  if (digits.startsWith('8')) {
    digits = '7' + digits.slice(1);
  }

  // Если не начинается с 7 — добавляем 7
  if (!digits.startsWith('7')) {
    digits = '7' + digits;
  }

  // Оставляем максимум 11 цифр (7 + 10 цифр номера)
  digits = digits.slice(0, 11);

  return '+' + digits;
};

const StudentForm = ({ isOpen, onClose, onSubmit, student }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    middle_name: '',
    phone: '+7',
    phone_comment: '',
    email: '',
    birth_date: '',
    gender: '',
    address: '',
    status: 'active',
    balance: '0.00',
    comment: ''
  });

  useEffect(() => {
    if (student) {
      setFormData({
        first_name: student.first_name || '',
        last_name: student.last_name || '',
        middle_name: student.middle_name || '',
        phone: student.phone ? normalizePhone(student.phone) : '+7',
        phone_comment: student.phone_comment || '',
        email: student.email || '',
        birth_date: student.birth_date ? student.birth_date.split('T')[0] : '',
        gender: student.gender || '',
        address: student.address || '',
        status: student.status || 'active',
        balance:
          typeof student.balance === 'number'
            ? student.balance.toFixed(2)
            : student.balance || '0.00',
        comment: student.comment || ''
      });
    } else {
      setFormData({
        first_name: '',
        last_name: '',
        middle_name: '',
        phone: '+7',
        phone_comment: '',
        email: '',
        birth_date: '',
        gender: '',
        address: '',
        status: 'active',
        balance: '0.00',
        comment: ''
      });
    }
  }, [student, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Специальный onChange для телефона
  const handlePhoneChange = (e) => {
    const raw = e.target.value;
    const normalized = normalizePhone(raw);
    setFormData((prev) => ({
      ...prev,
      phone: normalized
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Доп. проверка: 11 цифр (7 + 10)
    const digits = (formData.phone || '').replace(/\D/g, '');
    if (digits.length !== 11) {
      alert('Введите корректный номер телефона в формате +7XXXXXXXXXX');
      return;
    }

    onSubmit(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={student ? 'Редактировать ученика' : 'Добавить ученика'}
    >
      <form
        onSubmit={handleSubmit}
        style={{ maxHeight: '70vh', overflowY: 'auto', padding: '10px' }}
      >
        {/* Основная информация */}
        <h3 style={{ marginTop: 0, marginBottom: '15px', color: '#333' }}>
          Основная информация
        </h3>

        <div className="form-row">
          <Input
            label="Фамилия *"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            required
          />
          <Input
            label="Имя *"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
          />
        </div>

        <Input
          label="Отчество"
          name="middle_name"
          value={formData.middle_name}
          onChange={handleChange}
        />

        {/* Контактная информация */}
        <h3 style={{ marginTop: '20px', marginBottom: '15px', color: '#333' }}>
          Контакты
        </h3>

        <Input
          label="Телефон"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handlePhoneChange}
          maxLength={12} // +7 и ещё 10 цифр
          placeholder="+7XXXXXXXXXX"
        />

        <div className="form-group">
          <label>Комментарий к телефону</label>
          <textarea
            name="phone_comment"
            value={formData.phone_comment}
            onChange={handleChange}
            rows="2"
            placeholder="Например: Telegram, WhatsApp, рабочий номер и т.д."
          />
        </div>

        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
        />

        {/* Личная информация */}
        <h3 style={{ marginTop: '20px', marginBottom: '15px', color: '#333' }}>
          Личная информация
        </h3>

        <div className="form-row">
          <Input
            label="Дата рождения"
            name="birth_date"
            type="date"
            value={formData.birth_date}
            onChange={handleChange}
          />

          <div className="form-group">
            <label>Пол</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
            >
              {GENDER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Адрес</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            rows="2"
            placeholder="Укажите полный адрес"
          />
        </div>

        {/* Статус и баланс */}
        <h3 style={{ marginTop: '20px', marginBottom: '15px', color: '#333' }}>
          Статус и финансы
        </h3>

        <div className="form-group">
          <label>Статус</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Баланс"
          name="balance"
          type="number"
          step="0.01"
          value={formData.balance}
          onChange={handleChange}
        />

        {/* Комментарии */}
        <h3 style={{ marginTop: '20px', marginBottom: '15px', color: '#333' }}>
          Дополнительно
        </h3>

        <div className="form-group">
          <label>Комментарий</label>
          <textarea
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            rows="4"
            placeholder="Любая дополнительная информация об ученике"
          />
        </div>

        <div
          className="form-actions"
          style={{
            marginTop: '20px',
            paddingTop: '20px',
            borderTop: '1px solid #eee'
          }}
        >
          <Button type="button" variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button type="submit" variant="primary">
            {student ? 'Сохранить' : 'Добавить'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default StudentForm;
