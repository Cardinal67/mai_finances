import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { calendarAPI } from '../utils/api';
import { formatCurrency } from '../utils/formatters';

const Calendar = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [showAddMenu, setShowAddMenu] = useState(false);

  useEffect(() => {
    loadEvents();
  }, [currentDate]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      const response = await calendarAPI.getEvents({
        start_date: firstDay.toISOString().split('T')[0],
        end_date: lastDay.toISOString().split('T')[0],
      });
      setEvents(response.data.data.events);
    } catch (error) {
      console.error('Failed to load events:', error);
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
    setShowAddMenu(true);
  };

  const handleAddAction = (type) => {
    const formattedDate = selectedDate.toISOString().split('T')[0];
    setShowAddMenu(false);
    
    // Navigate to the appropriate page with pre-filled date
    switch(type) {
      case 'payment':
        navigate('/payments', { state: { due_date: formattedDate } });
        break;
      case 'income':
        navigate('/income', { state: { next_expected_date: formattedDate } });
        break;
      default:
        break;
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
            <button
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
            >
              + Add Event
            </button>
          </div>

          {showAddMenu && (
            <div className="mb-4 flex space-x-2">
              <button
                onClick={() => handleAddAction('payment')}
                className="flex-1 px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded-md hover:bg-red-100"
              >
                💰 Add Payment
              </button>
              <button
                onClick={() => handleAddAction('income')}
                className="flex-1 px-4 py-2 bg-green-50 border border-green-200 text-green-700 rounded-md hover:bg-green-100"
              >
                💵 Add Income
              </button>
            </div>
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
