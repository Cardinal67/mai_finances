const express = require('express');
const router = express.Router();
const spendingPlansController = require('../controllers/spendingPlansController');
const { authenticateToken } = require('../middleware/auth');
const { spendingPlanValidation } = require('../middleware/validator');

// All routes require authentication
router.use(authenticateToken);

// Spending plan CRUD
router.get('/', spendingPlansController.getAllSpendingPlans);
router.post('/', spendingPlanValidation, spendingPlansController.createSpendingPlan);
router.get('/:id', spendingPlansController.getSpendingPlanById);
router.put('/:id', spendingPlansController.updateSpendingPlan);
router.delete('/:id', spendingPlansController.deleteSpendingPlan);

// Spending plan actions
router.post('/:id/complete', spendingPlansController.completeSpendingPlan);

module.exports = router;
