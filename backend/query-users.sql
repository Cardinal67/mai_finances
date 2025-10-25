-- Query all users in the database
-- This will show usernames and emails (passwords are hashed and cannot be retrieved)

SELECT 
    id,
    username,
    email,
    created_at,
    updated_at
FROM USERS
ORDER BY created_at DESC;

-- To see how many users exist:
SELECT COUNT(*) as total_users FROM USERS;

