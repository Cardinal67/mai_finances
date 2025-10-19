-- Migration: Create ACCOUNTS table
-- Created: 2025-10-19T23:47:00Z
-- Description: Bank accounts, credit cards, and cash accounts

CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    account_name VARCHAR(100) NOT NULL,
    account_type VARCHAR(20) NOT NULL CHECK (account_type IN ('checking', 'savings', 'credit_card', 'cash', 'investment', 'other')),
    institution_name VARCHAR(200),
    institution_phone VARCHAR(50),
    institution_website VARCHAR(255),
    routing_number TEXT, -- encrypted
    account_number TEXT, -- encrypted
    account_number_last4 VARCHAR(4),
    current_balance DECIMAL(12, 2) DEFAULT 0.00,
    available_balance DECIMAL(12, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT true,
    default_for_bills BOOLEAN DEFAULT false,
    transfer_time_days INTEGER DEFAULT 2,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_accounts_user ON accounts(user_id);
CREATE INDEX idx_accounts_type ON accounts(account_type);
CREATE INDEX idx_accounts_active ON accounts(is_active) WHERE is_active = true;

COMMENT ON TABLE accounts IS 'User bank accounts and cash accounts';
COMMENT ON COLUMN accounts.routing_number IS 'Encrypted bank routing number';
COMMENT ON COLUMN accounts.account_number IS 'Encrypted full account number';

