const { body, validationResult } = require('express-validator');

/**
 * Middleware to check validation results
 */
function validate(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            success: false, 
            errors: errors.array() 
        });
    }
    next();
}

/**
 * Validation rules for user registration
 */
const registerValidation = [
    body('username')
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage('Username must be between 3 and 50 characters')
        .matches(/^[a-zA-Z0-9_-]+$/)
        .withMessage('Username can only contain letters, numbers, underscores, and hyphens'),
    body('email')
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage('Must be a valid email address'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    validate
];

/**
 * Validation rules for user login
 */
const loginValidation = [
    body('username')
        .trim()
        .notEmpty()
        .withMessage('Username or email is required'),
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    validate
];

/**
 * Validation rules for payment creation/update
 */
const paymentValidation = [
    body('contact_id')
        .isUUID()
        .withMessage('Valid contact ID is required'),
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Description is required'),
    body('original_amount')
        .isFloat({ min: 0.01 })
        .withMessage('Amount must be greater than 0'),
    body('due_date')
        .isISO8601()
        .withMessage('Valid due date is required'),
    body('payment_type')
        .isIn(['owed_by_me', 'owed_to_me'])
        .withMessage('Payment type must be either owed_by_me or owed_to_me'),
    validate
];

/**
 * Validation rules for account creation/update
 */
const accountValidation = [
    body('account_name')
        .trim()
        .notEmpty()
        .withMessage('Account name is required'),
    body('account_type')
        .isIn(['checking', 'savings', 'credit_card', 'cash', 'investment', 'other'])
        .withMessage('Invalid account type'),
    body('current_balance')
        .optional()
        .isFloat()
        .withMessage('Balance must be a valid number'),
    validate
];

/**
 * Validation rules for contact creation/update
 */
const contactValidation = [
    body('current_name')
        .trim()
        .notEmpty()
        .withMessage('Contact name is required'),
    body('contact_type')
        .isIn(['person', 'business', 'utility', 'other'])
        .withMessage('Invalid contact type'),
    body('email')
        .optional()
        .isEmail()
        .normalizeEmail()
        .withMessage('Must be a valid email address'),
    validate
];

/**
 * Validation rules for income stream creation/update
 */
const incomeStreamValidation = [
    body('source_name')
        .trim()
        .notEmpty()
        .withMessage('Income source name is required'),
    body('source_type')
        .isIn(['salary', 'wages', 'freelance', 'business', 'rental', 'investment', 'gift', 'other'])
        .withMessage('Invalid income source type'),
    body('amount')
        .isFloat({ min: 0.01 })
        .withMessage('Amount must be greater than 0'),
    validate
];

/**
 * Validation rules for spending plan creation/update
 */
const spendingPlanValidation = [
    body('plan_name')
        .trim()
        .notEmpty()
        .withMessage('Plan name is required'),
    body('planned_amount')
        .isFloat({ min: 0.01 })
        .withMessage('Planned amount must be greater than 0'),
    validate
];

module.exports = {
    validate,
    registerValidation,
    loginValidation,
    paymentValidation,
    accountValidation,
    contactValidation,
    incomeStreamValidation,
    spendingPlanValidation
};

