import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, AlertCircle, CreditCard } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';

const PaymentHistory = ({ contractId }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPayments();
    
    // Listen for payment success events to refresh the payment history
    const handlePaymentSuccess = () => {
      fetchPayments();
    };
    
    window.addEventListener('paymentSuccess', handlePaymentSuccess);
    
    return () => {
      window.removeEventListener('paymentSuccess', handlePaymentSuccess);
    };
  }, [contractId]);

  const fetchPayments = async () => {
    if (!contractId) return;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      const response = await axiosInstance.get(`/api/payments/contract/${contractId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setPayments(response.data.payments || []);
        setError('');
      } else {
        setError(response.data.message || 'Failed to fetch payment history');
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      setError(error.response?.data?.message || 'Failed to fetch payment history');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'CAPTURED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'CREATED':
      case 'AUTHORIZED':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'FAILED':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <CreditCard className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'CAPTURED':
        return 'Completed';
      case 'CREATED':
        return 'Created';
      case 'AUTHORIZED':
        return 'Authorized';
      case 'FAILED':
        return 'Failed';
      case 'REFUNDED':
        return 'Refunded';
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'CAPTURED':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'CREATED':
      case 'AUTHORIZED':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'FAILED':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'REFUNDED':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="payment-history">
        <h3 className="text-lg font-medium mb-3">Payment History</h3>
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading payment history...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="payment-history">
        <h3 className="text-lg font-medium mb-3">Payment History</h3>
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-history">
      <h3 className="text-lg font-medium mb-3">Payment History</h3>
      
      {payments.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 text-center">No payments found for this contract.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {payments.map((payment) => (
            <div key={payment.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(payment.status)}
                  <span className="font-medium">₹{payment.amount}</span>
                  <span className="text-sm text-gray-600">({payment.paymentType})</span>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(payment.status)}`}>
                  {getStatusText(payment.status)}
                </span>
              </div>
              
              <div className="text-sm text-gray-600">
                <p>Payment Type: {payment.paymentType}</p>
                <p>Date: {new Date(payment.createdAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PaymentHistory;