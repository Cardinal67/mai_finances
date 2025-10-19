-- Migration: Create ACCOUNT_TRANSFERS table
-- Created: 2025-10-19T23:58:00Z
-- Description: Track money transfers between user accounts

CREATE TABLE IF NOT EXISTS account_transfers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    from_account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    to_account_id UUID NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
    amount DECIMAL(12, 2) NOT NULL,
    transfer_date DATE NOT NULL,
    expected_arrival_date DATE NOT NULL,
    actual_arrival_date DATE,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_transit', 'completed', 'failed', 'canceled')),
    related_payment_id UUID REFERENCES payments(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_account_transfers_user ON account_transfers(user_id);
CREATE INDEX idx_account_transfers_from ON account_transfers(from_account_id);
CREATE INDEX idx_account_transfers_to ON account_transfers(to_account_id);
CREATE INDEX idx_account_transfers_date ON account_transfers(transfer_date);

COMMENT ON TABLE account_transfers IS 'Transfers between user accounts for bill payment planning';

