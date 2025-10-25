-- Password Reset Script for Mai Finances
-- 
-- INSTRUCTIONS:
-- 1. Replace 'YOUR_USERNAME_HERE' with the actual username
-- 2. The password will be reset to: 'NewPassword123!'
-- 3. After reset, login with the new password and change it immediately
--
-- The hash below is bcrypt for 'NewPassword123!' with salt rounds = 10

UPDATE USERS 
SET 
    password_hash = '$2b$10$YQ7Uj4iX0gV4rP5B0XJ7O.fkWvZxGQMKf5t3r7Z9nP1wQ8xYvZz4C',
    updated_at = CURRENT_TIMESTAMP
WHERE username = 'YOUR_USERNAME_HERE';

-- Verify the update
SELECT username, email, updated_at 
FROM USERS 
WHERE username = 'YOUR_USERNAME_HERE';

-- EXAMPLE: To reset password for user 'testuser'
-- UPDATE USERS 
-- SET 
--     password_hash = '$2b$10$YQ7Uj4iX0gV4rP5B0XJ7O.fkWvZxGQMKf5t3r7Z9nP1wQ8xYvZz4C',
--     updated_at = CURRENT_TIMESTAMP
-- WHERE username = 'testuser';

