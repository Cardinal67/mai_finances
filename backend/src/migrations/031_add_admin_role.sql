-- Add admin role to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Make Cardinal an admin
UPDATE users 
SET is_admin = TRUE 
WHERE LOWER(username) = 'cardinal';

-- Create index for faster admin checks
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin) WHERE is_admin = TRUE;

