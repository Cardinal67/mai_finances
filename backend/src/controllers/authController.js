const bcrypt = require('bcrypt');
const db = require('../config/database');
const { generateToken } = require('../middleware/auth');

const SALT_ROUNDS = 10;

/**
 * Register a new user
 */
async function register(req, res) {
    const { username, email, password } = req.body;

    try {
        // Check if username already exists
        const userCheck = await db.query(
            'SELECT id FROM USERS WHERE username = $1 OR email = $2',
            [username, email]
        );

        if (userCheck.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Username or email already exists'
            });
        }

        // Hash password
        const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

        // Create user
        const result = await db.query(
            `INSERT INTO USERS (username, email, password_hash, created_at, settings)
             VALUES ($1, $2, $3, CURRENT_TIMESTAMP, '{}')
             RETURNING id, username, email, created_at`,
            [username, email, password_hash]
        );

        const newUser = result.rows[0];

        // Create default user preferences
        await db.query(
            `INSERT INTO USER_PREFERENCES (user_id, timezone, date_range_preference, 
             safety_buffer_type, safety_buffer_amount, default_currency, 
             dashboard_widgets, table_columns, display_density, theme, notification_preferences)
             VALUES ($1, 'UTC', 30, 'fixed', 0.00, 'USD', '{}', '{}', 'comfortable', 'light', '{}')`,
            [newUser.id]
        );

        // Generate JWT token
        const token = generateToken(newUser);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: newUser.id,
                    username: newUser.username,
                    email: newUser.email,
                    created_at: newUser.created_at
                },
                token
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
}

/**
 * Login user
 */
async function login(req, res) {
    const { username, password } = req.body;

    try {
        // Find user by username or email
        const result = await db.query(
            'SELECT id, username, email, password_hash FROM USERS WHERE username = $1 OR email = $1',
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const user = result.rows[0];

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Update last login
        await db.query(
            'UPDATE USERS SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
            [user.id]
        );

        // Generate JWT token
        const token = generateToken(user);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                },
                token
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
}

/**
 * Get current user profile
 */
async function getProfile(req, res) {
    try {
        const result = await db.query(
            `SELECT u.id, u.username, u.email, u.created_at, u.last_login, u.settings,
                    up.timezone, up.date_range_preference, up.default_currency, 
                    up.display_density, up.theme
             FROM USERS u
             LEFT JOIN USER_PREFERENCES up ON u.id = up.user_id
             WHERE u.id = $1`,
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error retrieving profile'
        });
    }
}

/**
 * Update user profile
 */
async function updateProfile(req, res) {
    const { email, current_password, new_password } = req.body;

    try {
        // If changing password, verify current password first
        if (new_password) {
            if (!current_password) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password is required to set a new password'
                });
            }

            const result = await db.query(
                'SELECT password_hash FROM USERS WHERE id = $1',
                [req.user.id]
            );

            const isValidPassword = await bcrypt.compare(current_password, result.rows[0].password_hash);

            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Current password is incorrect'
                });
            }

            const new_password_hash = await bcrypt.hash(new_password, SALT_ROUNDS);

            await db.query(
                'UPDATE USERS SET password_hash = $1 WHERE id = $2',
                [new_password_hash, req.user.id]
            );
        }

        // Update email if provided
        if (email) {
            await db.query(
                'UPDATE USERS SET email = $1 WHERE id = $2',
                [email, req.user.id]
            );
        }

        res.json({
            success: true,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating profile'
        });
    }
}

module.exports = {
    register,
    login,
    getProfile,
    updateProfile
};

