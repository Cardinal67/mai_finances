-- Migration: Create INCOME_STREAMS table
-- Created: 2025-10-19T23:55:00Z
-- Description: Track multiple income sources (NEW FEATURE)

CREATE TABLE IF NOT EXISTS income_streams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    source_name VARCHAR(200) NOT NULL,
    source_type VARCHAR(50) CHECK (source_type IN ('salary', 'wages', 'freelance', 'business', 'rental', 'investment', 'gift', 'other')),
    amount DECIMAL(12, 2) NOT NULL,
    is_variable BOOLEAN DEFAULT false,
    to_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern VARCHAR(20) CHECK (recurrence_pattern IN ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly', 'custom')),
    recurrence_interval INTEGER,
    next_expected_date DATE,
    recurrence_end_date DATE,
    tax_withholding DECIMAL(12, 2),
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_income_streams_user ON income_streams(user_id);
CREATE INDEX idx_income_streams_account ON income_streams(to_account_id);
CREATE INDEX idx_income_streams_next_date ON income_streams(next_expected_date);
CREATE INDEX idx_income_streams_recurring ON income_streams(is_recurring) WHERE is_recurring = true;
CREATE INDEX idx_income_streams_active ON income_streams(is_active) WHERE is_active = true;

COMMENT ON TABLE income_streams IS 'Multiple income sources tracking (paychecks, freelance, rental income)';

