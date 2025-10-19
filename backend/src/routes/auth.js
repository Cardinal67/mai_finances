// Auth Routes
// Created: 2025-10-20T00:16:00Z

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { generateToken } = require('../config/jwt');
const { authenticate } = require('../middleware/auth');
const { seedCategories } = require('../seeds/default_categories');

// Register
router.post('/register',
    [
        body('username').trim().isLength({ min: 3, max: 50 }),
        body('email').isEmail().normalizeEmail(),
        body('password').isLength({ min: 8 })
    ],
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            
            const { username, email, password } = req.body;
            
            // Hash password
            const passwordHash = await bcrypt.hash(password, 12);
            
            // Create user
            const result = await pool.query(
                `INSERT INTO users (username, email, password_hash) 
                 VALUES ($1, $2, $3) RETURNING id, username, email, created_at`,
                [username, email, passwordHash]
            );
            
            const user = result.rows[0];
            
            // Create default preferences
            await pool.query(
                `INSERT INTO user_preferences (user_id) VALUES ($1)`,
                [user.id]
            );
            
            // Seed default categories
            await seedCategories(user.id);
            
            // Generate token
            const token = generateToken(user.id);
            
            res.status(201).json({
                message: 'User created successfully',
                token,
                user: { id: user.id, username: user.username, email: user.email }
            });
        } catch (error) {
            next(error);
        }
    }
);

// Login
router.post('/login',
    [
        body('email').isEmail().normalizeEmail(),
        body('password').notEmpty()
    ],
    async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            
            const { email, password } = req.body;
            
            // Find user
            const result = await pool.query(
                'SELECT id, username, email, password_hash FROM users WHERE email = $1 AND is_active = true',
                [email]
            );
            
            if (result.rows.length === 0) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            
            const user = result.rows[0];
            
            // Verify password
            const validPassword = await bcrypt.compare(password, user.password_hash);
            
            if (!validPassword) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            
            // Update last login
            await pool.query(
                'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
                [user.id]
            );
            
            // Generate token
            const token = generateToken(user.id);
            
            res.json({
                message: 'Login successful',
                token,
                user: { id: user.id, username: user.username, email: user.email }
            });
        } catch (error) {
            next(error);
        }
    }
);

// Get current user
router.get('/me', authenticate, async (req, res) => {
    res.json({ user: req.user });
});

// Logout (client-side handles token removal)
router.post('/logout', authenticate, async (req, res) => {
    res.json({ message: 'Logged out successfully' });
});

module.exports = router;

