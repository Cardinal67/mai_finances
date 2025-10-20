const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_please_change';

/**
 * Middleware to verify JWT token and authenticate user
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Access token required' 
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ 
                success: false, 
                message: 'Invalid or expired token' 
            });
        }

        req.user = user; // Add user info to request object
        next();
    });
}

/**
 * Generate JWT token for a user
 * @param {object} user - User object with id, username, email
 * @param {string} expiresIn - Token expiration time (default: 7 days)
 * @returns {string} JWT token
 */
function generateToken(user, expiresIn = '7d') {
    return jwt.sign(
        { 
            id: user.id, 
            username: user.username, 
            email: user.email 
        },
        JWT_SECRET,
        { expiresIn }
    );
}

/**
 * Optional authentication - if token exists, verify it, but don't require it
 */
function optionalAuth(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        req.user = null;
        return next();
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            req.user = null;
        } else {
            req.user = user;
        }
        next();
    });
}

module.exports = {
    authenticateToken,
    generateToken,
    optionalAuth
};
