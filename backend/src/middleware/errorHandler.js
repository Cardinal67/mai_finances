// Error Handler Middleware
// Created: 2025-10-20T00:12:00Z
// Description: Centralized error handling

function errorHandler(err, req, res, next) {
    console.error('Error:', err);
    
    // Validation errors
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Validation failed',
            details: err.details
        });
    }
    
    // Database errors
    if (err.code === '23505') { // Unique constraint violation
        return res.status(409).json({
            error: 'Resource already exists'
        });
    }
    
    if (err.code === '23503') { // Foreign key violation
        return res.status(400).json({
            error: 'Referenced resource not found'
        });
    }
    
    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            error: 'Invalid token'
        });
    }
    
    // Default error
    res.status(err.status || 500).json({
        error: err.message || 'Internal server error'
    });
}

module.exports = errorHandler;

