import { useState } from 'react';
import { creditCardsAPI } from '../utils/api';
import { useToast } from '../context/ToastContext';

const CreditCardQuickAdd = ({ onCardAdded, onCancel }) => {
  const { success, error } = useToast();
  const [formData, setFormData] = useState({
    card_name: '',
    last_4_digits: '',
    credit_limit: '',
    current_balance: '0.00',
    card_network: 'visa',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const response = await creditCardsAPI.create(formData);
      success(`Credit card "${formData.card_name}" added successfully!`);
      onCardAdded(response.data.data);
      setFormData({ card_name: '', last_4_digits: '', credit_limit: '', current_balance: '0.00', card_network: 'visa' });
    } catch (err) {
      console.error('Failed to add credit card:', err);
      error(err.response?.data?.message || 'Failed to add credit card');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="border-2 border-primary-200 rounded-md p-3 bg-primary-50">
      <h4 className="text-sm font-semibold text-gray-900 mb-2">Quick Add Credit Card</h4>
      <form onSubmit={handleSubmit} className="space-y-2">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Card Name</label>
          <input
            required
            type="text"
            value={formData.card_name}
            onChange={(e) => setFormData({ ...formData, card_name: e.target.value })}
            placeholder="e.g., Chase Sapphire"
            className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Last 4 Digits</label>
            <input
              required
              type="text"
              maxLength="4"
              pattern="[0-9]{4}"
              value={formData.last_4_digits}
              onChange={(e) => setFormData({ ...formData, last_4_digits: e.target.value })}
              placeholder="1234"
              className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Network</label>
            <select
              value={formData.card_network}
              onChange={(e) => setFormData({ ...formData, card_network: e.target.value })}
              className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
              <option value="visa">Visa</option>
              <option value="mastercard">Mastercard</option>
              <option value="amex">American Express</option>
              <option value="discover">Discover</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">Credit Limit</label>
          <input
            required
            type="number"
            step="0.01"
            value={formData.credit_limit}
            onChange={(e) => setFormData({ ...formData, credit_limit: e.target.value })}
            placeholder="0.00"
            className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          />
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
            {submitting ? 'Adding...' : 'Add Card'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreditCardQuickAdd;

