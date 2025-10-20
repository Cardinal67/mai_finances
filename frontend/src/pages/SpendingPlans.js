import { useState, useEffect } from 'react';
import { spendingPlansAPI, accountsAPI, categoriesAPI } from '../utils/api';
import { formatCurrency, formatDate } from '../utils/formatters';

const SpendingPlans = () => {
  const [plans, setPlans] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [formData, setFormData] = useState({
    plan_name: '',
    planned_amount: '',
    planned_date: '',
    from_account_id: '',
    category_id: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [plansRes, accountsRes, categoriesRes] = await Promise.all([
        spendingPlansAPI.getAll(),
        accountsAPI.getAll(),
        categoriesAPI.getAll(),
      ]);
      setPlans(plansRes.data.data);
      setAccounts(accountsRes.data.data);
      setCategories(categoriesRes.data.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedPlan) {
        await spendingPlansAPI.update(selectedPlan.id, formData);
      } else {
        await spendingPlansAPI.create(formData);
      }
      setShowModal(false);
      setSelectedPlan(null);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Failed to save plan:', error);
      alert(error.response?.data?.message || 'Failed to save spending plan');
    }
  };

  const resetForm = () => {
    setFormData({
      plan_name: '',
      planned_amount: '',
      planned_date: '',
      from_account_id: '',
      category_id: '',
      notes: '',
    });
  };

  const handleEdit = (plan) => {
    setSelectedPlan(plan);
    setFormData({
      plan_name: plan.plan_name,
      planned_amount: plan.planned_amount,
      planned_date: plan.planned_date ? plan.planned_date.split('T')[0] : '',
      from_account_id: plan.from_account_id || '',
      category_id: plan.category_id || '',
      notes: plan.notes || '',
    });
    setShowModal(true);
  };

  const handleComplete = async (id) => {
    try {
      await spendingPlansAPI.complete(id);
      loadData();
    } catch (error) {
      console.error('Failed to complete plan:', error);
      alert('Failed to mark as completed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this spending plan?')) return;
    try {
      await spendingPlansAPI.delete(id);
      loadData();
    } catch (error) {
      console.error('Failed to delete plan:', error);
      alert('Failed to delete spending plan');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">🎯 Spending Plans</h1>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
        >
          + New Plan
        </button>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <div key={plan.id} className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">{plan.plan_name}</h3>
                {plan.planned_date && (
                  <p className="text-sm text-gray-500">{formatDate(plan.planned_date)}</p>
                )}
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                plan.status === 'planned' ? 'bg-purple-100 text-purple-800' :
                plan.status === 'completed' ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {plan.status}
              </span>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-500">Amount</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(plan.planned_amount)}</p>
              </div>
              {plan.from_account_name && (
                <p className="text-sm text-gray-600">From: {plan.from_account_name}</p>
              )}
              {plan.category_name && (
                <p className="text-sm text-gray-600">Category: {plan.category_name}</p>
              )}
              {plan.notes && (
                <p className="text-sm text-gray-500 italic">{plan.notes}</p>
              )}
            </div>
            <div className="mt-4 flex space-x-2">
              {plan.status === 'planned' && (
                <>
                  <button onClick={() => handleComplete(plan.id)} className="flex-1 px-3 py-1.5 text-sm border border-green-300 rounded-md text-green-700 hover:bg-green-50">Complete</button>
                  <button onClick={() => handleEdit(plan)} className="px-3 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Edit</button>
                </>
              )}
              <button onClick={() => handleDelete(plan.id)} className="px-3 py-1.5 text-sm border border-red-300 rounded-md text-red-700 hover:bg-red-50">Delete</button>
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
                  <h3 className="text-lg font-medium text-gray-900 mb-4">{selectedPlan ? 'Edit' : 'New'} Spending Plan</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Plan Name</label>
                      <input required type="text" value={formData.plan_name} onChange={(e) => setFormData({...formData, plan_name: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" placeholder="e.g., New laptop" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Amount</label>
                      <input required type="number" step="0.01" value={formData.planned_amount} onChange={(e) => setFormData({...formData, planned_amount: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Planned Date</label>
                      <input type="date" value={formData.planned_date} onChange={(e) => setFormData({...formData, planned_date: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">From Account</label>
                      <select value={formData.from_account_id} onChange={(e) => setFormData({...formData, from_account_id: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                        <option value="">Select account...</option>
                        {accounts.map(a => <option key={a.id} value={a.id}>{a.account_name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Category</label>
                      <select value={formData.category_id} onChange={(e) => setFormData({...formData, category_id: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                        <option value="">Select category...</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Notes</label>
                      <textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"></textarea>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-purple-600 text-base font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 sm:ml-3 sm:w-auto sm:text-sm">Save</button>
                  <button type="button" onClick={() => {setShowModal(false); setSelectedPlan(null); resetForm();}} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpendingPlans;

