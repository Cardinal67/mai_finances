import { useState, useEffect } from 'react';
import { calendarAPI } from '../utils/api';
import { formatDate, formatCurrency } from '../utils/formatters';

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    // Set default dates (current month)
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    setStartDate(firstDay.toISOString().split('T')[0]);
    setEndDate(lastDay.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      loadEvents();
    }
  }, [startDate, endDate]);

  const loadEvents = async () => {
    try {
      const response = await calendarAPI.getEvents({
        start_date: startDate,
        end_date: endDate,
      });
      setEvents(response.data.data.events);
    } catch (error) {
      console.error('Failed to load events:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupEventsByDate = () => {
    const grouped = {};
    events.forEach(event => {
      const date = event.date.split('T')[0];
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(event);
    });
    return grouped;
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'payment': return '💰';
      case 'income': return '💵';
      case 'reminder': return '🔔';
      case 'spending_plan': return '🎯';
      default: return '📌';
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  }

  const groupedEvents = groupEventsByDate();
  const sortedDates = Object.keys(groupedEvents).sort();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">📅 Calendar</h1>
        <div className="flex items-center space-x-4">
          <div>
            <label className="text-sm font-medium text-gray-700">From:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="ml-2 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">To:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="ml-2 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Events Timeline */}
      <div className="bg-white shadow rounded-lg p-6">
        {sortedDates.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No events in this date range</p>
        ) : (
          <div className="space-y-6">
            {sortedDates.map(date => (
              <div key={date} className="border-l-4 border-primary-500 pl-4">
                <div className="text-lg font-semibold text-gray-900 mb-3">
                  {formatDate(date, 'long')}
                </div>
                <div className="space-y-2">
                  {groupedEvents[date].map((event, idx) => (
                    <div
                      key={idx}
                      className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                      style={{ borderLeft: `4px solid ${event.color}` }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <span className="text-2xl">{getEventIcon(event.event_type)}</span>
                          <div>
                            <h4 className="font-medium text-gray-900">{event.title}</h4>
                            <p className="text-sm text-gray-500 capitalize">{event.event_type.replace('_', ' ')}</p>
                            {event.contact_name && (
                              <p className="text-sm text-gray-600 mt-1">{event.contact_name}</p>
                            )}
                          </div>
                        </div>
                        {event.amount && (
                          <span className={`text-lg font-semibold ${event.event_type === 'payment' ? 'text-red-600' : 'text-green-600'}`}>
                            {formatCurrency(event.amount)}
                          </span>
                        )}
                      </div>
                      {event.status && (
                        <div className="mt-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {event.status.replace('_', ' ')}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Calendar;

