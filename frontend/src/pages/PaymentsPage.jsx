// frontend/src/pages/PaymentsPage.jsx

import React, { useState, useEffect } from 'react';
import { paymentService } from '../services/paymentService';
import { FaPlus, FaMoneyBillWave, FaCalendar, FaUser } from 'react-icons/fa';

const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [paymentsData, statsData] = await Promise.all([
        paymentService.getAll(),
        paymentService.getStats()
      ]);
      setPayments(paymentsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading payments:', error);
      alert('Ошибка при загрузке платежей');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(amount);
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Загрузка...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ margin: 0 }}>💰 Платежи</h1>
        <button
          onClick={() => alert('Форма добавления платежа будет добавлена позже')}
          style={{
            padding: '12px 24px',
            backgroundColor: '#27ae60',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: '500'
          }}
        >
          <FaPlus /> Добавить платеж
        </button>
      </div>

      {/* Статистика */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '20px'
        }}>
          <div style={{
            padding: '20px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Всего платежей</div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#2ecc71' }}>
              {stats.total_payments}
            </div>
          </div>
          <div style={{
            padding: '20px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Общая сумма</div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#27ae60' }}>
              {formatAmount(stats.total_amount || 0)}
            </div>
          </div>
          <div style={{
            padding: '20px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>В ожидании</div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: '#f39c12' }}>
              {formatAmount(stats.pending_amount || 0)}
            </div>
          </div>
        </div>
      )}

      {/* Таблица платежей */}
      <div style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaUser /> Студент
                </div>
              </th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Занятие</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaMoneyBillWave /> Сумма
                </div>
              </th>
              <th style={{ padding: '12px', textAlign: 'left' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaCalendar /> Дата
                </div>
              </th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Способ</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Статус</th>
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>💸</div>
                  <div>Платежей не найдено</div>
                </td>
              </tr>
            ) : (
              payments.map(payment => (
                <tr key={payment.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: '500' }}>
                      {payment.student_last_name} {payment.student_first_name}
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {payment.lesson_subject || 'Общий платеж'}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontWeight: '600', color: '#27ae60' }}>
                      {formatAmount(payment.amount)}
                    </div>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {formatDate(payment.payment_date)}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      backgroundColor: '#e8f4f8',
                      color: '#0c5460'
                    }}>
                      {payment.payment_method === 'cash' ? '💵 Наличные' :
                       payment.payment_method === 'card' ? '💳 Карта' :
                       payment.payment_method === 'transfer' ? '🏦 Перевод' : payment.payment_method}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor: payment.status === 'completed' ? '#d4edda' : 
                                     payment.status === 'pending' ? '#fff3cd' : '#f8d7da',
                      color: payment.status === 'completed' ? '#155724' : 
                             payment.status === 'pending' ? '#856404' : '#721c24'
                    }}>
                      {payment.status === 'completed' ? '✅ Оплачено' :
                       payment.status === 'pending' ? '⏳ Ожидание' : '❌ Отменено'}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentsPage;
