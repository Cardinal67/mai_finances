import { useState } from 'react';
import { contactsAPI } from '../utils/api';

const ContactQuickAdd = ({ onContactAdded, onCancel }) => {
  const [formData, setFormData] = useState({
    current_name: '',
    contact_type: 'person',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await contactsAPI.create(formData);
      const newContact = response.data.data;
      onContactAdded(newContact);
      // Reset form
      setFormData({
        current_name: '',
        contact_type: 'person',
        email: '',
        phone: '',
      });
    } catch (err) {
      console.error('Failed to create contact:', err);
      setError(err.response?.data?.message || 'Failed to create contact');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <h4 className="text-sm font-medium text-blue-900 mb-3">✨ Quick Add New Contact</h4>
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <div className="rounded-md bg-red-50 p-2">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700">Name *</label>
            <input
              required
              type="text"
              value={formData.current_name}
              onChange={(e) => setFormData({ ...formData, current_name: e.target.value })}
              className="mt-1 block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Contact name"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700">Type</label>
            <select
              value={formData.contact_type}
              onChange={(e) => setFormData({ ...formData, contact_type: e.target.value })}
              className="mt-1 block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="person">Person</option>
              <option value="business">Business</option>
              <option value="utility">Utility</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="mt-1 block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="email@example.com"
            />
          </div>
          
          <div>
            <label className="block text-xs font-medium text-gray-700">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="mt-1 block w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="(555) 123-4567"
            />
          </div>
        </div>

        <div className="flex space-x-2 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50"
          >
            {loading ? 'Adding...' : '+ Add Contact'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactQuickAdd;

