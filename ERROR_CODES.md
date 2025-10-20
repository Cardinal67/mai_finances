# Error Codes Reference

## Personal Finance Manager API Error Codes

All API errors return a standardized format with error codes for easy debugging and logging.

---

## Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "ERR_AUTH_1002",
    "message": "Username already exists",
    "field": "username",
    "value": "testuser",
    "debug": {  // Only in development mode
      "message": "Detailed error message",
      "stack": "Error stack trace"
    }
  }
}
```

---

## Authentication Errors (1000-1099)

| Code | Error | Description |
|------|-------|-------------|
| `ERR_AUTH_1001` | Validation Failed | Request validation failed |
| `ERR_AUTH_1002` | Username Exists | Username already registered |
| `ERR_AUTH_1003` | Email Exists | Email already registered |
| `ERR_AUTH_1004` | Invalid Credentials | Wrong username or password |
| `ERR_AUTH_1005` | User Not Found | User account not found |
| `ERR_AUTH_1006` | Token Invalid | JWT token is invalid or expired |
| `ERR_AUTH_1007` | Token Missing | Authentication token required |
| `ERR_AUTH_1008` | Registration Failed | User registration failed |
| `ERR_AUTH_1009` | Password Hash Failed | Password hashing error |

---

## Database Errors (2000-2099)

| Code | Error | Description |
|------|-------|-------------|
| `ERR_DB_2001` | Connection Failed | Cannot connect to database |
| `ERR_DB_2002` | Query Failed | Database query execution failed |
| `ERR_DB_2003` | Transaction Failed | Database transaction error |
| `ERR_DB_2004` | Constraint Violation | Database constraint violated |

---

## Resource Errors (3000-3099)

| Code | Error | Description |
|------|-------|-------------|
| `ERR_RES_3001` | Not Found | Requested resource not found |
| `ERR_RES_3002` | Already Exists | Resource already exists |
| `ERR_RES_3003` | Unauthorized | No access to this resource |

---

## Payment Errors (4000-4099)

| Code | Error | Description |
|------|-------|-------------|
| `ERR_PAY_4001` | Payment Not Found | Payment record not found |
| `ERR_PAY_4002` | Invalid Amount | Payment amount is invalid |
| `ERR_PAY_4003` | Already Paid | Payment already completed |

---

## Income Errors (5000-5099)

| Code | Error | Description |
|------|-------|-------------|
| `ERR_INC_5001` | Income Not Found | Income source not found |
| `ERR_INC_5002` | Invalid Amount | Income amount is invalid |

---

## Account Errors (6000-6099)

| Code | Error | Description |
|------|-------|-------------|
| `ERR_ACC_6001` | Account Not Found | Account not found |
| `ERR_ACC_6002` | Insufficient Balance | Not enough account balance |

---

## Validation Errors (7000-7099)

| Code | Error | Description |
|------|-------|-------------|
| `ERR_VAL_7001` | Validation Failed | Input validation error |
| `ERR_VAL_7002` | Missing Field | Required field is missing |
| `ERR_VAL_7003` | Invalid Format | Data format is incorrect |

---

## Server Errors (9000-9099)

| Code | Error | Description |
|------|-------|-------------|
| `ERR_SRV_9001` | Server Error | Internal server error |
| `ERR_SRV_9002` | Service Unavailable | Service temporarily down |

---

## Common Registration Errors

### ERR_AUTH_1002: Username Exists
**Cause:** The username is already taken.  
**Solution:** Choose a different username.

### ERR_AUTH_1003: Email Exists
**Cause:** The email address is already registered.  
**Solution:** Use a different email or try logging in.

### ERR_AUTH_1008: Registration Failed
**Cause:** Server error during registration process.  
**Common Reasons:**
- Database connection issue
- Missing required fields
- Invalid data format
- Server configuration error

**Debug Steps:**
1. Check backend logs for detailed error
2. Verify database is running
3. Confirm all required fields are provided
4. Check environment variables are set

### ERR_AUTH_1009: Password Hash Failed
**Cause:** Error encrypting password.  
**Solution:** Check bcrypt installation and Node.js version.

---

## Debugging Guide

### Frontend (Browser Console)
Enable detailed error logging:
```javascript
console.error('Registration error:', err);
console.error('Error data:', err.response?.data);
```

### Backend (Server Logs)
Look for entries starting with:
- `[AUTH]` - Authentication operations
- `❌` - Error indicators
- Error codes - `ERR_*`

### Database Issues
Check PostgreSQL logs:
```sql
-- Check recent errors
SELECT * FROM pg_stat_activity;

-- Verify table exists
\dt users

-- Check user permissions
\du financeapp
```

---

## Error Reporting

When reporting errors, include:
1. **Error Code** (e.g., ERR_AUTH_1008)
2. **Error Message**
3. **Timestamp**
4. **Request Details** (endpoint, method, data)
5. **Browser Console Logs**
6. **Server Logs** (if available)

---

## Example Error Handling

### Frontend
```javascript
try {
  await register(formData);
} catch (err) {
  const errorCode = err.response?.data?.error?.code;
  const errorMessage = err.response?.data?.error?.message;
  
  console.error(`Error ${errorCode}: ${errorMessage}`);
  
  // Display user-friendly message
  setError(`${errorMessage} (${errorCode})`);
}
```

### Backend
```javascript
const { ErrorCodes, createErrorResponse } = require('../utils/errorCodes');

// Return error with code
return res.status(409).json(
  createErrorResponse(ErrorCodes.AUTH_USERNAME_EXISTS, {
    field: 'username',
    value: username
  })
);
```

---

**Last Updated:** October 20, 2025  
**Version:** 1.0.0-dev

