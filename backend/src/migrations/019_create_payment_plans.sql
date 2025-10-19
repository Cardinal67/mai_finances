-- Migration: Create PAYMENT_PLANS table (Phase 2)
-- Created: 2025-10-20T00:03:00Z
-- Description: Structured payment plans and installments

CREATE TABLE IF NOT EXISTS payment_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    total_amount DECIMAL(12, 2) NOT NULL,
    total_installments INTEGER NOT NULL,
    installment_amount DECIMAL(12, 2) NOT NULL,
    frequency VARCHAR(20) CHECK (frequency IN ('weekly', 'biweekly', 'monthly')),
    interest_rate DECIMAL(5, 2),
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    notes TEXT
);

CREATE INDEX idx_payment_plans_payment ON payment_plans(payment_id);
CREATE INDEX idx_payment_plans_active ON payment_plans(is_active) WHERE is_active = true;

COMMENT ON TABLE payment_plans IS 'Payment plans with installment tracking (Phase 2 feature)';

