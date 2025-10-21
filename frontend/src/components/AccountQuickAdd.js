import { useState } from 'react';
import { accountsAPI } from '../utils/api';
import { useToast } from '../context/ToastContext';

const AccountQuickAdd = ({ onAccountAdded, onCancel }) => {
  const { success, error } = useToast();
  const [formData, setFormData] = useState({
    account_name: '',
    account_type: 'checking',
    current_balance: '',
    currency: 'USD',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await accountsAPI.create(formData);
      success(`Account "${formData.account_name}" added successfully!`);
      onAccountAdded(response.data.data);
      setFormData({ account_name: '', account_type: 'checking', current_balance: '', currency: 'USD' });
    } catch (err) {
      console.error('Failed to add account:', err);
      error(err.response?.data?.message || 'Failed to add account');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border-2 border-primary-200 rounded-md p-3 bg-primary-50">
      <h4 className="text-sm font-semibold text-gray-900 mb-2">Quick Add Account</h4>
      <form onSubmit={handleSubmit} className="space-y-2">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Account Name</label>
          <input
            required
            type="text"
            value={formData.account_name}
            onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
            placeholder="e.g., Chase Checking"
            className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
            <select
              value={formData.account_type}
              onChange={(e) => setFormData({ ...formData, account_type: e.target.value })}
              className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="checking">Checking</option>
              <option value="savings">Savings</option>
              <option value="investment">Investment</option>
              <option value="credit">Credit</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Balance</label>
            <input
              required
              type="number"
              step="0.01"
              value={formData.current_balance}
              onChange={(e) => setFormData({ ...formData, current_balance: e.target.value })}
              placeholder="0.00"
              className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
        </div>
        <div className="flex justify-end space-x-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 text-xs border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-3 py-1.5 text-xs bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
          >
            {submitting ? 'Adding...' : 'Add Account'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AccountQuickAdd;

