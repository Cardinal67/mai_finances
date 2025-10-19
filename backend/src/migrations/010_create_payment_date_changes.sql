-- Migration: Create PAYMENT_DATE_CHANGES table
-- Created: 2025-10-19T23:54:00Z
-- Description: Track payment due date modifications

CREATE TABLE IF NOT EXISTS payment_date_changes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    old_due_date DATE NOT NULL,
    new_due_date DATE NOT NULL,
    changed_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reason TEXT,
    changed_by VARCHAR(50) DEFAULT 'user',
    fee_for_change DECIMAL(12, 2)
);

CREATE INDEX idx_payment_date_changes_payment ON payment_date_changes(payment_id);
CREATE INDEX idx_payment_date_changes_date ON payment_date_changes(changed_date);

COMMENT ON TABLE payment_date_changes IS 'History of due date changes for payments';

