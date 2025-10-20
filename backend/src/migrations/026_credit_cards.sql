-- Migration: Create Credit Card Management Tables
-- Version: 1.0.0
-- Date: 2025-10-20

-- Main Credit Cards Table
CREATE TABLE IF NOT EXISTS CREDIT_CARDS (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES USERS(id) ON DELETE CASCADE,
    card_nickname VARCHAR(100) NOT NULL,
    financial_institution VARCHAR(200),
    card_issuer VARCHAR(50) CHECK (card_issuer IN ('visa', 'mastercard', 'amex', 'discover', 'other')),
    last_four_digits CHAR(4),
    credit_limit DECIMAL(12, 2) NOT NULL,
    current_balance DECIMAL(12, 2) DEFAULT 0,
    available_credit DECIMAL(12, 2) GENERATED ALWAYS AS (credit_limit - current_balance) STORED,
    pending_transactions DECIMAL(12, 2) DEFAULT 0,
    payment_due_date INTEGER CHECK (payment_due_date BETWEEN 1 AND 31),
    minimum_payment DECIMAL(12, 2),
    apr DECIMAL(5, 2), -- Annual Percentage Rate
    expiration_month INTEGER CHECK (expiration_month BETWEEN 1 AND 12),
    expiration_year INTEGER,
    card_status VARCHAR(20) DEFAULT 'active' CHECK (card_status IN ('active', 'closed', 'frozen', 'suspended')),
    rewards_program VARCHAR(100),
    card_color VARCHAR(7), -- Hex color for UI
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Credit Card Transactions Table
CREATE TABLE IF NOT EXISTS CREDIT_CARD_TRANSACTIONS (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    credit_card_id UUID NOT NULL REFERENCES CREDIT_CARDS(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES USERS(id) ON DELETE CASCADE,
    transaction_date DATE NOT NULL,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    transaction_type VARCHAR(20) CHECK (transaction_type IN ('charge', 'payment', 'fee', 'interest', 'refund', 'reward')),
    category VARCHAR(100),
    merchant VARCHAR(200),
    is_pending BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Credit Card Payments Table (linked to PAYMENTS table)
CREATE TABLE IF NOT EXISTS CREDIT_CARD_PAYMENTS (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    credit_card_id UUID NOT NULL REFERENCES CREDIT_CARDS(id) ON DELETE CASCADE,
    payment_id UUID REFERENCES PAYMENTS(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES USERS(id) ON DELETE CASCADE,
    payment_date DATE NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    payment_method VARCHAR(50),
    confirmation_number VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Credit Score Tracking Table
CREATE TABLE IF NOT EXISTS CREDIT_SCORES (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES USERS(id) ON DELETE CASCADE,
    score INTEGER CHECK (score BETWEEN 300 AND 850),
    score_date DATE NOT NULL,
    bureau VARCHAR(50) CHECK (bureau IN ('experian', 'equifax', 'transunion', 'other')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_credit_cards_user ON CREDIT_CARDS(user_id);
CREATE INDEX idx_credit_cards_status ON CREDIT_CARDS(card_status);
CREATE INDEX idx_credit_cards_active ON CREDIT_CARDS(is_active) WHERE is_active = true;
CREATE INDEX idx_credit_cards_due_date ON CREDIT_CARDS(payment_due_date);

CREATE INDEX idx_cc_transactions_card ON CREDIT_CARD_TRANSACTIONS(credit_card_id);
CREATE INDEX idx_cc_transactions_user ON CREDIT_CARD_TRANSACTIONS(user_id);
CREATE INDEX idx_cc_transactions_date ON CREDIT_CARD_TRANSACTIONS(transaction_date);
CREATE INDEX idx_cc_transactions_pending ON CREDIT_CARD_TRANSACTIONS(is_pending) WHERE is_pending = true;

CREATE INDEX idx_cc_payments_card ON CREDIT_CARD_PAYMENTS(credit_card_id);
CREATE INDEX idx_cc_payments_user ON CREDIT_CARD_PAYMENTS(user_id);
CREATE INDEX idx_cc_payments_date ON CREDIT_CARD_PAYMENTS(payment_date);

CREATE INDEX idx_credit_scores_user ON CREDIT_SCORES(user_id);
CREATE INDEX idx_credit_scores_date ON CREDIT_SCORES(score_date DESC);

-- Comments
COMMENT ON TABLE CREDIT_CARDS IS 'Credit card tracking and management';
COMMENT ON TABLE CREDIT_CARD_TRANSACTIONS IS 'Individual transactions on credit cards';
COMMENT ON TABLE CREDIT_CARD_PAYMENTS IS 'Payments made to credit cards';
COMMENT ON TABLE CREDIT_SCORES IS 'Credit score history tracking';

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_credit_card_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER credit_cards_updated_at
    BEFORE UPDATE ON CREDIT_CARDS
    FOR EACH ROW
    EXECUTE FUNCTION update_credit_card_timestamp();

