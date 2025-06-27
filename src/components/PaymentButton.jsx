import React, { useState, useEffect } from 'react';
import { CreditCard, Loader } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';

const PaymentButton = ({
  contractId,
  suggestedAmount,
  totalAmount,
  paymentType = 'ADVANCE',
  disabled = false,
  onPaymentSuccess,
  onPaymentError,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [debug, setDebug] = useState('');
  const [renderKey, setRenderKey] = useState(0);
  const [userAmount, setUserAmount] = useState(suggestedAmount || '');

  useEffect(() => {
    console.log('[PaymentButton] Mounted with props:', { contractId, suggestedAmount, totalAmount, paymentType });
    console.log('[PaymentButton] Razorpay available:', typeof window.Razorpay !== 'undefined');

    const token = localStorage.getItem('token');
    console.log('[PaymentButton] Token present:', !!token);

    if (!token) {
      setError('Authentication required. Please log in.');
      setDebug(' No token found');
      setRenderKey(prev => prev + 1);
    }

    if (typeof window.Razorpay === 'undefined') {
      setError('Razorpay SDK not loaded. Please refresh the page.');
      setDebug(' Razorpay script not loaded');
      setRenderKey(prev => prev + 1);
    } else {
      setDebug(' Razorpay loaded successfully');
    }

    if (!contractId) {
      setError('Contract ID is missing.');
      setDebug(' Missing contract ID');
      setRenderKey(prev => prev + 1);
    }

    // Validate userAmount if totalAmount and suggestedAmount are available
    if (totalAmount && userAmount && paymentType === 'ADVANCE') {
      if (userAmount < suggestedAmount) {
        setError(`Amount cannot be less than the minimum advance of ₹${suggestedAmount}`);
        setDebug(` Amount below minimum advance: ${userAmount} < ${suggestedAmount}`);
        setRenderKey(prev => prev + 1);
      } else if (userAmount > totalAmount) {
        setError(`Amount cannot exceed the total contract amount of ₹${totalAmount}`);
        setDebug(` Amount exceeds total: ${userAmount} > ${totalAmount}`);
        setRenderKey(prev => prev + 1);
      } else {
        setError('');
        setDebug(' Valid amount entered');
        setRenderKey(prev => prev + 1);
      }
    }
  }, [contractId, totalAmount, paymentType, userAmount, suggestedAmount]);

  const handleAmountChange = (e) => {
    const value = e.target.value;
    setUserAmount(value);

    if (!value || isNaN(value) || value <= 0) {
      setError('Please enter a valid amount.');
      setDebug(' Invalid amount entered');
      setRenderKey(prev => prev + 1);
      return;
    }

    if (totalAmount && paymentType === 'ADVANCE') {
      if (Number(value) < suggestedAmount) {
        setError(`Amount cannot be less than the minimum advance of ₹${suggestedAmount}`);
        setDebug(` Amount below minimum advance: ${value} < ${suggestedAmount}`);
        setRenderKey(prev => prev + 1);
      } else if (Number(value) > totalAmount) {
        setError(`Amount cannot exceed the total contract amount of ₹${totalAmount}`);
        setDebug(` Amount exceeds total: ${value} > ${totalAmount}`);
        setRenderKey(prev => prev + 1);
      } else {
        setError('');
        setDebug(' Valid amount entered');
        setRenderKey(prev => prev + 1);
      }
    } else if (paymentType === 'ADVANCE' && suggestedAmount && Number(value) < suggestedAmount) {
      setError(`Amount cannot be less than the minimum advance of ₹${suggestedAmount}`);
      setDebug(` Amount below minimum advance: ${value} < ${suggestedAmount}`);
      setRenderKey(prev => prev + 1);
    } else {
      setError('');
      setDebug(' Valid amount entered');
      setRenderKey(prev => prev + 1);
    }
  };

  const handlePaymentClick = async () => {
    console.log('[PaymentButton] Payment button clicked');
    console.log('[PaymentButton] State:', { isProcessing, disabled, userAmount, contractId, paymentType });

    setDebug('Initiating payment...');
    setRenderKey(prev => prev + 1);

    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication required. Please log in.');
      setDebug(' No token found');
      setRenderKey(prev => prev + 1);
      return;
    }

    if (!contractId) {
      setError('Contract ID is missing.');
      setDebug(' Missing contract ID');
      setRenderKey(prev => prev + 1);
      return;
    }

    if (!userAmount || isNaN(userAmount) || userAmount <= 0) {
      setError('Please enter a valid payment amount.');
      setDebug(' Invalid amount');
      setRenderKey(prev => prev + 1);
      return;
    }

    if (paymentType === 'ADVANCE' && suggestedAmount && userAmount < suggestedAmount) {
      setError(`Amount cannot be less than the minimum advance of ₹${suggestedAmount}`);
      setDebug(` Amount below minimum advance: ${userAmount} < ${suggestedAmount}`);
      setRenderKey(prev => prev + 1);
      return;
    }

    if (totalAmount && paymentType === 'ADVANCE' && userAmount > totalAmount) {
      setError(`Amount cannot exceed the total contract amount of ₹${totalAmount}`);
      setDebug(` Amount exceeds total: ${userAmount} > ${totalAmount}`);
      setRenderKey(prev => prev + 1);
      return;
    }

    if (typeof window.Razorpay === 'undefined') {
      setError('Razorpay SDK not loaded. Please refresh the page.');
      setDebug(' Razorpay not loaded');
      setRenderKey(prev => prev + 1);
      return;
    }

    setIsProcessing(true);
    setError('');
    setDebug('Processing payment...');
    setRenderKey(prev => prev + 1);

    try {
      console.log('[PaymentButton] Creating order with:', {
        contractId,
        amount: userAmount,
        paymentType,
      });
      setDebug('Creating payment order...');

      const response = await axiosInstance.post(
        '/api/payments/create-order',
        {
          contractId,
          amount: Number(userAmount),
          paymentType,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('[PaymentButton] Order response:', response.data);
      setDebug('Order created successfully');

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create payment order');
      }

      const { order, payment, key } = response.data;

      if (!order?.id || !key) {
        throw new Error('Invalid order data from server.');
      }

      const options = {
        key,
        amount: order.amount,
        currency: order.currency,
        name: 'LinkSphere',
        description: `${paymentType} Payment for Contract`,
        order_id: order.id,
        handler: async (response) => {
          try {
            console.log('[PaymentButton] Payment successful:', response);
            setDebug('Verifying payment...');

            const verifyResponse = await axiosInstance.post(
              '/api/payments/verify-payment',
              {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                paymentId: payment.id,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              }
            );

            console.log('[PaymentButton] Verification response:', verifyResponse.data);

            if (verifyResponse.data.success) {
              setIsProcessing(false);
              setDebug(' Payment verified successfully!');
              if (onPaymentSuccess) {
                onPaymentSuccess({
                  contractId,
                  paymentType,
                  amount: userAmount,
                  paymentId: payment.id,
                  razorpayPaymentId: response.razorpay_payment_id,
                });
              }
              window.dispatchEvent(
                new CustomEvent('paymentSuccess', {
                  detail: { contractId, paymentType, amount: userAmount, paymentId: payment.id },
                })
              );
            } else {
              throw new Error(verifyResponse.data.message || 'Payment verification failed');
            }
          } catch (verifyError) {
            console.error('[PaymentButton] Verification error:', verifyError);
            setError(verifyError.response?.data?.message || 'Payment verification failed');
            setIsProcessing(false);
            setDebug(` Verification error: ${verifyError.message}`);
            setRenderKey(prev => prev + 1);
            if (onPaymentError) {
              onPaymentError(verifyError);
            }
          }
        },
        prefill: {
          name: 'User',
          email: 'user@example.com',
          contact: '9999999999',
        },
        notes: {
          contract_id: contractId,
          payment_type: paymentType,
        },
        theme: {
          color: '#2563eb',
        },
        modal: {
          ondismiss: () => {
            console.log('[PaymentButton] Payment modal dismissed');
            setIsProcessing(false);
            setError('Payment cancelled by user');
            setDebug('Payment cancelled');
            setRenderKey(prev => prev + 1);
          },
        },
      };

      console.log('[PaymentButton] Opening Razorpay with options:', options);
      setDebug('Opening Razorpay checkout...');

      const razorpay = new window.Razorpay(options);
      razorpay.on('payment.failed', (response) => {
        console.error('[PaymentButton] Payment failed:', response.error);
        setError(`Payment failed: ${response.error.description}`);
        setIsProcessing(false);
        setDebug(` Payment failed: ${response.error.description}`);
        setRenderKey(prev => prev + 1);
        if (onPaymentError) {
          onPaymentError(response.error);
        }
      });
      razorpay.open();
    } catch (error) {
      console.error('[PaymentButton] Payment error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      setError(error.response?.data?.message || error.message || 'Payment failed. Please try again.');
      setIsProcessing(false);
      setDebug(` Error: ${error.message}`);
      setRenderKey(prev => prev + 1);
      if (onPaymentError) {
        onPaymentError(error);
      }
    }
  };

  const displayAmount = userAmount && !isNaN(userAmount) && userAmount > 0 ? userAmount : 'Enter Amount';

  return (
    <div className="payment-button-container" style={{ pointerEvents: 'auto', zIndex: 10 }}>
      <div key={renderKey} className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
        <p className="text-sm text-blue-800">
          <strong>Debug:</strong> {debug}
        </p>
        <p className="text-xs text-blue-600 mt-1">
          Suggested Amount: {suggestedAmount ? `₹${suggestedAmount}` : 'N/A'} | Total: {totalAmount ? `₹${totalAmount}` : 'N/A'} | Contract: {contractId} | Type: {paymentType}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="mb-3">
        <label htmlFor="paymentAmount" className="block text-sm font-medium text-gray-700 mb-1">
          {paymentType} Payment Amount (₹)
        </label>
        <input
          type="number"
          id="paymentAmount"
          value={userAmount}
          onChange={handleAmountChange}
          placeholder={suggestedAmount ? `Enter ₹${suggestedAmount} or up to ₹${totalAmount}` : 'Enter amount'}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          min={suggestedAmount || 1} // Set minimum input value
          max={totalAmount} // Set maximum input value
          disabled={isProcessing || disabled}
        />
        {paymentType === 'ADVANCE' && suggestedAmount && (
          <p className="text-xs text-gray-500 mt-1">
            Minimum advance: ₹{suggestedAmount} | Maximum: ₹{totalAmount}
          </p>
        )}
      </div>

      <button
        onClick={handlePaymentClick}
        disabled={disabled || !userAmount || isNaN(userAmount) || userAmount <= 0 || isProcessing}
        className={`flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 disabled:opacity-50 ${
          disabled || !userAmount || isNaN(userAmount) || userAmount <= 0 || isProcessing ? 'cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        {isProcessing ? (
          <Loader className="w-5 h-5 mr-2 animate-spin" />
        ) : (
          <CreditCard className="w-5 h-5 mr-2" />
        )}
        {isProcessing
          ? 'Processing...'
          : typeof displayAmount === 'number'
            ? `Pay ₹${displayAmount} (${paymentType})`
            : `Make ${paymentType} Payment`}
      </button>

      <div className="flex items-center justify-center mt-2">
        <div className="flex items-center text-xs text-gray-500">
          <div className="w-2 h-2 rounded-full mr-2 bg-green-400"></div>
          Secure Razorpay Payment
        </div>
      </div>
    </div>
  );
};

export default PaymentButton;