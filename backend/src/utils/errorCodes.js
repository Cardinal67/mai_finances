/**
 * Error Codes for Personal Finance Manager API
 * Format: ERR_<CATEGORY>_<SPECIFIC_ERROR>
 */

const ErrorCodes = {
  // Authentication Errors (1000-1099)
  AUTH_VALIDATION_FAILED: { code: 'ERR_AUTH_1001', message: 'Validation failed' },
  AUTH_USERNAME_EXISTS: { code: 'ERR_AUTH_1002', message: 'Username already exists' },
  AUTH_EMAIL_EXISTS: { code: 'ERR_AUTH_1003', message: 'Email already exists' },
  AUTH_INVALID_CREDENTIALS: { code: 'ERR_AUTH_1004', message: 'Invalid username or password' },
  AUTH_USER_NOT_FOUND: { code: 'ERR_AUTH_1005', message: 'User not found' },
  AUTH_TOKEN_INVALID: { code: 'ERR_AUTH_1006', message: 'Invalid or expired token' },
  AUTH_TOKEN_MISSING: { code: 'ERR_AUTH_1007', message: 'Authentication token required' },
  AUTH_REGISTRATION_FAILED: { code: 'ERR_AUTH_1008', message: 'Registration failed' },
  AUTH_PASSWORD_HASH_FAILED: { code: 'ERR_AUTH_1009', message: 'Password hashing failed' },
  
  // Database Errors (2000-2099)
  DB_CONNECTION_FAILED: { code: 'ERR_DB_2001', message: 'Database connection failed' },
  DB_QUERY_FAILED: { code: 'ERR_DB_2002', message: 'Database query failed' },
  DB_TRANSACTION_FAILED: { code: 'ERR_DB_2003', message: 'Database transaction failed' },
  DB_CONSTRAINT_VIOLATION: { code: 'ERR_DB_2004', message: 'Database constraint violation' },
  
  // Resource Errors (3000-3099)
  RESOURCE_NOT_FOUND: { code: 'ERR_RES_3001', message: 'Resource not found' },
  RESOURCE_ALREADY_EXISTS: { code: 'ERR_RES_3002', message: 'Resource already exists' },
  RESOURCE_UNAUTHORIZED: { code: 'ERR_RES_3003', message: 'Unauthorized access to resource' },
  
  // Payment Errors (4000-4099)
  PAYMENT_NOT_FOUND: { code: 'ERR_PAY_4001', message: 'Payment not found' },
  PAYMENT_INVALID_AMOUNT: { code: 'ERR_PAY_4002', message: 'Invalid payment amount' },
  PAYMENT_ALREADY_PAID: { code: 'ERR_PAY_4003', message: 'Payment already completed' },
  
  // Income Errors (5000-5099)
  INCOME_NOT_FOUND: { code: 'ERR_INC_5001', message: 'Income source not found' },
  INCOME_INVALID_AMOUNT: { code: 'ERR_INC_5002', message: 'Invalid income amount' },
  
  // Account Errors (6000-6099)
  ACCOUNT_NOT_FOUND: { code: 'ERR_ACC_6001', message: 'Account not found' },
  ACCOUNT_INSUFFICIENT_BALANCE: { code: 'ERR_ACC_6002', message: 'Insufficient account balance' },
  
  // Validation Errors (7000-7099)
  VALIDATION_FAILED: { code: 'ERR_VAL_7001', message: 'Input validation failed' },
  VALIDATION_MISSING_FIELD: { code: 'ERR_VAL_7002', message: 'Required field missing' },
  VALIDATION_INVALID_FORMAT: { code: 'ERR_VAL_7003', message: 'Invalid data format' },
  
  // Server Errors (9000-9099)
  SERVER_ERROR: { code: 'ERR_SRV_9001', message: 'Internal server error' },
  SERVER_UNAVAILABLE: { code: 'ERR_SRV_9002', message: 'Service temporarily unavailable' },
};

/**
 * Create an error response object
 * @param {Object} errorCode - Error code object from ErrorCodes
 * @param {Object} details - Additional error details
 * @param {Error} originalError - Original error object for logging
 */
function createErrorResponse(errorCode, details = {}, originalError = null) {
  const response = {
    success: false,
    error: {
      code: errorCode.code,
      message: errorCode.message,
      ...details
    }
  };

  // Add original error details in development mode
  if (process.env.NODE_ENV === 'development' && originalError) {
    response.error.debug = {
      message: originalError.message,
      stack: originalError.stack
    };
  }

  return response;
}

module.exports = {
  ErrorCodes,
  createErrorResponse
};

