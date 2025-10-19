// Payments Page
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

export default function Payments() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchPayments();
  }, [user]);

  const fetchPayments = async () => {
    try {
      const response = await axios.get(`${API_URL}/payments`);
      setPayments(response.data.payments || []);
    } catch (error) {
      console.error('Failed to fetch payments', error);
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
        <h2 className="text-3xl font-bold mb-6">Payments</h2>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {payments.map(payment => (
                <tr key={payment.id}>
                  <td className="px-6 py-4">{payment.description}</td>
                  <td className="px-6 py-4">${parseFloat(payment.original_amount).toFixed(2)}</td>
                  <td className="px-6 py-4">{new Date(payment.current_due_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-sm ${
                      payment.status === 'paid' ? 'bg-green-100 text-green-800' :
                      payment.status === 'missed' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {payments.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No payments found. Start by adding your first bill!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

