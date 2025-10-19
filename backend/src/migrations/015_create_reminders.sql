-- Migration: Create REMINDERS table
-- Created: 2025-10-19T23:59:00Z
-- Description: Payment and income reminders

CREATE TABLE IF NOT EXISTS reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
    reminder_type VARCHAR(50) CHECK (reminder_type IN ('due_date', 'transfer_needed', 'overdue', 'payment_plan', 'income_expected', 'custom')),
    reminder_date DATE NOT NULL,
    days_before INTEGER,
    message TEXT,
    delivery_method VARCHAR(20) DEFAULT 'dashboard' CHECK (delivery_method IN ('email', 'dashboard', 'both')),
    is_sent BOOLEAN DEFAULT false,
    sent_at TIMESTAMP WITH TIME ZONE,
    is_recurring BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reminders_user ON reminders(user_id);
CREATE INDEX idx_reminders_payment ON reminders(payment_id);
CREATE INDEX idx_reminders_date ON reminders(reminder_date);
CREATE INDEX idx_reminders_unsent ON reminders(is_sent) WHERE is_sent = false;

COMMENT ON TABLE reminders IS 'Reminders for bills, payments, and income';

