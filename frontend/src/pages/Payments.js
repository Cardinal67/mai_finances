import { useState, useEffect } from 'react';
import { paymentsAPI, contactsAPI, accountsAPI, creditCardsAPI } from '../utils/api';
import { formatCurrency, formatDate, getStatusColor, getPaymentTypeColor } from '../utils/formatters';
import { useToast } from '../context/ToastContext';
import ContactQuickAdd from '../components/ContactQuickAdd';
import AccountQuickAdd from '../components/AccountQuickAdd';
import CreditCardQuickAdd from '../components/CreditCardQuickAdd';

const Payments = () => {
  const { success, error } = useToast();
  const [payments, setPayments] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [creditCards, setCreditCards] = useState([]);
  const [recentRecipients, setRecentRecipients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [useContact, setUseContact] = useState(false);
  const [showAccountQuickAdd, setShowAccountQuickAdd] = useState(false);
  const [showCardQuickAdd, setShowCardQuickAdd] = useState(false);
  const [formData, setFormData] = useState({
    expense_name: '',
    recipient: '',
    contact_id: '',
    description: '',
    original_amount: '',
    due_date: '',
    payment_type: 'owed_by_me',
    expense_type: 'personal',
    payment_method: 'cash',
    from_account_id: '',
    from_credit_card_id: '',
    is_recurring: false,
    recurrence_frequency: 'monthly',
    recurrence_interval: 1,
    recurrence_end_date: '',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [paymentsRes, contactsRes, recipientsRes, accountsRes, cardsRes] = await Promise.all([
        paymentsAPI.getAll(),
        contactsAPI.getAll(),
        paymentsAPI.getRecentRecipients(),
        accountsAPI.getAll(),
        creditCardsAPI.getAll(),
      ]);
      setPayments(paymentsRes.data.data);
      setContacts(contactsRes.data.data);
      setRecentRecipients(recipientsRes.data.data || []);
      setAccounts(accountsRes.data.data || []);
      setCreditCards(cardsRes.data.data || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Prepare data based on payment method
      const submitData = { ...formData };
      if (formData.payment_method === 'cash') {
        submitData.from_account_id = null;
        submitData.from_credit_card_id = null;
      }
      
      if (selectedPayment) {
        await paymentsAPI.update(selectedPayment.id, submitData);
        success('Expense updated successfully!');
      } else {
        await paymentsAPI.create(submitData);
        success('Expense created successfully!');
      }
      setShowModal(false);
      setSelectedPayment(null);
      setFormData({
        expense_name: '',
        recipient: '',
        contact_id: '',
        description: '',
        original_amount: '',
        due_date: '',
        payment_type: 'owed_by_me',
        expense_type: 'personal',
        payment_method: 'cash',
        from_account_id: '',
        from_credit_card_id: '',
        is_recurring: false,
        recurrence_frequency: 'monthly',
        recurrence_interval: 1,
        recurrence_end_date: '',
        notes: '',
      });
      setUseContact(false);
      setShowAccountQuickAdd(false);
      setShowCardQuickAdd(false);
      loadData();
    } catch (err) {
      console.error('Failed to save payment:', err);
      error(err.response?.data?.message || 'Failed to save expense');
    }
  };

  const handleEdit = (payment) => {
    setSelectedPayment(payment);
    const hasContact = !!payment.contact_id;
    setUseContact(hasContact);
    setFormData({
      expense_name: payment.expense_name || '',
      recipient: payment.recipient || '',
      contact_id: payment.contact_id || '',
      description: payment.description || '',
      original_amount: payment.original_amount,
      due_date: payment.due_date.split('T')[0],
      payment_type: payment.payment_type,
      expense_type: payment.expense_type || 'personal',
      payment_method: payment.payment_method || 'cash',
      from_account_id: payment.from_account_id || '',
      from_credit_card_id: payment.from_credit_card_id || '',
      is_recurring: payment.is_recurring || false,
      recurrence_frequency: payment.recurrence_frequency || 'monthly',
      recurrence_interval: payment.recurrence_interval || 1,
      recurrence_end_date: payment.recurrence_end_date ? payment.recurrence_end_date.split('T')[0] : '',
      notes: payment.notes || '',
    });
    setShowModal(true);
  };
  
  const handlePaymentMethodChange = (e) => {
    const value = e.target.value;
    if (value === 'cash') {
      setFormData({...formData, payment_method: 'cash', from_account_id: '', from_credit_card_id: ''});
    } else if (value.startsWith('account_')) {
      setFormData({...formData, payment_method: 'account', from_account_id: value.replace('account_', ''), from_credit_card_id: ''});
    } else if (value.startsWith('card_')) {
      setFormData({...formData, payment_method: 'credit_card', from_account_id: '', from_credit_card_id: value.replace('card_', '')});
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await paymentsAPI.delete(id);
      success('Expense deleted successfully!');
      loadData();
    } catch (err) {
      console.error('Failed to delete payment:', err);
      error('Failed to delete expense');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">💰 Expenses</h1>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
        >
          + New Expense
        </button>
      </div>

      {/* Payments List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expense</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recipient</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments.map((payment) => (
              <tr key={payment.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{payment.expense_name || payment.description || '-'}</div>
                  {payment.description && payment.expense_name && <div className="text-sm text-gray-500">{payment.description}</div>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.recipient || payment.contact_name || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(payment.current_balance)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(payment.current_due_date)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${getPaymentTypeColor(payment.payment_type)}-100 text-${getPaymentTypeColor(payment.payment_type)}-800`}>
                    {payment.payment_type === 'owed_by_me' ? 'I Owe' : 'Owed to Me'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${getStatusColor(payment.status)}-100 text-${getStatusColor(payment.status)}-800`}>
                    {payment.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleEdit(payment)} className="text-primary-600 hover:text-primary-900 mr-3">Edit</button>
                  <button onClick={() => handleDelete(payment.id)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto flex items-center justify-center">
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowModal(false)}></div>
          <div className="relative bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all max-w-lg w-full mx-4">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">{selectedPayment ? 'Edit' : 'New'} Expense</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Expense Name</label>
                      <input required type="text" value={formData.expense_name} onChange={(e) => setFormData({...formData, expense_name: e.target.value})} placeholder="e.g., Electric Bill, Groceries, etc." className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                    </div>

                    {/* Toggle between contact and freeform recipient */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">Recipient</label>
                        <button
                          type="button"
                          onClick={() => setUseContact(!useContact)}
                          className="text-xs text-primary-600 hover:text-primary-800 font-medium"
                        >
                          {useContact ? 'Use Custom Recipient' : 'Use Contact'}
                        </button>
                      </div>

                      {useContact ? (
                        <div>
                          {showQuickAdd ? (
                            <ContactQuickAdd 
                              onContactAdded={(newContact) => {
                                setContacts([...contacts, newContact]);
                                setFormData({...formData, contact_id: newContact.id, recipient: ''});
                                setShowQuickAdd(false);
                              }}
                              onCancel={() => setShowQuickAdd(false)}
                            />
                          ) : (
                            <>
                              <div className="flex gap-2">
                                <select required value={formData.contact_id} onChange={(e) => setFormData({...formData, contact_id: e.target.value, recipient: ''})} className="flex-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                                  <option value="">Select contact...</option>
                                  {contacts.map(c => <option key={c.id} value={c.id}>{c.current_name}</option>)}
                                </select>
                                <button
                                  type="button"
                                  onClick={() => setShowQuickAdd(true)}
                                  className="px-3 py-2 text-sm text-primary-600 hover:text-primary-800 border border-primary-300 rounded-md"
                                >
                                  + New
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ) : (
                        <div>
                          <input 
                            required 
                            type="text" 
                            list="recipients"
                            value={formData.recipient} 
                            onChange={(e) => setFormData({...formData, recipient: e.target.value, contact_id: ''})} 
                            placeholder="Enter recipient name..." 
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" 
                          />
                          <datalist id="recipients">
                            {recentRecipients.map((r, idx) => (
                              <option key={idx} value={r} />
                            ))}
                          </datalist>
                          <p className="mt-1 text-xs text-gray-500">Recent recipients will appear as suggestions</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description (Optional)</label>
                      <input type="text" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Additional details..." className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Amount</label>
                      <input required type="number" step="0.01" value={formData.original_amount} onChange={(e) => setFormData({...formData, original_amount: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Due Date</label>
                      <input required type="date" value={formData.due_date} onChange={(e) => setFormData({...formData, due_date: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                    </div>

                    {/* Expense Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Expense Type</label>
                      <select value={formData.expense_type} onChange={(e) => setFormData({...formData, expense_type: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                        <option value="personal">Personal Payment</option>
                        <option value="bill">Bill</option>
                        <option value="subscription">Subscription</option>
                        <option value="loan">Loan Payment</option>
                        <option value="rent">Rent</option>
                        <option value="insurance">Insurance</option>
                        <option value="utilities">Utilities</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {/* Payment Method with Accounts and Cards */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                      {showAccountQuickAdd ? (
                        <AccountQuickAdd
                          onAccountAdded={(account) => {
                            setAccounts([...accounts, account]);
                            setFormData({...formData, payment_method: 'account', from_account_id: account.id, from_credit_card_id: ''});
                            setShowAccountQuickAdd(false);
                          }}
                          onCancel={() => setShowAccountQuickAdd(false)}
                        />
                      ) : showCardQuickAdd ? (
                        <CreditCardQuickAdd
                          onCardAdded={(card) => {
                            setCreditCards([...creditCards, card]);
                            setFormData({...formData, payment_method: 'credit_card', from_account_id: '', from_credit_card_id: card.id});
                            setShowCardQuickAdd(false);
                          }}
                          onCancel={() => setShowCardQuickAdd(false)}
                        />
                      ) : (
                        <>
                          <select 
                            value={formData.payment_method === 'cash' ? 'cash' : 
                                   formData.from_account_id ? `account_${formData.from_account_id}` : 
                                   formData.from_credit_card_id ? `card_${formData.from_credit_card_id}` : 'cash'} 
                            onChange={handlePaymentMethodChange} 
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                          >
                            <option value="cash">💵 Cash</option>
                            <optgroup label="Bank Accounts">
                              {accounts.map(account => (
                                <option key={account.id} value={`account_${account.id}`}>
                                  🏦 {account.account_name} ({account.account_type})
                                </option>
                              ))}
                              {accounts.length === 0 && <option disabled>No accounts available</option>}
                            </optgroup>
                            <optgroup label="Credit Cards">
                              {creditCards.map(card => (
                                <option key={card.id} value={`card_${card.id}`}>
                                  💳 {card.card_name} (••••{card.last_4_digits})
                                </option>
                              ))}
                              {creditCards.length === 0 && <option disabled>No credit cards available</option>}
                            </optgroup>
                          </select>
                          <div className="mt-2 flex gap-2">
                            <button
                              type="button"
                              onClick={() => setShowAccountQuickAdd(true)}
                              className="flex-1 px-3 py-2 text-sm text-primary-600 hover:text-primary-800 border border-primary-300 rounded-md hover:bg-primary-50 transition-colors"
                            >
                              + Add Account
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowCardQuickAdd(true)}
                              className="flex-1 px-3 py-2 text-sm text-primary-600 hover:text-primary-800 border border-primary-300 rounded-md hover:bg-primary-50 transition-colors"
                            >
                              + Add Card
                            </button>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Recurring Options */}
                    <div className="border-t border-gray-200 pt-4">
                      <label className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          checked={formData.is_recurring} 
                          onChange={(e) => setFormData({...formData, is_recurring: e.target.checked})} 
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm font-medium text-gray-700">This is a recurring expense</span>
                      </label>
                      
                      {formData.is_recurring && (
                        <div className="mt-3 space-y-3 pl-6 border-l-2 border-primary-200">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-medium text-gray-700">Frequency</label>
                              <select 
                                value={formData.recurrence_frequency} 
                                onChange={(e) => setFormData({...formData, recurrence_frequency: e.target.value})} 
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
                              >
                                <option value="daily">Daily</option>
                                <option value="weekly">Weekly</option>
                                <option value="biweekly">Every 2 Weeks</option>
                                <option value="monthly">Monthly</option>
                                <option value="quarterly">Quarterly</option>
                                <option value="annually">Annually</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-700">Repeat Every</label>
                              <div className="flex items-center mt-1 space-x-2">
                                <input 
                                  type="number" 
                                  min="1" 
                                  value={formData.recurrence_interval} 
                                  onChange={(e) => setFormData({...formData, recurrence_interval: e.target.value})} 
                                  className="block w-20 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
                                />
                                <span className="text-xs text-gray-500">{formData.recurrence_frequency}(s)</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700">End Date (Optional)</label>
                            <input 
                              type="date" 
                              value={formData.recurrence_end_date} 
                              onChange={(e) => setFormData({...formData, recurrence_end_date: e.target.value})} 
                              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"
                            />
                            <p className="mt-1 text-xs text-gray-500">Leave empty to repeat indefinitely</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Notes</label>
                      <textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"></textarea>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm">Save</button>
                  <button type="button" onClick={() => {setShowModal(false); setSelectedPayment(null);}} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Cancel</button>
                </div>
              </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
