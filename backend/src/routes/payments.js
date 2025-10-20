const express = require('express');
const router = express.Router();
const paymentsController = require('../controllers/paymentsController');
const { authenticateToken } = require('../middleware/auth');
const { paymentValidation } = require('../middleware/validator');

// All routes require authentication
router.use(authenticateToken);

// Payment CRUD
router.get('/', paymentsController.getAllPayments);
router.get('/recent-recipients', paymentsController.getRecentRecipients);
router.post('/', paymentValidation, paymentsController.createPayment);
router.get('/:id', paymentsController.getPaymentById);
router.put('/:id', paymentsController.updatePayment);
router.delete('/:id', paymentsController.deletePayment);

// Payment transactions
router.post('/:id/transactions', paymentsController.recordTransaction);
router.get('/:id/transactions', paymentsController.getPaymentTransactions);

// Payment actions
router.put('/:id/reschedule', paymentsController.reschedulePayment);
router.get('/:id/history', paymentsController.getPaymentHistory);

module.exports = router;
