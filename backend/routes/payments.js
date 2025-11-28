// backend/routes/payments.js
const express = require('express');
const { authenticate } = require('../middleware/auth');
const {
  getAllPayments,
  getPaymentById,
  createPayment,
  updatePayment,
  deletePayment
} = require('../controllers/paymentController');

const router = express.Router();

// Все операции доступны авторизованному пользователю центра
router.use(authenticate);

router.get('/', getAllPayments);
router.get('/:id', getPaymentById);
router.post('/', createPayment);
router.put('/:id', updatePayment);
router.delete('/:id', deletePayment); // ВАЖНО: тут только deletePayment, без undefined

module.exports = router;