import { useState, useEffect } from 'react';
import { incomeAPI, accountsAPI } from '../utils/api';
import { formatCurrency, formatDate } from '../utils/formatters';

const Income = () => {
  const [incomeStreams, setIncomeStreams] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState(null);
  const [formData, setFormData] = useState({
    source_name: '',
    source_type: 'salary',
    amount: '',
    is_variable: false,
    to_account_id: '',
    is_recurring: false,
    recurrence_pattern: 'monthly',
    next_expected_date: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [incomeRes, accountsRes] = await Promise.all([
        incomeAPI.getAll(),
        accountsAPI.getAll(),
      ]);
      setIncomeStreams(incomeRes.data.data);
      setAccounts(accountsRes.data.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedIncome) {
        await incomeAPI.update(selectedIncome.id, formData);
      } else {
        await incomeAPI.create(formData);
      }
      setShowModal(false);
      setSelectedIncome(null);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Failed to save income:', error);
      alert(error.response?.data?.message || 'Failed to save income');
    }
  };

  const resetForm = () => {
    setFormData({
      source_name: '',
      source_type: 'salary',
      amount: '',
      is_variable: false,
      to_account_id: '',
      is_recurring: false,
      recurrence_pattern: 'monthly',
      next_expected_date: '',
      notes: '',
    });
  };

  const handleEdit = (income) => {
    setSelectedIncome(income);
    setFormData({
      source_name: income.source_name,
      source_type: income.source_type,
      amount: income.amount,
      is_variable: income.is_variable,
      to_account_id: income.to_account_id || '',
      is_recurring: income.is_recurring,
      recurrence_pattern: income.recurrence_pattern || 'monthly',
      next_expected_date: income.next_expected_date ? income.next_expected_date.split('T')[0] : '',
      notes: income.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this income stream?')) return;
    try {
      await incomeAPI.delete(id);
      loadData();
    } catch (error) {
      console.error('Failed to delete income:', error);
      alert('Failed to delete income');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">💵 Income</h1>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
        >
          + New Income Source
        </button>
      </div>

      {/* Income Streams Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {incomeStreams.map((income) => (
          <div key={income.id} className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">{income.source_name}</h3>
                <p className="text-sm text-gray-500 capitalize">{income.source_type}</p>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${income.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {income.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Amount:</span>
                <span className="text-sm font-medium text-gray-900">{formatCurrency(income.amount)}</span>
              </div>
              {income.next_expected_date && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Next Expected:</span>
                  <span className="text-sm text-gray-900">{formatDate(income.next_expected_date)}</span>
                </div>
              )}
              {income.is_recurring && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Frequency:</span>
                  <span className="text-sm text-gray-900 capitalize">{income.recurrence_pattern}</span>
                </div>
              )}
              {income.is_variable && (
                <div className="text-xs text-yellow-600">⚠️ Variable amount</div>
              )}
            </div>
            <div className="mt-4 flex space-x-2">
              <button onClick={() => handleEdit(income)} className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Edit</button>
              <button onClick={() => handleDelete(income.id)} className="px-3 py-1.5 text-sm border border-red-300 rounded-md text-red-700 hover:bg-red-50">Delete</button>
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
                  <h3 className="text-lg font-medium text-gray-900 mb-4">{selectedIncome ? 'Edit' : 'New'} Income Source</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Source Name</label>
                      <input required type="text" value={formData.source_name} onChange={(e) => setFormData({...formData, source_name: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Source Type</label>
                      <select value={formData.source_type} onChange={(e) => setFormData({...formData, source_type: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                        <option value="salary">Salary</option>
                        <option value="wages">Wages</option>
                        <option value="freelance">Freelance</option>
                        <option value="business">Business</option>
                        <option value="rental">Rental</option>
                        <option value="investment">Investment</option>
                        <option value="gift">Gift</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Amount</label>
                      <input required type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                    </div>
                    <div>
                      <label className="flex items-center">
                        <input type="checkbox" checked={formData.is_variable} onChange={(e) => setFormData({...formData, is_variable: e.target.checked})} className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                        <span className="ml-2 text-sm text-gray-700">Variable amount</span>
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Deposit To Account</label>
                      <select value={formData.to_account_id} onChange={(e) => setFormData({...formData, to_account_id: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                        <option value="">Select account...</option>
                        {accounts.map(a => <option key={a.id} value={a.id}>{a.account_name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="flex items-center">
                        <input type="checkbox" checked={formData.is_recurring} onChange={(e) => setFormData({...formData, is_recurring: e.target.checked})} className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                        <span className="ml-2 text-sm text-gray-700">Recurring income</span>
                      </label>
                    </div>
                    {formData.is_recurring && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Frequency</label>
                          <select value={formData.recurrence_pattern} onChange={(e) => setFormData({...formData, recurrence_pattern: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                            <option value="weekly">Weekly</option>
                            <option value="biweekly">Biweekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                            <option value="yearly">Yearly</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Next Expected Date</label>
                          <input type="date" value={formData.next_expected_date} onChange={(e) => setFormData({...formData, next_expected_date: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                        </div>
                      </>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Notes</label>
                      <textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"></textarea>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:ml-3 sm:w-auto sm:text-sm">Save</button>
                  <button type="button" onClick={() => {setShowModal(false); setSelectedIncome(null); resetForm();}} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Income;
