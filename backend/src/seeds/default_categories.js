// Seed: Default Categories
// Created: 2025-10-20T00:07:00Z
// Description: Pre-populate default categories for new users

const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const defaultCategories = [
    { name: 'Housing', color: '#EF4444', icon: '🏠', children: ['Rent', 'Mortgage', 'HOA', 'Property Tax'] },
    { name: 'Utilities', color: '#F59E0B', icon: '⚡', children: ['Electric', 'Gas', 'Water', 'Internet', 'Phone', 'Trash'] },
    { name: 'Transportation', color: '#3B82F6', icon: '🚗', children: ['Car Payment', 'Insurance', 'Gas', 'Maintenance', 'Public Transit'] },
    { name: 'Medical', color: '#EC4899', icon: '🏥', children: ['Doctor', 'Dentist', 'Pharmacy', 'Insurance', 'Vision'] },
    { name: 'Credit Cards', color: '#8B5CF6', icon: '💳', children: [] },
    { name: 'Subscriptions', color: '#06B6D4', icon: '📱', children: ['Streaming', 'Software', 'Memberships', 'Magazines'] },
    { name: 'Food & Dining', color: '#10B981', icon: '🍕', children: ['Groceries', 'Restaurants', 'Delivery'] },
    { name: 'Personal Loans', color: '#F97316', icon: '💰', children: ['Student Loans', 'Personal', 'Family'] },
    { name: 'Business Expenses', color: '#6366F1', icon: '💼', children: [] },
    { name: 'Other', color: '#6B7280', icon: '📌', children: [] }
];

async function seedCategories(userId) {
    console.log('Seeding default categories...');
    
    for (const category of defaultCategories) {
        const result = await pool.query(
            `INSERT INTO categories (user_id, name, color_code, icon, sort_order)
             VALUES ($1, $2, $3, $4, $5) RETURNING id`,
            [userId, category.name, category.color, category.icon, defaultCategories.indexOf(category)]
        );
        
        const parentId = result.rows[0].id;
        
        // Add child categories
        for (const childName of category.children) {
            await pool.query(
                `INSERT INTO categories (user_id, name, parent_category_id, color_code, icon)
                 VALUES ($1, $2, $3, $4, $5)`,
                [userId, childName, parentId, category.color, category.icon]
            );
        }
    }
    
    console.log('Categories seeded successfully');
}

module.exports = { seedCategories };

