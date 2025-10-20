const express = require('express');
const router = express.Router();
const contactsController = require('../controllers/contactsController');
const { authenticateToken } = require('../middleware/auth');
const { contactValidation } = require('../middleware/validator');

// All routes require authentication
router.use(authenticateToken);

// Contact CRUD
router.get('/', contactsController.getAllContacts);
router.post('/', contactValidation, contactsController.createContact);
router.get('/:id', contactsController.getContactById);
router.put('/:id', contactsController.updateContact);
router.delete('/:id', contactsController.deleteContact);

// Contact actions
router.put('/:id/rename', contactsController.renameContact);
router.get('/:id/payments', contactsController.getContactPayments);

module.exports = router;
