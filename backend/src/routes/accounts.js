const express = require('express');
const router = express.Router();
const accountsController = require('../controllers/accountsController');
const { authenticateToken } = require('../middleware/auth');
const { accountValidation } = require('../middleware/validator');

// All routes require authentication
router.use(authenticateToken);

// Account CRUD
router.get('/', accountsController.getAllAccounts);
router.post('/', accountValidation, accountsController.createAccount);
router.get('/:id', accountsController.getAccountById);
router.put('/:id', accountsController.updateAccount);
router.delete('/:id', accountsController.deleteAccount);

// Account utilities
router.get('/:id/safe-to-spend', accountsController.getSafeToSpend);

module.exports = router;
