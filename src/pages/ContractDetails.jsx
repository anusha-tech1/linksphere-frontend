import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import PaymentButton from '../components/PaymentButton';
import PaymentHistory from '../components/PaymentHistory';

const ContractDetails = () => {
  const { id } = useParams();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState(null); // 'client' or 'freelancer'

  const fetchContractDetails = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/contracts/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      console.log('Fetched contract:', data); // Debug log
      setContract(data);
      
      // Determine if current user is client or freelancer
      const currentUserId = currentUserId(); // Replace with your auth method
      
      if (data.clientId.toString() === currentUserId) {
        setUserRole('client');
      } else if (data.freelancerId.toString() === currentUserId) {
        setUserRole('freelancer');
      }
    } catch (error) {
      console.error('Error fetching contract:', error);
      setError(error.response?.data?.message || 'Failed to load contract details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchContractDetails();
    }
  }, [id]);

  // Helper function to determine payment status and options
  const renderPaymentOptions = () => {
    if (!contract || userRole !== 'client') return null;
    
    const { paymentStatus } = contract;
    const suggestedAmount = contract?.payment?.amount && !isNaN(contract.payment.amount) && contract.payment.amount > 0 
      ? Math.floor(contract.payment.amount * 0.5) 
      : null;

    if (!paymentStatus || paymentStatus === 'NOT_PAID') {
      return (
        <div className="payment-section">
          <h3>Payment Required</h3>
          <p>Please make the advance payment to start the project.</p>
          <PaymentButton 
            contractId={contract._id}
            suggestedAmount={suggestedAmount}
            totalAmount={contract.payment.amount}
            paymentType="ADVANCE"
            onPaymentSuccess={async ({ contractId, paymentType, amount, paymentId }) => {
              try {
                console.log('Payment success callback:', { contractId, paymentType, amount, paymentId }); // Debug log
                const response = await axios.patch(`/api/contracts/${contractId}`, {
                  paymentStatus: 'ADVANCE_PAID',
                  clientSigned: true,
                  advanceAmount: amount,
                  'payment.advancePaid': true,
                }, {
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                  },
                });
                console.log('Contract update response:', response.data); // Debug log
                // Refetch contract to ensure UI reflects backend state
                await fetchContractDetails();
              } catch (error) {
                console.error('Error updating contract after payment:', error);
                setError(error.response?.data?.message || 'Failed to update contract status after payment');
                // Refetch contract to reflect any partial updates
                await fetchContractDetails();
              }
            }}
            onPaymentError={(error) => {
              console.error('Payment error:', error);
              setError(error.message || 'Payment failed. Please try again.');
            }}
          />
        </div>
      );
    } else if (paymentStatus === 'ADVANCE_PAID') {
      return (
        <div className="payment-section">
          <div className="payment-complete-message bg-green-50 border border-green-200 p-3 rounded mb-3">
            <h3 className="text-lg font-medium text-green-700">Advance Payment Done</h3>
            <p className="text-green-700">The advance payment for this contract has been successfully completed.</p>
          </div>
          <PaymentHistory contractId={contract._id} />
          
          {contract.status === 'active' && (
            <div className="final-payment">
              <h3>Final Payment</h3>
              <p>Make the final payment when the work is completed to your satisfaction.</p>
              <PaymentButton 
                contractId={contract._id}
                suggestedAmount={contract.finalAmount || (contract.payment.amount - (contract.advanceAmount || suggestedAmount))}
                totalAmount={contract.payment.amount}
                paymentType="FINAL"
                onPaymentSuccess={async ({ contractId, paymentType, amount, paymentId }) => {
                  try {
                    console.log('Payment success callback:', { contractId, paymentType, amount, paymentId }); // Debug log
                    const response = await axios.patch(`/api/contracts/${contractId}`, {
                      paymentStatus: 'FULLY_PAID',
                      clientSigned: true,
                      finalAmount: amount,
                      'payment.fullyPaid': true,
                    }, {
                      headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                      },
                    });
                    console.log('Contract update response:', response.data); // Debug log
                    // Refetch contract to ensure UI reflects backend state
                    await fetchContractDetails();
                  } catch (error) {
                    console.error('Error updating contract after final payment:', error);
                    setError(error.response?.data?.message || 'Failed to update contract status after payment');
                    // Refetch contract to reflect any partial updates
                    await fetchContractDetails();
                  }
                }}
                onPaymentError={(error) => {
                  console.error('Payment error:', error);
                  setError(error.message || 'Payment failed. Please try again.');
                }}
              />
            </div>
          )}
        </div>
      );
    } else if (paymentStatus === 'FULLY_PAID') {
      return (
        <div className="payment-section">
          <div className="payment-complete-message bg-green-50 border border-green-200 p-3 rounded mb-3">
            <h3 className="text-lg font-medium text-green-700">Payment Complete</h3>
            <p className="text-green-700">You have completed all payments for this contract.</p>
          </div>
          <PaymentHistory contractId={contract._id} />
        </div>
      );
    }
  };

  // For freelancers, show payment status only
  const renderFreelancerView = () => {
    if (!contract || userRole !== 'freelancer') return null;
    
    return (
      <div className="payment-status-section">
        <h3>Payment Status</h3>
        <PaymentHistory contractId={contract._id} />
      </div>
    );
  };

  if (loading) return <p>Loading contract details...</p>;
  if (error) return <p className="error-message">{error}</p>;
  if (!contract) return <p>Contract not found</p>;

  return (
    <div className="contract-details-page">
      <h2>Contract: {contract.projectDetails.title}</h2>
      
      {/* Contract Details */}
      <div className="contract-info">
        <p><strong>Status:</strong> {contract.status}</p>
        <p><strong>Client Signature:</strong> {contract.clientSigned ? 'Signed' : 'Not Signed'}</p>
        <p><strong>Freelancer Signature:</strong> {contract.freelancerSigned ? 'Signed' : 'Not Signed'}</p>
        <p><strong>Payment Status:</strong> {contract.paymentStatus || 'NOT_PAID'}</p>
        <p><strong>Total Amount:</strong> ₹{contract.payment.amount}</p>
        <p><strong>Start Date:</strong> {new Date(contract.projectDetails.startDate).toLocaleDateString()}</p>
        <p><strong>End Date:</strong> {new Date(contract.projectDetails.endDate).toLocaleDateString()}</p>
        <p><strong>Description:</strong> {contract.projectDetails.description}</p>
      </div>
      
      {/* Payment Options */}
      {userRole === 'client' ? renderPaymentOptions() : renderFreelancerView()}
      
      {/* Additional contract details and actions... */}
    </div>
  );
};

export default ContractDetails;