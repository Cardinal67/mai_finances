-- Migration: Add Security Questions for Password Reset
-- This adds a table to store user security questions and hashed answers

CREATE TABLE IF NOT EXISTS SECURITY_QUESTIONS (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES USERS(id) ON DELETE CASCADE,
    question_number INTEGER NOT NULL CHECK (question_number IN (1, 2, 3)),
    question TEXT NOT NULL,
    answer_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, question_number)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_security_questions_user ON SECURITY_QUESTIONS(user_id);

-- Common security questions (for reference, not stored in DB)
-- 1. What was the name of your first pet?
-- 2. What city were you born in?
-- 3. What is your mother's maiden name?
-- 4. What was the name of your first school?
-- 5. What is your favorite book?
-- 6. What was your childhood nickname?
-- 7. In what city did you meet your spouse/partner?
-- 8. What is the name of your favorite childhood friend?
-- 9. What street did you live on in third grade?
-- 10. What is your oldest sibling's middle name?

COMMENT ON TABLE SECURITY_QUESTIONS IS 'Stores user security questions and hashed answers for password reset';
COMMENT ON COLUMN SECURITY_QUESTIONS.question_number IS 'Question slot (1, 2, or 3)';
COMMENT ON COLUMN SECURITY_QUESTIONS.answer_hash IS 'Bcrypt hash of the answer (case-insensitive)';

