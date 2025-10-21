-- Migration: Add recurring and type fields to PAYMENTS table
-- Description: Enhance expenses with recurring options, types, and payment methods

-- Add expense type (Bill, Personal Payment, Subscription, etc.)
ALTER TABLE PAYMENTS 
ADD COLUMN IF NOT EXISTS expense_type VARCHAR(50) DEFAULT 'personal';

-- Add recurring/frequency fields
ALTER TABLE PAYMENTS 
ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS recurrence_frequency VARCHAR(20), -- 'daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'annually'
ADD COLUMN IF NOT EXISTS recurrence_interval INTEGER DEFAULT 1, -- Every X frequency units
ADD COLUMN IF NOT EXISTS recurrence_end_date DATE,
ADD COLUMN IF NOT EXISTS last_generated_date DATE;

-- Add payment method details
ALTER TABLE PAYMENTS
ADD COLUMN IF NOT EXISTS from_account_id UUID REFERENCES ACCOUNTS(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS from_credit_card_id UUID REFERENCES CREDIT_CARDS(id) ON DELETE SET NULL;

-- Add comments
COMMENT ON COLUMN PAYMENTS.expense_type IS 'Type of expense: bill, personal, subscription, etc.';
COMMENT ON COLUMN PAYMENTS.is_recurring IS 'Whether this expense repeats automatically';
COMMENT ON COLUMN PAYMENTS.recurrence_frequency IS 'How often the expense recurs';
COMMENT ON COLUMN PAYMENTS.recurrence_interval IS 'Interval for recurrence (e.g., every 2 weeks)';
COMMENT ON COLUMN PAYMENTS.from_account_id IS 'Bank account used for payment';
COMMENT ON COLUMN PAYMENTS.from_credit_card_id IS 'Credit card used for payment';

-- Create index for recurring payments query
CREATE INDEX IF NOT EXISTS idx_payments_recurring ON PAYMENTS(is_recurring, last_generated_date) 
WHERE is_recurring = TRUE;

-- Add expense types reference
-- Common types: 'bill', 'personal', 'subscription', 'loan', 'rent', 'insurance', 'utilities', 'other'

