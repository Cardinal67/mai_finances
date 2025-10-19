-- Migration: Create PAYMENT_TRANSACTIONS table
-- Created: 2025-10-19T23:52:00Z
-- Description: Individual payment events for partial payment tracking

CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    amount DECIMAL(12, 2) NOT NULL,
    payment_method VARCHAR(50) CHECK (payment_method IN ('cash', 'check', 'bank_transfer', 'wire', 'credit_card', 'debit_card', 'venmo', 'paypal', 'zelle', 'cashapp', 'crypto', 'money_order', 'auto_pay', 'other')),
    payment_method_detail VARCHAR(255),
    from_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    to_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    transaction_reference VARCHAR(255),
    expected_clear_date DATE,
    actual_clear_date DATE,
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('scheduled', 'processing', 'completed', 'failed', 'canceled')),
    notes TEXT,
    receipt_attachment_path VARCHAR(500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payment_transactions_payment ON payment_transactions(payment_id);
CREATE INDEX idx_payment_transactions_date ON payment_transactions(transaction_date);
CREATE INDEX idx_payment_transactions_account FROM payment_transactions(from_account_id);

COMMENT ON TABLE payment_transactions IS 'Individual payment transactions for tracking partial payments';

