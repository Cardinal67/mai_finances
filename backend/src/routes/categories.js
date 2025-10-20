const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categoriesController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Category CRUD
router.get('/', categoriesController.getAllCategories);
router.post('/', categoriesController.createCategory);
router.get('/:id', categoriesController.getCategoryById);
router.put('/:id', categoriesController.updateCategory);
router.delete('/:id', categoriesController.deleteCategory);

module.exports = router;
