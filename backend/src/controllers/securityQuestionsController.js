const bcrypt = require('bcrypt');
const db = require('../config/database');

const SALT_ROUNDS = 10;

// Common security questions (users choose from these)
const COMMON_QUESTIONS = [
  'What was the name of your first pet?',
  'What city were you born in?',
  'What is your mother\'s maiden name?',
  'What was the name of your first school?',
  'What is your favorite book?',
  'What was your childhood nickname?',
  'In what city did you meet your spouse/partner?',
  'What is the name of your favorite childhood friend?',
  'What street did you live on in third grade?',
  'What is your oldest sibling\'s middle name?',
  'What was your first car\'s make and model?',
  'What is the name of the town where you were married?'
];

/**
 * Get list of common security questions
 */
async function getQuestions(req, res) {
  try {
    res.json({
      success: true,
      data: {
        questions: COMMON_QUESTIONS
      }
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving security questions'
    });
  }
}

/**
 * Set security questions for a user (during registration or later)
 */
async function setSecurityQuestions(req, res) {
  const userId = req.user.id;
  const { questions } = req.body; // Array of { questionNumber, question, answer }

  try {
    // Validate input
    if (!questions || !Array.isArray(questions) || questions.length !== 3) {
      return res.status(400).json({
        success: false,
        message: 'Exactly 3 security questions are required'
      });
    }

    // Validate each question
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionNumber || !q.question || !q.answer) {
        return res.status(400).json({
          success: false,
          message: `Question ${i + 1} is missing required fields`
        });
      }
      if (q.questionNumber < 1 || q.questionNumber > 3) {
        return res.status(400).json({
          success: false,
          message: `Invalid question number: ${q.questionNumber}`
        });
      }
      if (q.answer.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: `Answer for question ${q.questionNumber} is too short`
        });
      }
    }

    // Check for duplicate question numbers
    const questionNumbers = questions.map(q => q.questionNumber);
    if (new Set(questionNumbers).size !== 3) {
      return res.status(400).json({
        success: false,
        message: 'Each question must have a unique question number (1, 2, 3)'
      });
    }

    // Delete existing questions for this user
    await db.query('DELETE FROM SECURITY_QUESTIONS WHERE user_id = $1', [userId]);

    // Insert new questions with hashed answers (case-insensitive)
    for (const q of questions) {
      const answerHash = await bcrypt.hash(q.answer.toLowerCase().trim(), SALT_ROUNDS);
      await db.query(
        `INSERT INTO SECURITY_QUESTIONS (user_id, question_number, question, answer_hash)
         VALUES ($1, $2, $3, $4)`,
        [userId, q.questionNumber, q.question, answerHash]
      );
    }

    console.log(`✅ Security questions set for user: ${userId}`);

    res.json({
      success: true,
      message: 'Security questions set successfully'
    });
  } catch (error) {
    console.error('Set security questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error setting security questions'
    });
  }
}

/**
 * Get a random security question for a user (for password reset)
 * Public endpoint - requires username/email
 */
async function getRandomQuestion(req, res) {
  const { username } = req.query;

  try {
    if (!username) {
      return res.status(400).json({
        success: false,
        message: 'Username or email is required'
      });
    }

    // Find user (case-insensitive)
    const userResult = await db.query(
      'SELECT id, username FROM USERS WHERE LOWER(username) = LOWER($1) OR LOWER(email) = LOWER($1)',
      [username]
    );

    if (userResult.rows.length === 0) {
      // Don't reveal if user exists - security best practice
      return res.json({
        success: true,
        data: {
          hasQuestions: false
        }
      });
    }

    const user = userResult.rows[0];

    // Get all security questions for this user
    const questionsResult = await db.query(
      'SELECT question_number, question FROM SECURITY_QUESTIONS WHERE user_id = $1',
      [user.id]
    );

    if (questionsResult.rows.length === 0) {
      return res.json({
        success: true,
        data: {
          hasQuestions: false
        }
      });
    }

    // Pick a random question
    const randomIndex = Math.floor(Math.random() * questionsResult.rows.length);
    const selectedQuestion = questionsResult.rows[randomIndex];

    res.json({
      success: true,
      data: {
        hasQuestions: true,
        questionNumber: selectedQuestion.question_number,
        question: selectedQuestion.question,
        userId: user.id // We'll need this for verification
      }
    });
  } catch (error) {
    console.error('Get random question error:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving security question'
    });
  }
}

/**
 * Verify security answer and reset password
 * Public endpoint
 */
async function verifyAndResetPassword(req, res) {
  const { userId, questionNumber, answer, newPassword } = req.body;

  try {
    // Validate input
    if (!userId || !questionNumber || !answer || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Get the security question
    const questionResult = await db.query(
      'SELECT answer_hash FROM SECURITY_QUESTIONS WHERE user_id = $1 AND question_number = $2',
      [userId, questionNumber]
    );

    if (questionResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Security question not found'
      });
    }

    const storedHash = questionResult.rows[0].answer_hash;

    // Verify answer (case-insensitive)
    const isCorrect = await bcrypt.compare(answer.toLowerCase().trim(), storedHash);

    if (!isCorrect) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect answer to security question'
      });
    }

    // Answer is correct - reset password
    const newPasswordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await db.query(
      'UPDATE USERS SET password_hash = $1 WHERE id = $2',
      [newPasswordHash, userId]
    );

    console.log(`✅ Password reset via security question for user: ${userId}`);

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Verify and reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password'
    });
  }
}

/**
 * Check if user has security questions set
 */
async function hasSecurityQuestions(req, res) {
  const userId = req.user.id;

  try {
    const result = await db.query(
      'SELECT COUNT(*) as count FROM SECURITY_QUESTIONS WHERE user_id = $1',
      [userId]
    );

    const hasQuestions = parseInt(result.rows[0].count) === 3;

    res.json({
      success: true,
      data: {
        hasQuestions
      }
    });
  } catch (error) {
    console.error('Check security questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking security questions'
    });
  }
}

module.exports = {
  getQuestions,
  setSecurityQuestions,
  getRandomQuestion,
  verifyAndResetPassword,
  hasSecurityQuestions
};

