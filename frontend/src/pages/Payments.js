import { useState, useEffect } from 'react';
import { paymentsAPI, contactsAPI } from '../utils/api';
import { formatCurrency, formatDate, getStatusColor, getPaymentTypeColor } from '../utils/formatters';
import ContactQuickAdd from '../components/ContactQuickAdd';

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [formData, setFormData] = useState({
    contact_id: '',
    description: '',
    original_amount: '',
    due_date: '',
    payment_type: 'owed_by_me',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [paymentsRes, contactsRes] = await Promise.all([
        paymentsAPI.getAll(),
        contactsAPI.getAll(),
      ]);
      setPayments(paymentsRes.data.data);
      setContacts(contactsRes.data.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedPayment) {
        await paymentsAPI.update(selectedPayment.id, formData);
      } else {
        await paymentsAPI.create(formData);
      }
      setShowModal(false);
      setSelectedPayment(null);
      setFormData({
        contact_id: '',
        description: '',
        original_amount: '',
        due_date: '',
        payment_type: 'owed_by_me',
        notes: '',
      });
      loadData();
    } catch (error) {
      console.error('Failed to save payment:', error);
      alert(error.response?.data?.message || 'Failed to save payment');
    }
  };

  const handleEdit = (payment) => {
    setSelectedPayment(payment);
    setFormData({
      contact_id: payment.contact_id,
      description: payment.description,
      original_amount: payment.original_amount,
      due_date: payment.due_date.split('T')[0],
      payment_type: payment.payment_type,
      notes: payment.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payment?')) return;
    try {
      await paymentsAPI.delete(id);
      loadData();
    } catch (error) {
      console.error('Failed to delete payment:', error);
      alert('Failed to delete payment');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">💰 Payments</h1>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
        >
          + New Payment
        </button>
      </div>

      {/* Payments List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contact</th>
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
                  <div className="text-sm font-medium text-gray-900">{payment.description}</div>
                  {payment.notes && <div className="text-sm text-gray-500">{payment.notes}</div>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.contact_name}</td>
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
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowModal(false)}></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">{selectedPayment ? 'Edit' : 'New'} Payment</h3>
                  <div className="space-y-4">
                    {showQuickAdd ? (
                      <ContactQuickAdd 
                        onContactAdded={(newContact) => {
                          setContacts([...contacts, newContact]);
                          setFormData({...formData, contact_id: newContact.id});
                          setShowQuickAdd(false);
                        }}
                        onCancel={() => setShowQuickAdd(false)}
                      />
                    ) : (
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-sm font-medium text-gray-700">Contact</label>
                          <button
                            type="button"
                            onClick={() => setShowQuickAdd(true)}
                            className="text-xs text-primary-600 hover:text-primary-800 font-medium"
                          >
                            + New Contact
                          </button>
                        </div>
                        <select required value={formData.contact_id} onChange={(e) => setFormData({...formData, contact_id: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                          <option value="">Select contact...</option>
                          {contacts.map(c => <option key={c.id} value={c.id}>{c.current_name}</option>)}
                        </select>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <input required type="text" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Amount</label>
                      <input required type="number" step="0.01" value={formData.original_amount} onChange={(e) => setFormData({...formData, original_amount: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Due Date</label>
                      <input required type="date" value={formData.due_date} onChange={(e) => setFormData({...formData, due_date: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Type</label>
                      <select value={formData.payment_type} onChange={(e) => setFormData({...formData, payment_type: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                        <option value="owed_by_me">I Owe</option>
                        <option value="owed_to_me">Owed to Me</option>
                      </select>
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
        </div>
      )}
    </div>
  );
};

export default Payments;
