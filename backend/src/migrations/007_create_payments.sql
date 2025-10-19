-- Migration: Create PAYMENTS table
-- Created: 2025-10-19T23:51:00Z
-- Description: Main bills and payments tracking

CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
    description VARCHAR(255) NOT NULL,
    payment_type VARCHAR(20) NOT NULL CHECK (payment_type IN ('owed_by_me', 'owed_to_me')),
    original_amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    original_due_date DATE NOT NULL,
    current_due_date DATE NOT NULL,
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern VARCHAR(20) CHECK (recurrence_pattern IN ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly', 'custom')),
    recurrence_interval INTEGER,
    recurrence_end_date DATE,
    status VARCHAR(20) DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'partially_paid', 'paid', 'overpaid', 'scheduled', 'processing', 'failed', 'missed', 'disputed', 'canceled')),
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    missed_date TIMESTAMP WITH TIME ZONE,
    late_payment_count INTEGER DEFAULT 0,
    consequence_notes TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    paid_date TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_contact ON payments(contact_id);
CREATE INDEX idx_payments_due_date ON payments(current_due_date);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_type ON payments(payment_type);
CREATE INDEX idx_payments_recurring ON payments(is_recurring) WHERE is_recurring = true;

COMMENT ON TABLE payments IS 'Bills and payments owed by or to the user';

