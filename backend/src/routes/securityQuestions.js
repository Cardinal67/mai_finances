const express = require('express');
const router = express.Router();
const securityQuestionsController = require('../controllers/securityQuestionsController');
const { authenticateToken } = require('../middleware/auth');

// Public routes (no auth required)
router.get('/questions', securityQuestionsController.getQuestions);
router.get('/random-question', securityQuestionsController.getRandomQuestion);
router.post('/verify-and-reset', securityQuestionsController.verifyAndResetPassword);

// Protected routes (auth required)
router.post('/set', authenticateToken, securityQuestionsController.setSecurityQuestions);
router.get('/has-questions', authenticateToken, securityQuestionsController.hasSecurityQuestions);

module.exports = router;

