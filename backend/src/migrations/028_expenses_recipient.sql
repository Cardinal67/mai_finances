-- Migration: Expenses Recipient Model
-- Version: 1.0.2
-- Date: 2025-10-20
-- Description: Change expenses to use expense_name and recipient instead of requiring contact

-- Make contact_id nullable (it's now optional)
ALTER TABLE PAYMENTS
ALTER COLUMN contact_id DROP NOT NULL;

-- Add expense_name column
ALTER TABLE PAYMENTS
ADD COLUMN IF NOT EXISTS expense_name VARCHAR(255);

-- Add recipient column
ALTER TABLE PAYMENTS
ADD COLUMN IF NOT EXISTS recipient VARCHAR(255);

-- Add comments
COMMENT ON COLUMN PAYMENTS.expense_name IS 'Name/description of the expense';
COMMENT ON COLUMN PAYMENTS.recipient IS 'Who the payment is to (can be from contact or freeform text)';
COMMENT ON COLUMN PAYMENTS.contact_id IS 'Optional: Link to contact if this is a recurring bill/payment';

-- Create index for recipient lookups (for autocomplete)
CREATE INDEX IF NOT EXISTS idx_payments_recipient ON PAYMENTS (user_id, recipient);

