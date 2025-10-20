const express = require('express');
const router = express.Router();
const incomeController = require('../controllers/incomeController');
const { authenticateToken } = require('../middleware/auth');
const { incomeStreamValidation } = require('../middleware/validator');

// All routes require authentication
router.use(authenticateToken);

// Income stream CRUD
router.get('/', incomeController.getAllIncomeStreams);
router.post('/', incomeStreamValidation, incomeController.createIncomeStream);
router.get('/upcoming', incomeController.getUpcomingIncome);
router.get('/stats', incomeController.getIncomeStats);
router.get('/:id', incomeController.getIncomeStreamById);
router.put('/:id', incomeController.updateIncomeStream);
router.delete('/:id', incomeController.deleteIncomeStream);

// Income actions
router.post('/:id/receive', incomeController.receiveIncome);
router.get('/:id/transactions', incomeController.getIncomeTransactions);

module.exports = router;
