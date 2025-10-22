import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navigation = [
  { name: 'Dashboard', path: '/dashboard', icon: '📊' },
  { name: 'Expenses', path: '/expenses', icon: '💰' },
  { name: 'Income', path: '/income', icon: '💵' },
  { name: 'Accounts', path: '/accounts', icon: '🏦' },
  { name: 'Credit Cards', path: '/credit-cards', icon: '💳' },
  { name: 'Contacts', path: '/contacts', icon: '👥' },
  { name: 'Calendar', path: '/calendar', icon: '📅' },
];

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
                  <div className="flex-shrink-0 flex items-center">
                    <h1 className="text-2xl font-bold text-primary-600">💰 Mai Finances</h1>
                  </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-1">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                      location.pathname === item.path
                        ? 'bg-primary-50 text-primary-700 shadow-sm border border-primary-200'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                    }`}
                    title={item.name}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="ml-1 hidden lg:inline">{item.name}</span>
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* Goals Button */}
              <Link
                to="/spending-plans"
                className={`hidden sm:inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  location.pathname === '/spending-plans'
                    ? 'bg-primary-50 text-primary-700 shadow-sm border border-primary-200'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                }`}
                title="Goals"
              >
                <span className="text-lg">🎯</span>
                <span className="ml-1 hidden lg:inline">Goals</span>
              </Link>
              
              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:shadow-sm rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <span>👤 {user?.username}</span>
                  <span className="text-xs">{userMenuOpen ? '▲' : '▼'}</span>
                </button>
                
                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary-700 transition-colors duration-150"
                    >
                      👤 Profile
                    </Link>
                    <Link
                      to="/settings"
                      onClick={() => setUserMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary-700 transition-colors duration-150"
                    >
                      ⚙️ Settings
                    </Link>
                    <button
                      onClick={() => { setUserMenuOpen(false); handleLogout(); }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-red-600 transition-colors duration-150"
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="sm:hidden border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === item.path
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.name}
              </Link>
            ))}
            <Link
              to="/spending-plans"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location.pathname === '/spending-plans'
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="mr-2">🎯</span>
              Goals
            </Link>
            <Link
              to="/settings"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                location.pathname === '/settings'
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="mr-2">⚙️</span>
              Settings
            </Link>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            >
              <span className="mr-2">🚪</span>
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;

