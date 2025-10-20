import { useState, useEffect } from 'react';
import { preferencesAPI } from '../utils/api';
import ThemeBuilder from '../components/ThemeBuilder';

const Settings = () => {
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const response = await preferencesAPI.get();
      setPreferences(response.data.data);
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await preferencesAPI.update(preferences);
      setMessage('Settings saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Failed to save preferences:', error);
      setMessage('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset all settings to defaults?')) return;
    try {
      await preferencesAPI.reset();
      loadPreferences();
      setMessage('Settings reset to defaults');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Failed to reset preferences:', error);
      setMessage('Failed to reset settings');
    }
  };

  if (loading || !preferences) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">⚙️ Settings</h1>
        <button
          onClick={handleReset}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Reset to Defaults
        </button>
      </div>

      {message && (
        <div className={`rounded-md p-4 ${message.includes('success') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message}
        </div>
      )}

      {/* Theme Builder Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <ThemeBuilder />
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Regional Settings */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Regional Settings</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Timezone</label>
              <select
                value={preferences.timezone}
                onChange={(e) => setPreferences({...preferences, timezone: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Default Currency</label>
              <select
                value={preferences.default_currency}
                onChange={(e) => setPreferences({...preferences, default_currency: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
                <option value="CAD">CAD ($)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Financial Preferences */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Financial Preferences</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Default Date Range (days)</label>
              <input
                type="number"
                value={preferences.date_range_preference}
                onChange={(e) => setPreferences({...preferences, date_range_preference: parseInt(e.target.value)})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                min="7"
                max="365"
              />
              <p className="mt-1 text-sm text-gray-500">How many days ahead to show by default</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Safety Buffer Type</label>
              <div className="mt-2 space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="fixed"
                    checked={preferences.safety_buffer_type === 'fixed'}
                    onChange={(e) => setPreferences({...preferences, safety_buffer_type: e.target.value})}
                    className="form-radio text-primary-600"
                  />
                  <span className="ml-2">Fixed Amount</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="percentage"
                    checked={preferences.safety_buffer_type === 'percentage'}
                    onChange={(e) => setPreferences({...preferences, safety_buffer_type: e.target.value})}
                    className="form-radio text-primary-600"
                  />
                  <span className="ml-2">Percentage</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Safety Buffer {preferences.safety_buffer_type === 'percentage' ? '(%)' : 'Amount'}
              </label>
              <input
                type="number"
                step="0.01"
                value={preferences.safety_buffer_amount}
                onChange={(e) => setPreferences({...preferences, safety_buffer_amount: parseFloat(e.target.value)})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
              <p className="mt-1 text-sm text-gray-500">
                {preferences.safety_buffer_type === 'percentage' 
                  ? 'Percentage of balance to keep as safety buffer'
                  : 'Fixed amount to keep as safety buffer'}
              </p>
            </div>
          </div>
        </div>

        {/* Display Preferences */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Display Preferences</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Theme</label>
              <select
                value={preferences.theme}
                onChange={(e) => setPreferences({...preferences, theme: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Display Density</label>
              <select
                value={preferences.display_density}
                onChange={(e) => setPreferences({...preferences, display_density: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="compact">Compact</option>
                <option value="comfortable">Comfortable</option>
                <option value="spacious">Spacious</option>
              </select>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;

