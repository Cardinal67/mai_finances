import { useState, useEffect } from 'react';
import { dashboardAPI } from '../utils/api';
import { formatCurrency, formatRelativeTime, getStatusColor } from '../utils/formatters';
import BalanceDisplay from '../components/BalanceDisplay';
import SafeToSpendDisplay from '../components/SafeToSpendDisplay';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(30);
  const [whatIfAmount, setWhatIfAmount] = useState('');
  const [whatIfResult, setWhatIfResult] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, [dateRange]);

  const loadDashboard = async () => {
    try {
      const response = await dashboardAPI.getSummary({ days_ahead: dateRange });
      setData(response.data.data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateWhatIf = async () => {
    if (!whatIfAmount) return;
    try {
      const response = await dashboardAPI.calculateWhatIf({
        planned_amount: parseFloat(whatIfAmount),
        days_ahead: dateRange,
      });
      setWhatIfResult(response.data.data);
    } catch (error) {
      console.error('Failed to calculate what-if:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const { summary, upcoming_bills, upcoming_income, alerts, accounts } = data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">
            Date Range:
          </label>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(Number(e.target.value))}
            className="rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
            <option value={60}>60 days</option>
            <option value={90}>90 days</option>
          </select>
        </div>
      </div>

      {/* Alerts */}
      {alerts && alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className={`rounded-lg p-4 ${
                alert.type === 'error' ? 'bg-red-50 border border-red-200' :
                alert.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                'bg-blue-50 border border-blue-200'
              }`}
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-2xl">
                    {alert.type === 'error' ? '⚠️' : alert.type === 'warning' ? '⚡' : 'ℹ️'}
                  </span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-gray-900">{alert.title}</h3>
                  <p className="mt-1 text-sm text-gray-700">{alert.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Safe to Spend - PRIORITY #1 */}
        <div className="bg-white overflow-hidden shadow-lg rounded-lg border-2 border-primary-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-3xl">✅</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Safe to Spend
                  </dt>
                  <dd className={`text-xl font-bold ${summary.safe_to_spend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(summary.safe_to_spend)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Available Balance */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-3xl">💰</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Available Balance
                  </dt>
                  <dd className="font-semibold text-gray-900">
                    <BalanceDisplay amount={summary.total_available} size="lg" />
                  </dd>
                  <dd className="mt-2">
                    <SafeToSpendDisplay amount={summary.safe_to_spend} size="sm" />
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Bills */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-3xl">📤</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Upcoming Bills
                  </dt>
                  <dd className="text-lg font-semibold text-red-600">
                    {formatCurrency(summary.total_upcoming_bills)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        {/* Expected Income */}
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-3xl">📥</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Expected Income
                  </dt>
                  <dd className="text-lg font-semibold text-green-600">
                    {formatCurrency(summary.total_expected_income)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* What-If Calculator */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">🎯 What-If Spending Calculator</h2>
        <div className="flex items-end space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700">
              If I spend this amount...
            </label>
            <input
              type="number"
              value={whatIfAmount}
              onChange={(e) => setWhatIfAmount(e.target.value)}
              placeholder="Enter amount"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            />
          </div>
          <button
            onClick={calculateWhatIf}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
          >
            Calculate
          </button>
        </div>
        {whatIfResult && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Current Safe-to-Spend</p>
                <p className="text-lg font-semibold">{formatCurrency(whatIfResult.current_state.safe_to_spend_now)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">After Spending</p>
                <p className={`text-lg font-semibold ${whatIfResult.after_spending.can_afford ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(whatIfResult.after_spending.safe_to_spend)}
                </p>
              </div>
            </div>
            <p className={`mt-3 text-sm ${whatIfResult.after_spending.can_afford ? 'text-green-700' : 'text-red-700'}`}>
              {whatIfResult.recommendation}
            </p>
          </div>
        )}
      </div>

      {/* Upcoming Bills & Income */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upcoming Bills */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">📤 Upcoming Bills</h2>
          {upcoming_bills.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No upcoming bills</p>
          ) : (
            <div className="space-y-3">
              {upcoming_bills.slice(0, 5).map((bill) => (
                <div key={bill.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{bill.description}</p>
                    <p className="text-sm text-gray-500">{bill.contact_name}</p>
                    <p className="text-xs text-gray-400">{formatRelativeTime(bill.current_due_date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-red-600">{formatCurrency(bill.current_balance)}</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-${getStatusColor(bill.status)}-100 text-${getStatusColor(bill.status)}-800`}>
                      {bill.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Income */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">📥 Upcoming Income</h2>
          {upcoming_income.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No upcoming income</p>
          ) : (
            <div className="space-y-3">
              {upcoming_income.slice(0, 5).map((income) => (
                <div key={income.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{income.source_name}</p>
                    <p className="text-sm text-gray-500">{income.source_type}</p>
                    <p className="text-xs text-gray-400">{formatRelativeTime(income.next_expected_date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">{formatCurrency(income.amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Accounts Summary */}
      {accounts && accounts.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">🏦 Accounts</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {accounts.map((account) => (
              <div key={account.id} className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-900">{account.account_name}</p>
                <p className="text-sm text-gray-500 capitalize">{account.account_type}</p>
                <div className="mt-2 text-gray-900 font-semibold">
                  <BalanceDisplay amount={account.current_balance} size="lg" />
                </div>
                <p className="text-xs text-gray-500">
                  Available: <BalanceDisplay amount={account.available_balance} size="sm" className="text-gray-500" />
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
