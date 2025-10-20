const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const creditCardsController = require('../controllers/creditCardsController');

// All routes require authentication
router.use(authenticateToken);

// Credit Card CRUD
router.get('/', creditCardsController.getAllCreditCards);
router.get('/utilization', creditCardsController.getCreditUtilization);
router.get('/:id', creditCardsController.getCreditCardById);
router.post('/', creditCardsController.createCreditCard);
router.put('/:id', creditCardsController.updateCreditCard);
router.delete('/:id', creditCardsController.deleteCreditCard);

module.exports = router;

