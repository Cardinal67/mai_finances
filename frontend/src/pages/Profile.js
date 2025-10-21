import { useState, useEffect } from 'react';
import { authAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, loadUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Profile info form
  const [profileForm, setProfileForm] = useState({
    username: '',
    email: '',
    profile_image_url: '',
  });

  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  useEffect(() => {
    if (user) {
      setProfileForm({
        username: user.username || '',
        email: user.email || '',
        profile_image_url: user.profile_image_url || '',
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const updates = {};
      
      // Only send fields that have changed
      if (profileForm.username !== user.username) {
        updates.username = profileForm.username;
      }
      if (profileForm.email !== user.email) {
        updates.email = profileForm.email;
      }
      if (profileForm.profile_image_url !== (user.profile_image_url || '')) {
        updates.profile_image_url = profileForm.profile_image_url;
      }

      if (Object.keys(updates).length === 0) {
        setMessage({ type: 'info', text: 'No changes to save' });
        setLoading(false);
        return;
      }

      const response = await authAPI.updateProfile(updates);
      
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      // Reload user data
      await loadUser();
    } catch (error) {
      console.error('Profile update error:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update profile' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    // Validate passwords match
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      setLoading(false);
      return;
    }

    // Validate password strength
    if (passwordForm.new_password.length < 8) {
      setMessage({ type: 'error', text: 'New password must be at least 8 characters long' });
      setLoading(false);
      return;
    }

    try {
      await authAPI.updateProfile({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      
      // Clear password form
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
    } catch (error) {
      console.error('Password change error:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to change password' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">👤 Profile</h1>

      {/* Message Display */}
      {message.text && (
        <div className={`rounded-lg p-4 ${
          message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-800' :
          message.type === 'error' ? 'bg-red-50 border border-red-200 text-red-800' :
          'bg-blue-50 border border-blue-200 text-blue-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Profile Information */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>
          <p className="mt-1 text-sm text-gray-500">Update your account information</p>
        </div>
        <form onSubmit={handleProfileUpdate} className="px-6 py-4 space-y-4">
          {/* Profile Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Image
            </label>
            <div className="flex items-center space-x-4">
              <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {profileForm.profile_image_url ? (
                  <img 
                    src={profileForm.profile_image_url} 
                    alt="Profile" 
                    className="h-full w-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <span className="text-3xl text-gray-400">👤</span>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="url"
                  value={profileForm.profile_image_url}
                  onChange={(e) => setProfileForm({ ...profileForm, profile_image_url: e.target.value })}
                  placeholder="Enter image URL"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
                <p className="mt-1 text-xs text-gray-500">Enter a URL to your profile image</p>
              </div>
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              required
              value={profileForm.username}
              onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={profileForm.email}
              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>

          {/* Account Details (Read-only) */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-500">User ID</label>
              <p className="mt-1 text-sm text-gray-900 font-mono">{user?.id?.substring(0, 8)}...</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500">Member Since</label>
              <p className="mt-1 text-sm text-gray-900">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
              </p>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Change Password</h2>
          <p className="mt-1 text-sm text-gray-500">Update your password to keep your account secure</p>
        </div>
        <form onSubmit={handlePasswordChange} className="px-6 py-4 space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={passwordForm.current_password}
              onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              required
              value={passwordForm.new_password}
              onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
            <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters</p>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={passwordForm.confirm_password}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
            >
              {loading ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;

