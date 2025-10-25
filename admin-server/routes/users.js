// User management routes
const express = require('express');
const router = express.Router();
const { authenticateAdmin } = require('../middleware/auth');
const { Client } = require('pg');
const bcrypt = require('bcrypt');

router.use(authenticateAdmin);

// Get all users
router.get('/', async (req, res) => {
    try {
        const client = new Client({ connectionString: process.env.DATABASE_URL });
        await client.connect();

        const result = await client.query(`
            SELECT 
                id, 
                username, 
                email, 
                is_admin,
                created_at,
                last_login
            FROM users 
            ORDER BY created_at DESC
        `);

        await client.end();

        res.json({ users: result.rows });
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Get single user
router.get('/:id', async (req, res) => {
    try {
        const client = new Client({ connectionString: process.env.DATABASE_URL });
        await client.connect();

        const result = await client.query(
            `SELECT 
                id, 
                username, 
                email, 
                is_admin,
                created_at,
                last_login
            FROM users 
            WHERE id = $1`,
            [req.params.id]
        );

        await client.end();

        if (!result.rows[0]) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user: result.rows[0] });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Update user
router.put('/:id', async (req, res) => {
    try {
        const { username, email, is_admin } = req.body;
        const userId = req.params.id;

        const client = new Client({ connectionString: process.env.DATABASE_URL });
        await client.connect();

        const result = await client.query(
            `UPDATE users 
            SET username = COALESCE($1, username),
                email = COALESCE($2, email),
                is_admin = COALESCE($3, is_admin)
            WHERE id = $4
            RETURNING id, username, email, is_admin, created_at`,
            [username, email, is_admin, userId]
        );

        await client.end();

        if (!result.rows[0]) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user: result.rows[0], message: 'User updated successfully' });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// Reset user password
router.post('/:id/reset-password', async (req, res) => {
    try {
        const { newPassword } = req.body;
        const userId = req.params.id;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        const passwordHash = await bcrypt.hash(newPassword, 10);

        const client = new Client({ connectionString: process.env.DATABASE_URL });
        await client.connect();

        const result = await client.query(
            'UPDATE users SET password_hash = $1 WHERE id = $2 RETURNING username',
            [passwordHash, userId]
        );

        await client.end();

        if (!result.rows[0]) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ 
            success: true, 
            message: `Password reset successfully for ${result.rows[0].username}` 
        });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});

// Delete user
router.delete('/:id', async (req, res) => {
    try {
        const userId = req.params.id;

        // Prevent deleting yourself
        if (userId === req.user.id) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }

        const client = new Client({ connectionString: process.env.DATABASE_URL });
        await client.connect();

        const result = await client.query(
            'DELETE FROM users WHERE id = $1 RETURNING username',
            [userId]
        );

        await client.end();

        if (!result.rows[0]) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ 
            success: true, 
            message: `User ${result.rows[0].username} deleted successfully` 
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// Get user statistics
router.get('/stats/overview', async (req, res) => {
    try {
        const client = new Client({ connectionString: process.env.DATABASE_URL });
        await client.connect();

        const stats = await client.query(`
            SELECT 
                COUNT(*) as total_users,
                COUNT(*) FILTER (WHERE is_admin = true) as admin_count,
                COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '30 days') as new_users_30d,
                COUNT(*) FILTER (WHERE last_login > NOW() - INTERVAL '7 days') as active_users_7d
            FROM users
        `);

        await client.end();

        res.json({ stats: stats.rows[0] });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
});

module.exports = router;

