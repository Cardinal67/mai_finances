// Auth middleware for admin routes
const jwt = require('jsonwebtoken');
const { Client } = require('pg');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

async function authenticateAdmin(req, res, next) {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Check if user is admin
        const client = new Client({ connectionString: process.env.DATABASE_URL });
        await client.connect();
        
        const result = await client.query(
            'SELECT id, username, email, is_admin FROM users WHERE id = $1',
            [decoded.userId]
        );
        
        await client.end();

        if (!result.rows[0] || !result.rows[0].is_admin) {
            return res.status(403).json({ error: 'Access denied. Admin only.' });
        }

        req.user = result.rows[0];
        next();
    } catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
}

module.exports = { authenticateAdmin };

