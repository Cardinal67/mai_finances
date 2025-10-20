const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Dashboard endpoints
router.get('/summary', dashboardController.getDashboardSummary);
router.post('/what-if-spending', dashboardController.calculateWhatIfSpending);

module.exports = router;
