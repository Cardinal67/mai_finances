const express = require('express');
const router = express.Router();
const preferencesController = require('../controllers/preferencesController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Preferences endpoints
router.get('/', preferencesController.getPreferences);
router.put('/', preferencesController.updatePreferences);
router.get('/dashboard-layout', preferencesController.getDashboardLayout);
router.put('/dashboard-layout', preferencesController.updateDashboardLayout);
router.post('/reset', preferencesController.resetPreferences);

module.exports = router;
