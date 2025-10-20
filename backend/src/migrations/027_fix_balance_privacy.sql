-- Migration: Fix Balance Privacy Column
-- Version: 1.0.1
-- Date: 2025-10-20
-- Description: Rename hide_balance to balance_masked and set default to TRUE

-- Drop old column if exists
ALTER TABLE USER_PREFERENCES DROP COLUMN IF EXISTS hide_balance;

-- Add balance_masked column with default TRUE (hidden by default)
ALTER TABLE USER_PREFERENCES
ADD COLUMN IF NOT EXISTS balance_masked BOOLEAN DEFAULT TRUE;

-- Add comment
COMMENT ON COLUMN USER_PREFERENCES.balance_masked IS 'Whether to mask/hide account balances (default: hidden for privacy)';

-- Update existing NULL values to TRUE (hidden by default)
UPDATE USER_PREFERENCES SET balance_masked = TRUE WHERE balance_masked IS NULL;

