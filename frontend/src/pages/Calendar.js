import { useState, useEffect } from 'react';
import { calendarAPI, paymentsAPI, incomeAPI, contactsAPI, accountsAPI, creditCardsAPI } from '../utils/api';
import { formatCurrency } from '../utils/formatters';
import { useToast } from '../context/ToastContext';
import AccountQuickAdd from '../components/AccountQuickAdd';
import CreditCardQuickAdd from '../components/CreditCardQuickAdd';

const Calendar = () => {
  const { success, error } = useToast();
  const [events, setEvents] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [creditCards, setCreditCards] = useState([]);
  const [recentRecipients, setRecentRecipients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addFormType, setAddFormType] = useState(null); // 'expense' or 'income'
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [showAccountQuickAdd, setShowAccountQuickAdd] = useState(false);
  const [showCardQuickAdd, setShowCardQuickAdd] = useState(false);

  useEffect(() => {
    loadData();
  }, [currentDate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const [eventsRes, contactsRes, accountsRes, cardsRes, recipientsRes] = await Promise.all([
        calendarAPI.getEvents({
          start_date: firstDay.toISOString().split('T')[0],
          end_date: lastDay.toISOString().split('T')[0],
        }),
        contactsAPI.getAll(),
        accountsAPI.getAll(),
        creditCardsAPI.getAll(),
        paymentsAPI.getRecentRecipients(),
      ]);
      
      setEvents(eventsRes.data.data.events);
      setContacts(contactsRes.data.data);
      setAccounts(accountsRes.data.data);
      setCreditCards(cardsRes.data.data || []);
      setRecentRecipients(recipientsRes.data.data || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => event.date.split('T')[0] === dateStr);
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (date) => {
    if (!date) return;
    setSelectedDate(date);
    setShowAddForm(false);
    setAddFormType(null);
  };

  const startAddForm = (type) => {
    const formattedDate = selectedDate.toISOString().split('T')[0];
    setAddFormType(type);
    setShowAddForm(true);
    
    if (type === 'expense') {
      setFormData({
        expense_name: '',
        recipient: '',
        contact_id: '',
        description: '',
        original_amount: '',
        due_date: formattedDate,
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
    } else if (type === 'income') {
      setFormData({
        source_name: '',
        source_type: 'salary',
        amount: '',
        next_expected_date: formattedDate,
        to_account_id: '',
      });
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      if (addFormType === 'expense') {
        await paymentsAPI.create(formData);
        success('Expense created successfully!');
      } else if (addFormType === 'income') {
        await incomeAPI.create(formData);
        success('Income source created successfully!');
      }
      
      setShowAddForm(false);
      setAddFormType(null);
      setFormData({});
      setShowAccountQuickAdd(false);
      setShowCardQuickAdd(false);
      loadData();
    } catch (err) {
      console.error('Failed to create entry:', err);
      error(err.response?.data?.message || 'Failed to create entry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const days = getDaysInMonth();

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">📅 Calendar</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={goToToday}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Today
          </button>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={prevMonth}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h2 className="text-2xl font-bold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          
          <button
            onClick={nextMonth}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Day headers */}
          {dayNames.map((day) => (
            <div key={day} className="text-center text-sm font-semibold text-gray-700 py-2">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {days.map((date, idx) => {
            const dayEvents = date ? getEventsForDate(date) : [];
            const isTodayDate = isToday(date);
            
            return (
              <div
                key={idx}
                onClick={() => handleDateClick(date)}
                className={`min-h-[100px] border rounded-lg p-2 transition-colors ${
                  date 
                    ? isTodayDate
                      ? 'bg-primary-50 border-primary-500 hover:bg-primary-100 cursor-pointer'
                      : 'bg-white hover:bg-gray-50 cursor-pointer'
                    : 'bg-gray-50'
                }`}
              >
                {date && (
                  <>
                    <div className={`text-sm font-semibold mb-1 ${
                      isTodayDate ? 'text-primary-700' : 'text-gray-900'
                    }`}>
                      {date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event, eventIdx) => (
                        <div
                          key={eventIdx}
                          className="text-xs px-2 py-1 rounded truncate"
                          style={{ backgroundColor: `${event.color}20`, color: event.color }}
                          title={event.title}
                        >
                          {event.event_type === 'payment' ? '💰' : event.event_type === 'income' ? '💵' : '🔔'} {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-gray-500 pl-2">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Event Details for Selected Date */}
      {selectedDate && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Events for {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </h3>
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                + Add Event
              </button>
            )}
          </div>

          {!showAddForm && (
            <div className="mb-4 flex space-x-2">
              <button
                onClick={() => startAddForm('expense')}
                className="flex-1 px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded-md hover:bg-red-100"
              >
                💰 Add Expense
              </button>
              <button
                onClick={() => startAddForm('income')}
                className="flex-1 px-4 py-2 bg-green-50 border border-green-200 text-green-700 rounded-md hover:bg-green-100"
              >
                💵 Add Income
              </button>
            </div>
          )}

          {/* Inline Add Form */}
          {showAddForm && (
            <form onSubmit={handleSubmit} className="mb-4 p-4 border-2 border-primary-200 rounded-lg bg-primary-50">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-gray-900">
                  {addFormType === 'expense' ? '💰 New Expense' : '💵 New Income'}
                </h4>
                <button
                  type="button"
                  onClick={() => {setShowAddForm(false); setAddFormType(null);}}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              {addFormType === 'expense' ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {/* Expense Name */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Expense Name</label>
                    <input required type="text" value={formData.expense_name} onChange={(e) => setFormData({...formData, expense_name: e.target.value})} placeholder="e.g., Electric Bill, Groceries" className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                  </div>

                  {/* Recipient */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Recipient</label>
                    <input required type="text" list="calendar-recipients" value={formData.recipient} onChange={(e) => setFormData({...formData, recipient: e.target.value})} placeholder="Enter recipient name" className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                    <datalist id="calendar-recipients">
                      {recentRecipients.map((r, idx) => <option key={idx} value={r} />)}
                    </datalist>
                  </div>
                  
                  {/* Amount and Expense Type */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Amount</label>
                      <input required type="number" step="0.01" value={formData.original_amount} onChange={(e) => setFormData({...formData, original_amount: e.target.value})} className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                      <select value={formData.expense_type} onChange={(e) => setFormData({...formData, expense_type: e.target.value})} className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                        <option value="personal">Personal</option>
                        <option value="bill">Bill</option>
                        <option value="subscription">Subscription</option>
                        <option value="loan">Loan</option>
                        <option value="rent">Rent</option>
                        <option value="insurance">Insurance</option>
                        <option value="utilities">Utilities</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Payment Method</label>
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
                        <select value={formData.payment_method === 'cash' ? 'cash' : formData.from_account_id ? `account_${formData.from_account_id}` : formData.from_credit_card_id ? `card_${formData.from_credit_card_id}` : 'cash'} onChange={handlePaymentMethodChange} className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                          <option value="cash">💵 Cash</option>
                          <optgroup label="Bank Accounts">
                            {accounts.map(account => <option key={account.id} value={`account_${account.id}`}>🏦 {account.account_name}</option>)}
                          </optgroup>
                          <optgroup label="Credit Cards">
                            {creditCards.map(card => <option key={card.id} value={`card_${card.id}`}>💳 {card.card_name} (••••{card.last_4_digits})</option>)}
                          </optgroup>
                        </select>
                        <div className="mt-1.5 flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => setShowAccountQuickAdd(true)}
                            className="flex-1 px-2 py-1 text-xs text-primary-600 hover:text-primary-800 border border-primary-300 rounded hover:bg-primary-50"
                          >
                            + Account
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowCardQuickAdd(true)}
                            className="flex-1 px-2 py-1 text-xs text-primary-600 hover:text-primary-800 border border-primary-300 rounded hover:bg-primary-50"
                          >
                            + Card
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Recurring Checkbox */}
                  <div className="border-t border-gray-300 pt-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" checked={formData.is_recurring} onChange={(e) => setFormData({...formData, is_recurring: e.target.checked})} className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                      <span className="text-xs font-medium text-gray-700">Recurring Expense</span>
                    </label>
                    {formData.is_recurring && (
                      <div className="mt-2 space-y-2 pl-4 border-l-2 border-primary-200">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Frequency</label>
                            <select value={formData.recurrence_frequency} onChange={(e) => setFormData({...formData, recurrence_frequency: e.target.value})} className="w-full text-xs rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                              <option value="daily">Daily</option>
                              <option value="weekly">Weekly</option>
                              <option value="biweekly">Biweekly</option>
                              <option value="monthly">Monthly</option>
                              <option value="quarterly">Quarterly</option>
                              <option value="annually">Annually</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Every</label>
                            <input type="number" min="1" value={formData.recurrence_interval} onChange={(e) => setFormData({...formData, recurrence_interval: e.target.value})} className="w-full text-xs rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">End Date (Optional)</label>
                          <input type="date" value={formData.recurrence_end_date} onChange={(e) => setFormData({...formData, recurrence_end_date: e.target.value})} className="w-full text-xs rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Notes (Optional)</label>
                    <textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} rows={2} className="w-full text-sm rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"></textarea>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Source Name</label>
                    <input required type="text" value={formData.source_name} onChange={(e) => setFormData({...formData, source_name: e.target.value})} className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <input required type="number" step="0.01" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                    <select value={formData.source_type} onChange={(e) => setFormData({...formData, source_type: e.target.value})} className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                      <option value="salary">Salary</option>
                      <option value="wages">Wages</option>
                      <option value="freelance">Freelance</option>
                      <option value="business">Business</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Deposit To Account (Optional)</label>
                    <select value={formData.to_account_id} onChange={(e) => setFormData({...formData, to_account_id: e.target.value})} className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500">
                      <option value="">Select account...</option>
                      {accounts.map(a => <option key={a.id} value={a.id}>{a.account_name}</option>)}
                    </select>
                  </div>
                </div>
              )}
              
              <div className="mt-4 flex justify-end space-x-2">
                <button type="button" onClick={() => {setShowAddForm(false); setAddFormType(null);}} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50">
                  {submitting ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {getEventsForDate(selectedDate).length === 0 ? (
              <p className="text-center text-gray-500 py-4">No events on this day</p>
            ) : (
              getEventsForDate(selectedDate).map((event, idx) => (
                <div
                  key={idx}
                  className="border-l-4 pl-4 py-2"
                  style={{ borderLeftColor: event.color }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{event.title}</h4>
                      <p className="text-sm text-gray-500 capitalize">{event.event_type.replace('_', ' ')}</p>
                      {event.contact_name && (
                        <p className="text-sm text-gray-600">{event.contact_name}</p>
                      )}
                    </div>
                    {event.amount && (
                      <span className={`text-lg font-semibold ${event.event_type === 'payment' ? 'text-red-600' : 'text-green-600'}`}>
                        {formatCurrency(event.amount)}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
