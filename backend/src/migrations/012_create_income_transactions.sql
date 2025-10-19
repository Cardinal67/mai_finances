-- Migration: Create INCOME_TRANSACTIONS table
-- Created: 2025-10-19T23:56:00Z
-- Description: Track received income (NEW FEATURE)

CREATE TABLE IF NOT EXISTS income_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    income_stream_id UUID NOT NULL REFERENCES income_streams(id) ON DELETE CASCADE,
    received_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    amount DECIMAL(12, 2) NOT NULL,
    to_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    confirmation_number VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_income_transactions_stream ON income_transactions(income_stream_id);
CREATE INDEX idx_income_transactions_date ON income_transactions(received_date);
CREATE INDEX idx_income_transactions_account ON income_transactions(to_account_id);

COMMENT ON TABLE income_transactions IS 'Individual income receipts for tracking actual received income';

