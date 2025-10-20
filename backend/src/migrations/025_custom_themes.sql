-- Migration: Add Custom Theme Support
-- Version: 1.0.0
-- Date: 2025-10-20

-- Add custom_theme column to user_preferences
ALTER TABLE USER_PREFERENCES
ADD COLUMN IF NOT EXISTS custom_theme JSONB DEFAULT NULL;

-- Add comment
COMMENT ON COLUMN USER_PREFERENCES.custom_theme IS 'Custom color theme settings (JSON object with color values)';

