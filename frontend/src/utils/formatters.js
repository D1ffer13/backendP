// frontend/src/utils/formatters.js

import { format, parseISO } from 'date-fns';
import { ru } from 'date-fns/locale';

// Безопасный парсинг даты БЕЗ сдвига временных зон
export const parseDateSafe = (dateString) => {
  if (!dateString) return null;
  // Берём только дату, игнорируем время и временную зону
  const dateOnly = dateString.split('T')[0]; // "2025-01-18"
  const [year, month, day] = dateOnly.split('-').map(num => parseInt(num, 10));
  // Создаем дату в локальной временной зоне (не UTC!)
  return new Date(year, month - 1, day, 12, 0, 0); // 12:00 - чтобы избежать проблем с переходом на летнее время
};

// Форматирование даты с безопасным парсингом
export const formatDate = (date, formatStr = 'dd.MM.yyyy') => {
  if (!date) return '';
  try {
    // Если это строка, используем безопасный парсинг
    const dateObj = typeof date === 'string' ? parseDateSafe(date) : date;
    if (!dateObj) return '';
    return format(dateObj, formatStr, { locale: ru });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

// Форматирование даты для календаря (полное название месяца)
export const formatDateLong = (date) => {
  return formatDate(date, 'd MMMM yyyy');
};

// Форматирование даты для отображения дня недели
export const formatDateWithDay = (date) => {
  if (!date) return '';
  try {
    const dateObj = typeof date === 'string' ? parseDateSafe(date) : date;
    if (!dateObj) return '';
    return format(dateObj, 'EEEE, d MMMM yyyy', { locale: ru });
  } catch (error) {
    return '';
  }
};

// Форматирование времени
export const formatTime = (time) => {
  if (!time) return '';
  try {
    // Если время в формате HH:MM:SS, обрезаем секунды
    return time.substring(0, 5);
  } catch (error) {
    return time;
  }
};

// Форматирование телефона
export const formatPhone = (phone) => {
  if (!phone) return '';
  // Удаляем все нецифровые символы
  const cleaned = phone.replace(/\D/g, '');
  // Форматируем как +7 (999) 123-45-67
  if (cleaned.length === 11 && cleaned.startsWith('7')) {
    return `+7 (${cleaned.substring(1, 4)}) ${cleaned.substring(4, 7)}-${cleaned.substring(7, 9)}-${cleaned.substring(9)}`;
  }
  return phone;
};

// Форматирование имени
export const formatFullName = (firstName, lastName, middleName) => {
  const parts = [lastName, firstName, middleName].filter(Boolean);
  return parts.join(' ');
};

// Получить инициалы
export const getInitials = (firstName, lastName, middleName) => {
  const first = firstName ? firstName.charAt(0).toUpperCase() + '.' : '';
  const middle = middleName ? middleName.charAt(0).toUpperCase() + '.' : '';
  return `${lastName} ${first}${middle}`;
};

// Форматирование статуса
export const formatStatus = (status) => {
  const statusMap = {
    active: 'Активен',
    inactive: 'Неактивен',
    scheduled: 'Запланировано',
    completed: 'Завершено',
    cancelled: 'Отменено',
    enrolled: 'Записан',
    'not-enrolled': 'Не записан',
    // Новые статусы для учеников
    archived: 'В архиве',
    not_interested: 'Не хочет продолжать',
    dissatisfied: 'Недоволен',
    studying_elsewhere: 'Занимается в другом центре',
    on_vacation: 'В отпуске',
    wants_to_continue: 'Хочет продолжить',
    selecting_group: 'Подбираем группу',
    moved: 'Переехал в другой город'
  };
  return statusMap[status] || status;
};

// Форматирование валюты
export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '0.00 ₽';
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB'
  }).format(amount);
};

// Форматирование процента
export const formatPercent = (value, decimals = 0) => {
  if (!value && value !== 0) return '0%';
  return `${Number(value).toFixed(decimals)}%`;
};

// Получить цвет статуса
export const getStatusColor = (status) => {
  const colorMap = {
    active: 'success',
    inactive: 'danger',
    scheduled: 'info',
    completed: 'success',
    cancelled: 'danger',
    enrolled: 'success',
    archived: 'secondary',
    not_interested: 'danger',
    dissatisfied: 'warning',
    studying_elsewhere: 'info',
    on_vacation: 'info',
    wants_to_continue: 'success',
    selecting_group: 'warning',
    moved: 'secondary'
  };
  return colorMap[status] || 'secondary';
};

// Валидация email
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Валидация телефона
export const isValidPhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length === 10 || cleaned.length === 11;
};

// Сравнение двух дат (только дату, без времени)
export const isSameDate = (date1, date2) => {
  if (!date1 || !date2) return false;
  const d1 = typeof date1 === 'string' ? parseDateSafe(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseDateSafe(date2) : date2;
  
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
};

// Получить дату в формате YYYY-MM-DD для сравнения
export const getDateString = (date) => {
  if (!date) return '';
  const d = typeof date === 'string' ? parseDateSafe(date) : date;
  if (!d) return '';
  
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};
