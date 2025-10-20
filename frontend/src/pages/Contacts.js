import { useState, useEffect } from 'react';
import { contactsAPI } from '../utils/api';

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [formData, setFormData] = useState({
    current_name: '',
    contact_type: 'person',
    email: '',
    phone: '',
    address: '',
    website: '',
    notes: '',
  });

  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      const response = await contactsAPI.getAll();
      setContacts(response.data.data);
    } catch (error) {
      console.error('Failed to load contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedContact) {
        await contactsAPI.update(selectedContact.id, formData);
      } else {
        await contactsAPI.create(formData);
      }
      setShowModal(false);
      setSelectedContact(null);
      resetForm();
      loadContacts();
    } catch (error) {
      console.error('Failed to save contact:', error);
      alert(error.response?.data?.message || 'Failed to save contact');
    }
  };

  const resetForm = () => {
    setFormData({
      current_name: '',
      contact_type: 'person',
      email: '',
      phone: '',
      address: '',
      website: '',
      notes: '',
    });
  };

  const handleEdit = (contact) => {
    setSelectedContact(contact);
    setFormData({
      current_name: contact.current_name,
      contact_type: contact.contact_type,
      email: contact.email || '',
      phone: contact.phone || '',
      address: contact.address || '',
      website: contact.website || '',
      notes: contact.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;
    try {
      await contactsAPI.delete(id);
      loadContacts();
    } catch (error) {
      console.error('Failed to delete contact:', error);
      alert(error.response?.data?.message || 'Failed to delete contact');
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">👥 Contacts</h1>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
        >
          + New Contact
        </button>
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {contacts.map((contact) => (
          <div key={contact.id} className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">{contact.current_name}</h3>
                <p className="text-sm text-gray-500 capitalize">{contact.contact_type}</p>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${contact.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                {contact.status}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              {contact.email && (
                <div className="flex items-center text-gray-600">
                  <span className="mr-2">📧</span>
                  <span className="truncate">{contact.email}</span>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center text-gray-600">
                  <span className="mr-2">📞</span>
                  <span>{contact.phone}</span>
                </div>
              )}
              {contact.website && (
                <div className="flex items-center text-gray-600">
                  <span className="mr-2">🌐</span>
                  <span className="truncate">{contact.website}</span>
                </div>
              )}
              {contact.payment_count > 0 && (
                <div className="text-xs text-primary-600">
                  {contact.payment_count} payment(s)
                </div>
              )}
            </div>
            <div className="mt-4 flex space-x-2">
              <button onClick={() => handleEdit(contact)} className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Edit</button>
              <button onClick={() => handleDelete(contact.id)} className="px-3 py-1.5 text-sm border border-red-300 rounded-md text-red-700 hover:bg-red-50">Delete</button>
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
                  <h3 className="text-lg font-medium text-gray-900 mb-4">{selectedContact ? 'Edit' : 'New'} Contact</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Name</label>
                      <input required type="text" value={formData.current_name} onChange={(e) => setFormData({...formData, current_name: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Type</label>
                      <select value={formData.contact_type} onChange={(e) => setFormData({...formData, contact_type: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                        <option value="person">Person</option>
                        <option value="business">Business</option>
                        <option value="utility">Utility</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Address</label>
                      <textarea value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} rows={2} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Website</label>
                      <input type="url" value={formData.website} onChange={(e) => setFormData({...formData, website: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Notes</label>
                      <textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"></textarea>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm">Save</button>
                  <button type="button" onClick={() => {setShowModal(false); setSelectedContact(null); resetForm();}} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contacts;

