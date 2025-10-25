import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const ForgotPassword = () => {
  const { success, error: showError } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // For now, just show a success message
      // In production, this would send a password reset email
      setTimeout(() => {
        setSubmitted(true);
        success('Password reset instructions have been sent to your email (if account exists)');
        setLoading(false);
      }, 1000);
    } catch (err) {
      showError('Failed to process request. Please try again.');
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-4xl font-extrabold text-gray-900">
              💰 Mai Finances
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Check your email
            </p>
          </div>
          
          <div className="rounded-md bg-green-50 p-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-2xl">✓</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-800">
                  Reset instructions sent
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>
                    If an account exists for <strong>{email}</strong>, you will receive password reset instructions shortly.
                  </p>
                  <p className="mt-2">
                    Please check your email inbox and spam folder.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-md bg-yellow-50 p-4 border border-yellow-200">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-xl">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Self-Hosted Instance
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    This is a self-hosted instance. Email functionality requires SMTP configuration.
                  </p>
                  <p className="mt-2">
                    <strong>For immediate access:</strong> Contact your system administrator or use the password reset script:
                  </p>
                  <code className="block mt-2 bg-yellow-100 p-2 rounded text-xs">
                    cd backend<br />
                    node reset-user-password.js [username]
                  </code>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center space-y-2">
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500 block"
            >
              ← Back to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
              <span className="text-xl">ℹ️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Password Reset Options
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p><strong>Option 1:</strong> Enter your email below (requires SMTP setup)</p>
                <p className="mt-1"><strong>Option 2:</strong> Run the password reset script:</p>
                <code className="block mt-2 bg-blue-100 p-2 rounded text-xs">
                  cd backend<br />
                  node reset-user-password.js [username] [new-password]
                </code>
              </div>
            </div>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address or Username
            </label>
            <input
              id="email"
              name="email"
              type="text"
              required
              className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
              placeholder="Enter your email or username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <p className="mt-2 text-xs text-gray-500">
              We'll send password reset instructions to the email associated with this account.
            </p>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Instructions'}
            </button>
          </div>

          <div className="text-center space-y-2">
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500 block"
            >
              ← Back to login
            </Link>
            <Link
              to="/register"
              className="text-sm text-gray-600 hover:text-gray-900 block"
            >
              Don't have an account? Register
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;

