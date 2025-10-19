// Dashboard Page
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchDashboard();
  }, [user]);

  const fetchDashboard = async () => {
    try {
      const response = await axios.get(`${API_URL}/dashboard/summary`);
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">Finance Manager</h1>
          <div className="flex gap-4">
            <button onClick={() => navigate('/payments')} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">Payments</button>
            <button onClick={() => navigate('/income')} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">Income</button>
            <button onClick={logout} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome, {user?.username}!</h2>
          <p className="text-gray-600">Your financial overview</p>
        </div>

        {/* Safe to Spend */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white mb-8">
          <h3 className="text-lg font-semibold mb-2">Safe to Spend</h3>
          <div className="text-4xl font-bold">${data?.safeToSpend?.toFixed(2) || '0.00'}</div>
          <p className="text-blue-100 mt-2">Reserved for bills: ${data?.reservedForBills?.toFixed(2) || '0.00'}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Upcoming Bills */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Upcoming Bills</h3>
            {data?.upcomingBills?.length > 0 ? (
              <div className="space-y-3">
                {data.upcomingBills.slice(0, 5).map(bill => (
                  <div key={bill.id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <div className="font-medium">{bill.description}</div>
                      <div className="text-sm text-gray-500">{new Date(bill.current_due_date).toLocaleDateString()}</div>
                    </div>
                    <div className="font-semibold">${parseFloat(bill.original_amount).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No upcoming bills</p>
            )}
          </div>

          {/* Upcoming Income */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-4">Upcoming Income</h3>
            {data?.upcomingIncome?.length > 0 ? (
              <div className="space-y-3">
                {data.upcomingIncome.slice(0, 5).map(income => (
                  <div key={income.id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <div className="font-medium">{income.source_name}</div>
                      <div className="text-sm text-gray-500">{income.next_expected_date ? new Date(income.next_expected_date).toLocaleDateString() : 'N/A'}</div>
                    </div>
                    <div className="font-semibold text-green-600">+${parseFloat(income.amount).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No upcoming income</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

