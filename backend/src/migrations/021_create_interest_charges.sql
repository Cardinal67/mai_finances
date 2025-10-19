-- Migration: Create INTEREST_CHARGES table (Phase 2)
-- Created: 2025-10-20T00:05:00Z
-- Description: Track interest and late fees

CREATE TABLE IF NOT EXISTS interest_charges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    interest_type VARCHAR(50) CHECK (interest_type IN ('late_payment_penalty', 'payment_plan_interest', 'compounding')),
    rate DECIMAL(5, 2),
    calculation_method VARCHAR(50) CHECK (calculation_method IN ('simple', 'compound', 'daily', 'monthly', 'fixed')),
    start_date DATE NOT NULL,
    end_date DATE,
    amount_accrued DECIMAL(12, 2) DEFAULT 0.00,
    last_calculated_date DATE,
    is_active BOOLEAN DEFAULT true,
    notes TEXT
);

CREATE INDEX idx_interest_charges_payment ON interest_charges(payment_id);
CREATE INDEX idx_interest_charges_active ON interest_charges(is_active) WHERE is_active = true;

COMMENT ON TABLE interest_charges IS 'Interest and late fee calculations (Phase 2)';

