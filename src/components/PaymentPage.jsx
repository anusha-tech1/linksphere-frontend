// PaymentPage.jsx
import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, Smartphone, Phone, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

const PaymentPage = () => {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { amount, paymentType = "ADVANCE" } = location.state || {};

  const [formData, setFormData] = useState({ method: '', details: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  const advanceAmount = paymentType === "ADVANCE" ? 
    (amount && !isNaN(amount) ? Math.floor(amount / 2) : 0) : 
    (amount && !isNaN(amount) ? amount : 0);

  const handlePaymentSuccess = () => {
    navigate(-1);
    window.dispatchEvent(new CustomEvent('paymentSuccess', { 
      detail: { contractId, paymentType, amount: advanceAmount } 
    }));
  };

  const handleDummyPayment = (e) => {
    e.preventDefault();
    if (!formData.method || !formData.details) {
      setError('Please select a payment method and enter details.');
      return;
    }

    setIsProcessing(true);
    setError('');

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setShowSuccess(true);
      setTimeout(handlePaymentSuccess, 3000);
    }, 2000);
  };

  const goBack = () => {
    navigate(-1);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
              <p className="text-gray-600 mb-4">
                Your payment of ₹{advanceAmount} has been processed successfully.
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-800">
                  <strong>Transaction Details:</strong><br />
                  Contract ID: {contractId}<br />
                  Payment Type: {paymentType}<br />
                  Amount: ₹{advanceAmount}
                </p>
              </div>
              <p className="text-sm text-gray-500">Redirecting you back...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <button
            onClick={goBack}
            className="mb-4 flex items-center text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5 mr-2" /> Back
          </button>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Dummy Payment</h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleDummyPayment}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">Payment Method</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="method"
                    value="card"
                    checked={formData.method === 'card'}
                    onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                    className="mr-2"
                  />
                  <CreditCard className="w-5 h-5 mr-1" /> Card
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="method"
                    value="upi"
                    checked={formData.method === 'upi'}
                    onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                    className="mr-2"
                  />
                  <Smartphone className="w-5 h-5 mr-1" /> UPI
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="method"
                    value="phone"
                    checked={formData.method === 'phone'}
                    onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                    className="mr-2"
                  />
                  <Phone className="w-5 h-5 mr-1" /> Phone
                </label>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 mb-2">Payment Details</label>
              <input
                type="text"
                value={formData.details}
                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                placeholder={formData.method === 'card' ? 'Card Number' : formData.method === 'upi' ? 'UPI ID' : 'Phone Number'}
                className="w-full border rounded-lg p-2"
              />
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              {isProcessing ? 'Processing...' : `Pay ₹${advanceAmount}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;