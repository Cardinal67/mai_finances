const db = require('../config/database');

/**
 * Get all credit cards for a user
 */
async function getAllCreditCards(req, res) {
    const userId = req.user.id;
    
    try {
        const result = await db.query(
            `SELECT cc.*,
                    ROUND((cc.current_balance / NULLIF(cc.credit_limit, 0)) * 100, 2) as utilization_percent,
                    (SELECT COUNT(*) FROM CREDIT_CARD_TRANSACTIONS cct 
                     WHERE cct.credit_card_id = cc.id AND cct.is_pending = true) as pending_count,
                    (SELECT SUM(cct.amount) FROM CREDIT_CARD_TRANSACTIONS cct 
                     WHERE cct.credit_card_id = cc.id 
                     AND cct.transaction_date >= DATE_TRUNC('month', CURRENT_DATE)) as monthly_spending
             FROM CREDIT_CARDS cc
             WHERE cc.user_id = $1
             ORDER BY cc.is_active DESC, cc.card_nickname ASC`,
            [userId]
        );
        
        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Get credit cards error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving credit cards'
        });
    }
}

/**
 * Get credit card by ID
 */
async function getCreditCardById(req, res) {
    const { id } = req.params;
    const userId = req.user.id;
    
    try {
        const result = await db.query(
            `SELECT cc.*,
                    ROUND((cc.current_balance / NULLIF(cc.credit_limit, 0)) * 100, 2) as utilization_percent,
                    (SELECT json_agg(cct ORDER BY cct.transaction_date DESC)
                     FROM CREDIT_CARD_TRANSACTIONS cct
                     WHERE cct.credit_card_id = cc.id) as transactions,
                    (SELECT json_agg(ccp ORDER BY ccp.payment_date DESC)
                     FROM CREDIT_CARD_PAYMENTS ccp
                     WHERE ccp.credit_card_id = cc.id) as payments
             FROM CREDIT_CARDS cc
             WHERE cc.id = $1 AND cc.user_id = $2`,
            [id, userId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Credit card not found'
            });
        }
        
        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Get credit card error:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving credit card'
        });
    }
}

/**
 * Create credit card
 */
async function createCreditCard(req, res) {
    const userId = req.user.id;
    const {
        card_nickname,
        financial_institution,
        card_issuer,
        last_four_digits,
        credit_limit,
        current_balance = 0,
        pending_transactions = 0,
        payment_due_date,
        minimum_payment,
        apr,
        expiration_month,
        expiration_year,
        card_status = 'active',
        rewards_program,
        card_color,
        notes
    } = req.body;
    
    try {
        const result = await db.query(
            `INSERT INTO CREDIT_CARDS (
                user_id, card_nickname, financial_institution, card_issuer,
                last_four_digits, credit_limit, current_balance, pending_transactions,
                payment_due_date, minimum_payment, apr, expiration_month, expiration_year,
                card_status, rewards_program, card_color, notes, is_active
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, true)
            RETURNING *`,
            [
                userId, card_nickname, financial_institution, card_issuer,
                last_four_digits, credit_limit, current_balance, pending_transactions,
                payment_due_date, minimum_payment, apr, expiration_month, expiration_year,
                card_status, rewards_program, card_color, notes
            ]
        );
        
        res.status(201).json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Create credit card error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating credit card'
        });
    }
}

/**
 * Update credit card
 */
async function updateCreditCard(req, res) {
    const { id } = req.params;
    const userId = req.user.id;
    const updateData = req.body;
    
    try {
        // Build dynamic update query
        const fields = [];
        const values = [];
        let valueIndex = 1;
        
        Object.keys(updateData).forEach(key => {
            if (key !== 'id' && key !== 'user_id' && key !== 'created_at') {
                fields.push(`${key} = $${valueIndex}`);
                values.push(updateData[key]);
                valueIndex++;
            }
        });
        
        if (fields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }
        
        values.push(id, userId);
        
        const result = await db.query(
            `UPDATE CREDIT_CARDS SET ${fields.join(', ')}
             WHERE id = $${valueIndex} AND user_id = $${valueIndex + 1}
             RETURNING *`,
            values
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Credit card not found'
            });
        }
        
        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Update credit card error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating credit card'
        });
    }
}

/**
 * Delete credit card
 */
async function deleteCreditCard(req, res) {
    const { id } = req.params;
    const userId = req.user.id;
    
    try {
        const result = await db.query(
            'DELETE FROM CREDIT_CARDS WHERE id = $1 AND user_id = $2 RETURNING id',
            [id, userId]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Credit card not found'
            });
        }
        
        res.json({
            success: true,
            message: 'Credit card deleted successfully'
        });
    } catch (error) {
        console.error('Delete credit card error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting credit card'
        });
    }
}

/**
 * Get credit utilization summary
 */
async function getCreditUtilization(req, res) {
    const userId = req.user.id;
    
    try {
        const result = await db.query(
            `SELECT 
                COUNT(*) as total_cards,
                SUM(credit_limit) as total_limit,
                SUM(current_balance) as total_balance,
                SUM(available_credit) as total_available,
                ROUND((SUM(current_balance) / NULLIF(SUM(credit_limit), 0)) * 100, 2) as overall_utilization
             FROM CREDIT_CARDS
             WHERE user_id = $1 AND is_active = true AND card_status = 'active'`,
            [userId]
        );
        
        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Get credit utilization error:', error);
        res.status(500).json({
            success: false,
            message: 'Error calculating credit utilization'
        });
    }
}

module.exports = {
    getAllCreditCards,
    getCreditCardById,
    createCreditCard,
    updateCreditCard,
    deleteCreditCard,
    getCreditUtilization
};

