-- Migration: Add Balance Privacy Settings
-- Version: 1.0.0
-- Date: 2025-10-20

-- Add hide_balance column to user_preferences
ALTER TABLE USER_PREFERENCES
ADD COLUMN IF NOT EXISTS hide_balance BOOLEAN DEFAULT FALSE;

-- Add comment
COMMENT ON COLUMN USER_PREFERENCES.hide_balance IS 'Whether to hide/mask account balances (show only Safe-to-Spend)';

