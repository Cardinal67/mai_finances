-- Migration: Create INSTALLMENTS table (Phase 2)
-- Created: 2025-10-20T00:04:00Z
-- Description: Individual installments within payment plans

CREATE TABLE IF NOT EXISTS installments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_plan_id UUID NOT NULL REFERENCES payment_plans(id) ON DELETE CASCADE,
    installment_number INTEGER NOT NULL,
    amount_due DECIMAL(12, 2) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'missed', 'waived')),
    paid_date DATE,
    paid_amount DECIMAL(12, 2),
    notes TEXT
);

CREATE INDEX idx_installments_plan ON installments(payment_plan_id);
CREATE INDEX idx_installments_due_date ON installments(due_date);
CREATE INDEX idx_installments_status ON installments(status);

COMMENT ON TABLE installments IS 'Individual installments within payment plans (Phase 2)';

