import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../context/ToastContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  
  const [step, setStep] = useState(1); // 1: Enter username, 2: Answer question, 3: Success
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Step 2 data
  const [questionData, setQuestionData] = useState(null);
  const [answer, setAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.get(
        `${API_URL}/security-questions/random-question?username=${encodeURIComponent(username)}`
      );

      if (response.data.success) {
        if (!response.data.data.hasQuestions) {
          showError('No security questions found for this account. Please use the command-line reset tool.');
          setLoading(false);
          return;
        }

        setQuestionData(response.data.data);
        setStep(2);
      }
    } catch (err) {
      showError('Error retrieving security question. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      showError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      showError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/security-questions/verify-and-reset`, {
        userId: questionData.userId,
        questionNumber: questionData.questionNumber,
        answer: answer,
        newPassword: newPassword
      });

      if (response.data.success) {
        success('Password reset successfully! Redirecting to login...');
        setStep(3);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      if (err.response?.status === 401) {
        showError('Incorrect answer. Please try again.');
      } else {
        showError('Error resetting password. Please try again.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Enter username
  if (step === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-4xl font-extrabold text-gray-900">
              💰 Mai Finances
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Reset your password
            </p>
          </div>
          
          <div className="rounded-md bg-blue-50 p-4 border border-blue-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-xl">🔐</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Security Question Verification
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>You'll be asked one of your security questions to verify your identity.</p>
                </div>
              </div>
            </div>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleStep1Submit}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username or Email
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Enter your username or email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Continue'}
              </button>
            </div>

            <div className="text-center space-y-2">
              <Link
                to="/login"
                className="font-medium text-primary-600 hover:text-primary-500 block"
              >
                ← Back to login
              </Link>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Step 2: Answer security question
  if (step === 2) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-4xl font-extrabold text-gray-900">
              💰 Mai Finances
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Answer your security question
            </p>
          </div>
          
          <div className="rounded-md bg-blue-50 p-4 border border-blue-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-xl">❓</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Security Question
                </h3>
                <p className="mt-2 text-sm text-blue-700 font-semibold">
                  {questionData?.question}
                </p>
              </div>
            </div>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleStep2Submit}>
            <div>
              <label htmlFor="answer" className="block text-sm font-medium text-gray-700 mb-2">
                Your Answer
              </label>
              <input
                id="answer"
                name="answer"
                type="text"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Enter your answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
              />
              <p className="mt-1 text-xs text-gray-500">Answers are not case-sensitive</p>
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <p className="mt-1 text-xs text-gray-500">Minimum 6 characters</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </button>
            </div>

            <div className="text-center space-y-2">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setAnswer('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                ← Start over
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Step 3: Success
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-4xl font-extrabold text-gray-900">
            💰 Mai Finances
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Password reset successful!
          </p>
        </div>
        
        <div className="rounded-md bg-green-50 p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-2xl">✓</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Success!
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>Your password has been reset successfully.</p>
                <p className="mt-2">You will be redirected to the login page shortly...</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link
            to="/login"
            className="font-medium text-primary-600 hover:text-primary-500"
          >
            Go to login now →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

