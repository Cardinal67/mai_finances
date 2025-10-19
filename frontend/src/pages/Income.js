// Income Page (NEW FEATURE)
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function Income() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [incomeStreams, setIncomeStreams] = useState([]);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchIncome();
  }, [user]);

  const fetchIncome = async () => {
    try {
      const response = await axios.get(`${API_URL}/income`);
      setIncomeStreams(response.data.incomeStreams || []);
    } catch (error) {
      console.error('Failed to fetch income', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between">
          <h1 className="text-2xl font-bold text-blue-600" onClick={() => navigate('/dashboard')} style={{cursor: 'pointer'}}>Finance Manager</h1>
          <button onClick={() => navigate('/dashboard')} className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">Back to Dashboard</button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-6">Income Streams</h2>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Expected</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {incomeStreams.map(income => (
                <tr key={income.id}>
                  <td className="px-6 py-4 font-medium">{income.source_name}</td>
                  <td className="px-6 py-4">{income.source_type}</td>
                  <td className="px-6 py-4 text-green-600 font-semibold">${parseFloat(income.amount).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    {income.next_expected_date ? new Date(income.next_expected_date).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {incomeStreams.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No income streams found. Start by adding your income sources!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

