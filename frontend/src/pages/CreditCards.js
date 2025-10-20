import { useState, useEffect } from 'react';
import { creditCardsAPI } from '../utils/api';
import { formatCurrency } from '../utils/formatters';

const CreditCards = () => {
  const [cards, setCards] = useState([]);
  const [utilization, setUtilization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [formData, setFormData] = useState({
    card_nickname: '',
    financial_institution: '',
    card_issuer: 'visa',
    last_four_digits: '',
    credit_limit: '',
    current_balance: '',
    payment_due_date: '',
    minimum_payment: '',
    apr: '',
    expiration_month: '',
    expiration_year: '',
    card_status: 'active',
    rewards_program: '',
    card_color: '#3b82f6',
    notes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [cardsRes, utilizationRes] = await Promise.all([
        creditCardsAPI.getAll(),
        creditCardsAPI.getUtilization(),
      ]);
      setCards(cardsRes.data.data);
      setUtilization(utilizationRes.data.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedCard) {
        await creditCardsAPI.update(selectedCard.id, formData);
      } else {
        await creditCardsAPI.create(formData);
      }
      setShowModal(false);
      setSelectedCard(null);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Failed to save credit card:', error);
      alert(error.response?.data?.message || 'Failed to save credit card');
    }
  };

  const resetForm = () => {
    setFormData({
      card_nickname: '',
      financial_institution: '',
      card_issuer: 'visa',
      last_four_digits: '',
      credit_limit: '',
      current_balance: '',
      payment_due_date: '',
      minimum_payment: '',
      apr: '',
      expiration_month: '',
      expiration_year: '',
      card_status: 'active',
      rewards_program: '',
      card_color: '#3b82f6',
      notes: '',
    });
  };

  const handleEdit = (card) => {
    setSelectedCard(card);
    setFormData({
      card_nickname: card.card_nickname,
      financial_institution: card.financial_institution || '',
      card_issuer: card.card_issuer || 'visa',
      last_four_digits: card.last_four_digits || '',
      credit_limit: card.credit_limit,
      current_balance: card.current_balance,
      payment_due_date: card.payment_due_date || '',
      minimum_payment: card.minimum_payment || '',
      apr: card.apr || '',
      expiration_month: card.expiration_month || '',
      expiration_year: card.expiration_year || '',
      card_status: card.card_status,
      rewards_program: card.rewards_program || '',
      card_color: card.card_color || '#3b82f6',
      notes: card.notes || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this credit card?')) return;
    try {
      await creditCardsAPI.delete(id);
      loadData();
    } catch (error) {
      console.error('Failed to delete credit card:', error);
      alert('Failed to delete credit card');
    }
  };

  const getCardIssuerIcon = (issuer) => {
    switch (issuer) {
      case 'visa': return '💳';
      case 'mastercard': return '💳';
      case 'amex': return '💳';
      case 'discover': return '💳';
      default: return '💳';
    }
  };

  const getUtilizationColor = (percent) => {
    if (percent < 30) return 'text-green-600';
    if (percent < 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">💳 Credit Cards</h1>
          {utilization && (
            <p className="mt-1 text-sm text-gray-500">
              Overall Utilization: <span className={`font-semibold ${getUtilizationColor(utilization.overall_utilization)}`}>
                {utilization.overall_utilization}%
              </span> ({formatCurrency(utilization.total_balance)} of {formatCurrency(utilization.total_limit)})
            </p>
          )}
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
        >
          + New Card
        </button>
      </div>

      {/* Utilization Summary */}
      {utilization && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Credit Utilization Summary</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-sm text-gray-500">Total Cards</p>
              <p className="text-2xl font-bold text-gray-900">{utilization.total_cards}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Credit</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(utilization.total_limit)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Balance</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(utilization.total_balance)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Available Credit</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(utilization.total_available)}</p>
            </div>
          </div>
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <div
            key={card.id}
            className="rounded-lg shadow-lg overflow-hidden"
            style={{ border: `3px solid ${card.card_color || '#3b82f6'}` }}
          >
            <div
              className="p-6 text-white"
              style={{ backgroundColor: card.card_color || '#3b82f6' }}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm opacity-90">{card.financial_institution || 'Credit Card'}</p>
                  <p className="text-lg font-bold">{card.card_nickname}</p>
                </div>
                <span className="text-2xl">{getCardIssuerIcon(card.card_issuer)}</span>
              </div>
              <div className="mb-4">
                <p className="text-sm opacity-90">Card Number</p>
                <p className="text-lg font-mono">•••• {card.last_four_digits || '••••'}</p>
              </div>
              <div className="flex justify-between">
                {card.expiration_month && card.expiration_year && (
                  <div>
                    <p className="text-xs opacity-90">Exp</p>
                    <p className="font-mono">{String(card.expiration_month).padStart(2, '0')}/{String(card.expiration_year).slice(-2)}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white p-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Balance</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(card.current_balance)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Limit</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(card.credit_limit)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Available</span>
                  <span className="font-semibold text-green-600">{formatCurrency(card.available_credit)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Utilization</span>
                  <span className={`font-semibold ${getUtilizationColor(card.utilization_percent)}`}>
                    {card.utilization_percent}%
                  </span>
                </div>
                {card.apr && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">APR</span>
                    <span className="font-semibold text-gray-900">{card.apr}%</span>
                  </div>
                )}
              </div>

              <div className="mt-4 flex space-x-2">
                <button onClick={() => handleEdit(card)} className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Edit</button>
                <button onClick={() => handleDelete(card.id)} className="px-3 py-1.5 text-sm border border-red-300 rounded-md text-red-700 hover:bg-red-50">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowModal(false)}></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">{selectedCard ? 'Edit' : 'New'} Credit Card</h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Card Nickname *</label>
                      <input required type="text" value={formData.card_nickname} onChange={(e) => setFormData({...formData, card_nickname: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Financial Institution</label>
                      <input type="text" value={formData.financial_institution} onChange={(e) => setFormData({...formData, financial_institution: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Card Issuer</label>
                      <select value={formData.card_issuer} onChange={(e) => setFormData({...formData, card_issuer: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                        <option value="visa">Visa</option>
                        <option value="mastercard">Mastercard</option>
                        <option value="amex">American Express</option>
                        <option value="discover">Discover</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Last 4 Digits</label>
                      <input type="text" maxLength="4" value={formData.last_four_digits} onChange={(e) => setFormData({...formData, last_four_digits: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Credit Limit *</label>
                      <input required type="number" step="0.01" value={formData.credit_limit} onChange={(e) => setFormData({...formData, credit_limit: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Current Balance</label>
                      <input type="number" step="0.01" value={formData.current_balance} onChange={(e) => setFormData({...formData, current_balance: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Payment Due Date (day of month)</label>
                      <input type="number" min="1" max="31" value={formData.payment_due_date} onChange={(e) => setFormData({...formData, payment_due_date: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">APR (%)</label>
                      <input type="number" step="0.01" value={formData.apr} onChange={(e) => setFormData({...formData, apr: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Exp. Month</label>
                      <input type="number" min="1" max="12" value={formData.expiration_month} onChange={(e) => setFormData({...formData, expiration_month: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Exp. Year</label>
                      <input type="number" min="2024" max="2050" value={formData.expiration_year} onChange={(e) => setFormData({...formData, expiration_year: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Card Color</label>
                      <input type="color" value={formData.card_color} onChange={(e) => setFormData({...formData, card_color: e.target.value})} className="mt-1 block w-full h-10 rounded-md border-gray-300 shadow-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <select value={formData.card_status} onChange={(e) => setFormData({...formData, card_status: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                        <option value="active">Active</option>
                        <option value="closed">Closed</option>
                        <option value="frozen">Frozen</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Rewards Program</label>
                      <input type="text" value={formData.rewards_program} onChange={(e) => setFormData({...formData, rewards_program: e.target.value})} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Notes</label>
                      <textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} rows={2} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"></textarea>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm">Save</button>
                  <button type="button" onClick={() => {setShowModal(false); setSelectedCard(null); resetForm();}} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">Cancel</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditCards;

