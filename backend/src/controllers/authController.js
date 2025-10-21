const bcrypt = require('bcrypt');
const db = require('../config/database');
const { generateToken } = require('../middleware/auth');
const { ErrorCodes, createErrorResponse } = require('../utils/errorCodes');

const SALT_ROUNDS = 10;

/**
 * Register a new user
 */
async function register(req, res) {
    const { username, email, password } = req.body;

    try {
        console.log(`[AUTH] Registration attempt for username: ${username}, email: ${email}`);

        // Validate input
        if (!username || !email || !password) {
            console.error('[AUTH] Missing required fields');
            return res.status(400).json(
                createErrorResponse(ErrorCodes.VALIDATION_MISSING_FIELD, {
                    fields: {
                        username: !username ? 'required' : 'ok',
                        email: !email ? 'required' : 'ok',
                        password: !password ? 'required' : 'ok'
                    }
                })
            );
        }

        // Check if username already exists
        const userCheck = await db.query(
            'SELECT id, username, email FROM users WHERE username = $1 OR email = $2',
            [username, email]
        );

        if (userCheck.rows.length > 0) {
            const existingUser = userCheck.rows[0];
            const isDuplicateUsername = existingUser.username === username;
            const isDuplicateEmail = existingUser.email === email;

            console.error(`[AUTH] User already exists - Username: ${isDuplicateUsername}, Email: ${isDuplicateEmail}`);
            
            return res.status(409).json(
                createErrorResponse(
                    isDuplicateUsername ? ErrorCodes.AUTH_USERNAME_EXISTS : ErrorCodes.AUTH_EMAIL_EXISTS,
                    {
                        field: isDuplicateUsername ? 'username' : 'email',
                        value: isDuplicateUsername ? username : email
                    }
                )
            );
        }

        console.log('[AUTH] User validation passed, hashing password...');

        // Hash password
        let password_hash;
        try {
            password_hash = await bcrypt.hash(password, SALT_ROUNDS);
            console.log('[AUTH] Password hashed successfully');
        } catch (hashError) {
            console.error('[AUTH] Password hashing failed:', hashError);
            return res.status(500).json(
                createErrorResponse(ErrorCodes.AUTH_PASSWORD_HASH_FAILED, {}, hashError)
            );
        }

        console.log('[AUTH] Creating user in database...');

        // Create user
        const result = await db.query(
            `INSERT INTO users (username, email, password_hash, created_at, settings)
             VALUES ($1, $2, $3, CURRENT_TIMESTAMP, '{}')
             RETURNING id, username, email, created_at`,
            [username, email, password_hash]
        );

        const newUser = result.rows[0];
        console.log(`[AUTH] User created successfully with ID: ${newUser.id}`);

        // Create default user preferences
        console.log('[AUTH] Creating default user preferences...');
        await db.query(
            `INSERT INTO user_preferences (user_id, timezone, date_range_preference, 
             safety_buffer_type, safety_buffer_amount, default_currency, 
             dashboard_widgets, table_columns, display_density, theme, notification_preferences)
             VALUES ($1, 'UTC', 30, 'fixed', 0.00, 'USD', '{}', '{}', 'comfortable', 'light', '{}')`,
            [newUser.id]
        );
        console.log('[AUTH] User preferences created successfully');

        // Generate JWT token
        console.log('[AUTH] Generating JWT token...');
        const token = generateToken(newUser);

        console.log(`[AUTH] ✅ Registration successful for user: ${username}`);

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
        console.error('[AUTH] ❌ Registration error:', error);
        console.error('[AUTH] Error details:', {
            message: error.message,
            code: error.code,
            detail: error.detail,
            stack: error.stack
        });
        
        res.status(500).json(
            createErrorResponse(ErrorCodes.AUTH_REGISTRATION_FAILED, {
                timestamp: new Date().toISOString()
            }, error)
        );
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
    const { username, email, profile_image_url, current_password, new_password } = req.body;

    try {
        const updates = [];
        const values = [];
        let paramCount = 1;

        // Check if username is being changed and if it's available
        if (username) {
            const usernameCheck = await db.query(
                'SELECT id FROM USERS WHERE username = $1 AND id != $2',
                [username, req.user.id]
            );

            if (usernameCheck.rows.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'Username already taken',
                    code: 'USERNAME_EXISTS'
                });
            }

            updates.push(`username = $${paramCount}`);
            values.push(username);
            paramCount++;
        }

        // Check if email is being changed and if it's available
        if (email) {
            const emailCheck = await db.query(
                'SELECT id FROM USERS WHERE email = $1 AND id != $2',
                [email, req.user.id]
            );

            if (emailCheck.rows.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'Email already in use',
                    code: 'EMAIL_EXISTS'
                });
            }

            updates.push(`email = $${paramCount}`);
            values.push(email);
            paramCount++;
        }

        // Update profile image URL if provided
        if (profile_image_url !== undefined) {
            updates.push(`profile_image_url = $${paramCount}`);
            values.push(profile_image_url);
            paramCount++;
        }

        // If changing password, verify current password first
        if (new_password) {
            if (!current_password) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password is required to set a new password',
                    code: 'PASSWORD_REQUIRED'
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
                    message: 'Current password is incorrect',
                    code: 'INVALID_PASSWORD'
                });
            }

            const new_password_hash = await bcrypt.hash(new_password, SALT_ROUNDS);
            updates.push(`password_hash = $${paramCount}`);
            values.push(new_password_hash);
            paramCount++;
        }

        // Perform updates if any
        if (updates.length > 0) {
            values.push(req.user.id);
            const updateQuery = `UPDATE USERS SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount} RETURNING id, username, email, profile_image_url`;
            
            const result = await db.query(updateQuery, values);

            res.json({
                success: true,
                message: 'Profile updated successfully',
                data: result.rows[0]
            });
        } else {
            res.json({
                success: true,
                message: 'No changes made'
            });
        }
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error updating profile',
            code: 'SERVER_ERROR'
        });
    }
}

module.exports = {
    register,
    login,
    getProfile,
    updateProfile
};

