// Currency formatter
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

// Date formatter
export const formatDate = (date, format = 'short') => {
  const d = new Date(date);
  
  if (format === 'short') {
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
  
  if (format === 'long') {
    return d.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }
  
  if (format === 'datetime') {
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }
  
  return d.toLocaleDateString();
};

// Relative time formatter (e.g., "2 days ago", "in 3 days")
export const formatRelativeTime = (date) => {
  const now = new Date();
  const target = new Date(date);
  const diffInMs = target - now;
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Tomorrow';
  if (diffInDays === -1) return 'Yesterday';
  if (diffInDays > 0) return `in ${diffInDays} days`;
  return `${Math.abs(diffInDays)} days ago`;
};

// Status badge color
export const getStatusColor = (status) => {
  const colors = {
    paid_in_full: 'green',
    unpaid: 'yellow',
    partially_paid: 'blue',
    overdue: 'red',
    missed: 'red',
    scheduled: 'gray',
    completed: 'green',
    planned: 'purple',
    active: 'green',
    inactive: 'gray',
  };
  return colors[status] || 'gray';
};

// Payment type color
export const getPaymentTypeColor = (type) => {
  return type === 'owed_by_me' ? 'red' : 'green';
};

