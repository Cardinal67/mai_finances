import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SecurityQuestionsSetup from '../components/SecurityQuestionsSetup';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [step, setStep] = useState(1); // 1: Register form, 2: Security questions
  const [registeredToken, setRegisteredToken] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);

    try {
      const response = await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      
      // Save token and move to security questions step
      setRegisteredToken(localStorage.getItem('token'));
      setStep(2);
    } catch (err) {
      console.error('[Register] Registration error:', err);
      let errorMessage = 'Registration failed. Please try again.';
      let errorCode = 'ERR_UNKNOWN';
      
      // Check for network errors first
      if (err.networkError) {
        errorCode = err.networkError.code;
        errorMessage = `${err.networkError.message} (${errorCode})`;
        
        if (err.networkError.details) {
          errorMessage += `\n\nDetails: ${err.networkError.details}`;
        }
        
        if (err.networkError.suggestions) {
          errorMessage += '\n\nSuggestions:\n' + err.networkError.suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n');
        }
        
        console.error('[Register] Network error detected:', err.networkError);
      } 
      // Check for server error response
      else if (err.response?.data?.error) {
        const errorData = err.response.data.error;
        errorCode = errorData.code;
        errorMessage = `${errorData.message} (${errorCode})`;
        
        // Add specific field information if available
        if (errorData.field) {
          errorMessage += `\n\nField: ${errorData.field}`;
          if (errorData.value) {
            errorMessage += ` - Value: ${errorData.value}`;
          }
        }
        
        // Add debug information in development
        if (errorData.debug) {
          console.error('[Register] Debug info:', errorData.debug);
          errorMessage += '\n\nSee browser console for technical details.';
        }
      }
      // Check for legacy error format
      else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      // Generic error
      else if (err.message) {
        if (err.message.includes('Network Error')) {
          errorCode = 'ERR_NET_8001';
          errorMessage = `Cannot connect to server (${errorCode})\n\nThe backend server may not be running.\n\nPlease ensure the backend is started on port 3001.`;
        } else {
          errorMessage = `Error: ${err.message}`;
        }
      }
      
      console.error(`[Register] Final error code: ${errorCode}`);
      console.error(`[Register] Final error message: ${errorMessage}`);
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {step === 1 ? (
          // Step 1: Registration Form
          <>
            <div>
              <h2 className="mt-6 text-center text-4xl font-extrabold text-gray-900">
                💰 Mai Finances
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                Create your account
              </p>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="username" className="sr-only">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Password (min 8 characters)"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </div>

          <div className="text-center">
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Already have an account? Sign in
            </Link>
          </div>
        </form>
          </>
        ) : (
          // Step 2: Security Questions Setup
          <>
            <div>
              <h2 className="mt-6 text-center text-4xl font-extrabold text-gray-900">
                💰 Mai Finances
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                One more step - Set up security questions
              </p>
            </div>
            <div className="mt-8">
              <SecurityQuestionsSetup 
                token={registeredToken}
                onComplete={() => navigate('/dashboard')}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Register;
