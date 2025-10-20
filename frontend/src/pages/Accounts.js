import { useState, useEffect } from 'react';
import { accountsAPI } from '../utils/api';
import { formatCurrency } from '../utils/formatters';

const Accounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [formData, setFormData] = useState({
    account_name: '',
    account_type: 'checking',
    institution_name: '',
    current_balance: '',
    available_balance: '',
    notes: '',
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const response = await accountsAPI.getAll();
      setAccounts(response.data.data);
    } catch (error) {
      console.error('Failed to load accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedAccount) {
        await accountsAPI.update(selectedAccount.id, formData);
      } else {
        await accountsAPI.create(formData);
      }
      setShowModal(false);
      setSelectedAccount(null);
      resetForm();
      loadAccounts();
    } catch (error) {
      console.error('Failed to save account:', error);
      alert(error.response?.data?.message || 'Failed to save account');
    }
  };

  const resetForm = () => {
    setFormData({
      account_name: '',
      account_type: 'checking',
      institution_name: '',
      current_balance: '',
      available_balance: '',
      notes: '',
    });
  };

  const handleEdit = (account) => {
    setSelectedAccount(account);
    setFormData({
      account_name: account.account_name,
      account_type: account.account_type,
      institution_name: account.institution_name || '',
      current_balance: account.current_balance,
      available_balance: account.available_balance,
      notes: account.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this account?')) return;
    try {
      await accountsAPI.delete(id);
      loadAccounts();
    } catch (error) {
      console.error('Failed to delete account:', error);
      alert(error.response?.data?.message || 'Failed to delete account');
    }
  };

  const getTotalBalance = () => {
    return accounts.reduce((sum, acc) => sum + parseFloat(acc.current_balance || 0), 0);
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🏦 Accounts</h1>
          <p className="mt-1 text-sm text-gray-500">Total Balance: <span className="font-semibold text-gray-900">{formatCurrency(getTotalBalance())}</span></p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
        >
          + New Account
        </button>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => (
          <div key={account.id} className={`bg-white shadow rounded-lg p-6 ${!account.is_active && 'opacity-50'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">{account.account_name}</h3>
                <p className="text-sm text-gray-500 capitalize">{account.account_type.replace('_', ' ')}</p>
                {account.institution_name && (
                  <p className="text-xs text-gray-400 mt-1">{account.institution_name}</p>
                )}
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${account.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {account.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-500">Current Balance</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(account.current_balance)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Available Balance</p>
                <p className="text-lg font-medium text-green-600">{formatCurrency(account.available_balance)}</p>
              </div>
              {account.account_number_last4 && (
                <p className="text-xs text-gray-400">****{account.account_number_last4}</p>
              )}
            </div>
            <div className="mt-4 flex space-x-2">
              <button onClick={() => handleEdit(account)} className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Edit</button>
              <button onClick={() => handleDelete(account.id)} className="px-3 py-1.5 text-sm border border-red-300 rounded-md text-red-700 hover:bg-red-50">Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowModal(false)}></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">{selectedAccount ? 'Edit' : 'New'} Account</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Account Name</label>
                      <input required type="text" value={formData.account_name} onChange={(e) => setFormData({...formData, account_name: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" placeholder="My Checking" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Account Type</label>
                      <select value={formData.account_type} onChange={(e) => setFormData({...formData, account_type: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                        <option value="checking">Checking</option>
                        <option value="savings">Savings</option>
                        <option value="credit_card">Credit Card</option>
                        <option value="cash">Cash</option>
                        <option value="investment">Investment</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Institution Name</label>
                      <input type="text" value={formData.institution_name} onChange={(e) => setFormData({...formData, institution_name: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" placeholder="Bank name" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Current Balance</label>
                        <input required type="number" step="0.01" value={formData.current_balance} onChange={(e) => setFormData({...formData, current_balance: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Available Balance</label>
                        <input type="number" step="0.01" value={formData.available_balance} onChange={(e) => setFormData({...formData, available_balance: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Notes</label>
                      <textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"></textarea>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm">Save</button>
                  <button type="button" onClick={() => {setShowModal(false); setSelectedAccount(null); resetForm();}} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accounts;

