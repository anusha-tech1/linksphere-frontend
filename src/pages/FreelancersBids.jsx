import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import PaymentButton from '../components/PaymentButton';
import PaymentHistory from '../components/PaymentHistory';

const FreelancersBids = () => {
  const [bids, setBids] = useState([]);
  const [contracts, setContracts] = useState({});
  const [error, setError] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [currentContractId, setCurrentContractId] = useState(null);
  const [updateStatus, setUpdateStatus] = useState("");
  const [expandedPaymentSection, setExpandedPaymentSection] = useState(null);
  const [pendingPayments, setPendingPayments] = useState({});

  const navigate = useNavigate();
  const location = useLocation();

  const fetchBidsAndContracts = async (retryCount = 0, maxRetries = 3) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("userId");
      setCurrentUserId(userId);
  
      if (!token) {
        setError("User not logged in.");
        setLoading(false);
        return;
      }
  
      const bidsRes = await axios.get("https://linksphere-backend-jkws.onrender.com/api/bids/freelancers-bids", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('[FreelancersBids] Bids fetched:', {
        count: bidsRes.data.length,
        bids: bidsRes.data.map(b => ({
          bidId: b._id,
          contractId: b.contractId?._id,
          contractPaymentStatus: b.contractId?.paymentStatus,
        })),
      });
      setBids(bidsRes.data || []);
  
      const contractsData = {};
      for (const bid of bidsRes.data) {
        if (bid.contractId) {
          try {
            const contractId = bid.contractId?._id || bid.contractId;
            const contractRes = await axios.get(
              `https://linksphere-backend-jkws.onrender.com/api/contracts/${contractId}`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log('[FreelancersBids] Contract fetched:', {
              contractId: contractRes.data._id,
              paymentStatus: contractRes.data.paymentStatus,
              payment: contractRes.data.payment,
              advanceAmount: contractRes.data.advanceAmount,
              totalAmount: contractRes.data.payment?.amount,
            });
            contractsData[bid._id] = contractRes.data;
          } catch (err) {
            console.error(`[FreelancersBids] Error fetching contract for bid ${bid._id}:`, err.response?.data || err);
          }
        }
      }
  
      console.log('[FreelancersBids] Contracts fetched:', {
        count: Object.keys(contractsData).length,
        contractIds: Object.values(contractsData).map(c => c._id),
      });
      setContracts(contractsData);
      
      // Verify paymentStatus for pending payments
      Object.keys(pendingPayments).forEach(contractId => {
        const contract = Object.values(contractsData).find(c => c._id === contractId);
        if (contract && contract.paymentStatus === pendingPayments[contractId]) {
          console.log('[FreelancersBids] Clearing pending payment for contract:', {
            contractId,
            paymentStatus: contract.paymentStatus,
          });
          setPendingPayments(prev => {
            const newPending = { ...prev };
            delete newPending[contractId];
            return newPending;
          });
        } else if (!contract || contract.paymentStatus !== pendingPayments[contractId]) {
          if (retryCount < maxRetries) {
            console.log(`[FreelancersBids] Contract ${contractId} not updated, retrying (${retryCount + 1}/${maxRetries})`);
            setTimeout(() => fetchBidsAndContracts(retryCount + 1, maxRetries), 1000);
          } else {
            console.warn(`[FreelancersBids] Max retries reached for contract ${contractId}, keeping pending payment`);
          }
        }
      });
      
      setLoading(false);
    } catch (err) {
      console.error("[FreelancersBids] Error fetching data:", err);
      setError("Failed to load bids and contracts.");
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchBidsAndContracts();
  }, [refreshTrigger]);

  useEffect(() => {
    fetchBidsAndContracts();
  }, [location.pathname]);

  useEffect(() => {
    const handlePaymentSuccess = (event) => {
      const { contractId, paymentType, amount } = event.detail;
      console.log('[FreelancersBids] Payment successful:', { contractId, paymentType, amount });
      
      if (paymentType === 'ADVANCE') {
        setPendingPayments(prev => ({
          ...prev,
          [contractId]: 'ADVANCE_PAID',
        }));
        setContracts(prev => {
          const updatedContracts = { ...prev };
          Object.keys(updatedContracts).forEach(bidId => {
            if (updatedContracts[bidId]._id === contractId) {
              updatedContracts[bidId] = {
                ...updatedContracts[bidId],
                paymentStatus: 'ADVANCE_PAID',
                advanceAmount: amount,
                payment: {
                  ...updatedContracts[bidId].payment,
                  advancePaid: true,
                },
              };
            }
          });
          console.log('[FreelancersBids] Updated contracts locally:', {
            contractId,
            updated: Object.values(updatedContracts).find(c => c._id === contractId)?.paymentStatus,
          });
          return updatedContracts;
        });
      } else if (paymentType === 'FINAL') {
        setPendingPayments(prev => ({
          ...prev,
          [contractId]: 'FULLY_PAID',
        }));
        setContracts(prev => {
          const updatedContracts = { ...prev };
          Object.keys(updatedContracts).forEach(bidId => {
            if (updatedContracts[bidId]._id === contractId) {
              updatedContracts[bidId] = {
                ...updatedContracts[bidId],
                paymentStatus: 'FULLY_PAID',
                finalAmount: amount,
                payment: {
                  ...updatedContracts[bidId].payment,
                  fullyPaid: true,
                },
              };
            }
          });
          console.log('[FreelancersBids] Updated contracts locally:', {
            contractId,
            updated: Object.values(updatedContracts).find(c => c._id === contractId)?.paymentStatus,
          });
          return updatedContracts;
        });
      }
      
      setRefreshTrigger(prev => prev + 1);
    };

    window.addEventListener('paymentSuccess', handlePaymentSuccess);
    return () => {
      window.removeEventListener('paymentSuccess', handlePaymentSuccess);
    };
  }, []);

  const updateBidStatus = async (bidId, status) => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `https://linksphere-backend-jkws.onrender.com/api/bids/${bidId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error("[FreelancersBids] Failed to update bid status:", err.response?.data || err);
    }
  };

  const viewContract = (contractId) => {
    navigate(`/view-contract/${contractId}`);
  };

  const editContract = (contractId) => {
    navigate(`/edit-contract/${contractId}`);
  };

  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleAcceptContract = async () => {
    try {
      setUpdateStatus("Finalizing contract...");
      const token = localStorage.getItem("token");
      const contractId = ensureStringId(currentContractId);
  
      await axios.post(
        `https://linksphere-backend-jkws.onrender.com/api/contracts/${contractId}/finalize`,
        { status: "active" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      setUpdateStatus("Contract finalized successfully!");
      setTimeout(() => {
        setShowAcceptModal(false);
        setUpdateStatus("");
        fetchBidsAndContracts();
      }, 1000);
    } catch (err) {
      console.error("[FreelancersBids] Error finalizing contract:", err);
      setUpdateStatus("Failed to finalize contract.");
    }
  };
  
  const openAcceptModal = (contractId) => {
    setCurrentContractId(contractId);
    setShowAcceptModal(true);
  };

  const canEditContract = (contract) => {
    return contract && contract.status === "draft";
  };

  const isReadyToFinalize = (contract) => {
    return contract && 
           contract.status === "pending-signatures" && 
           contract.freelancerSigned;
  };

  const ensureStringId = (id) => {
    if (!id) return null;
    return typeof id === 'object' ? id.toString() : id;
  };

  const togglePaymentSection = (contractId) => {
    if (expandedPaymentSection === contractId) {
      setExpandedPaymentSection(null);
    } else {
      setExpandedPaymentSection(contractId);
    }
  };

  const renderPaymentOptions = (contract, bid) => {
    if (!contract) return null;
    
    const { paymentStatus } = contract;
    const contractId = ensureStringId(contract._id);
    const suggestedAmount = contract?.payment?.amount && !isNaN(contract.payment.amount) && contract.payment.amount > 0 
      ? Math.floor(contract.payment.amount * 0.5) 
      : (bid?.amount && !isNaN(bid.amount) && bid.amount > 0 
        ? Math.floor(bid.amount * 0.5) 
        : null);
  
    console.log('[FreelancersBids] Rendering PaymentOptions:', {
      contractId,
      paymentStatus,
      pendingPaymentStatus: pendingPayments[contractId],
      suggestedAmount,
      totalAmount: contract.payment?.amount,
      advanceAmount: contract.advanceAmount,
    });
    
    const effectivePaymentStatus = pendingPayments[contractId] || paymentStatus;
    
    if (!effectivePaymentStatus || effectivePaymentStatus === 'NOT_PAID') {
      return (
        <div className="payment-section bg-white p-4 rounded-lg shadow-sm mt-2">
          <h3 className="text-lg font-medium mb-2">Payment Required</h3>
          <p className="mb-3">Please make the advance payment to start the project.</p>
          <PaymentButton 
            contractId={contractId}
            suggestedAmount={suggestedAmount}
            totalAmount={contract?.payment?.amount || bid?.amount || null}
            paymentType="ADVANCE"
            onPaymentSuccess={() => {
              setPendingPayments(prev => ({
                ...prev,
                [contractId]: 'ADVANCE_PAID',
              }));
              setRefreshTrigger(prev => prev + 1);
            }}
          />
        </div>
      );
    } else if (effectivePaymentStatus === 'ADVANCE_PAID') {
      return (
        <div className="payment-section bg-white p-4 rounded-lg shadow-sm mt-2">
          <div className="payment-complete-message bg-green-50 border border-green-200 p-3 rounded mb-3">
            <h3 className="text-lg font-medium text-green-700">Advance Payment Done</h3>
            <p className="text-green-700">The advance payment for this contract has been successfully completed.</p>
          </div>
          <PaymentHistory contractId={contractId} />
          
          {contract.status === 'active' && (
            <div className="final-payment mt-4">
              <h3 className="text-lg font-medium mb-2">Final Payment</h3>
              <p className="mb-3">Make the final payment when the work is completed to your satisfaction.</p>
              <PaymentButton 
                contractId={contractId}
                suggestedAmount={contract.finalAmount || (contract.payment.amount - (contract.advanceAmount || suggestedAmount))}
                totalAmount={contract.payment.amount}
                paymentType="FINAL"
              />
            </div>
          )}
        </div>
      );
    } else if (effectivePaymentStatus === 'FULLY_PAID') {
      return (
        <div className="payment-section bg-white p-4 rounded-lg shadow-sm mt-2">
          <div className="payment-complete-message bg-green-50 border border-green-200 p-3 rounded mb-3">
            <h3 className="text-lg font-medium text-green-700">Payment Complete</h3>
            <p className="text-green-700">You have completed all payments for this contract.</p>
          </div>
          <PaymentHistory contractId={contractId} />
        </div>
      );
    }
  };

  const renderFreelancerView = (contract) => {
    if (!contract) return null;
    
    const contractId = ensureStringId(contract._id);
    
    return (
      <div className="payment-status-section bg-white p-4 rounded-lg shadow-sm mt-2">
        <h3 className="text-lg font-medium mb-2">Payment Status</h3>
        <PaymentHistory contractId={contractId} />
      </div>
    );
  };

  const getContractActions = (bid, contract) => {
    if (!contract) {
      return (
        <button
          onClick={() => navigate(`/create-contract/${bid._id}`)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          Generate Contract
        </button>
      );
    }

    const readyToFinalize = isReadyToFinalize(contract);

    return (
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => viewContract(contract._id)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
        >
          View Contract
        </button>

        {canEditContract(contract) && (
          <button
            onClick={() => editContract(contract._id)}
            className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition"
          >
            Edit Contract
          </button>
        )}

        {(contract.status === 'active' || contract.status === 'completed') && (
          <button
            onClick={() => togglePaymentSection(contract._id)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            {expandedPaymentSection === contract._id ? "Hide Payment" : "Show Payment"}
          </button>
        )}

        {readyToFinalize && (
          <button
            onClick={() => togglePaymentSection(contract._id)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          >
            {expandedPaymentSection === contract._id ? "Hide Payment Details" : "Make Payment & Finalize"}
          </button>
        )}

        {contract.status === "pending-signatures" && (
          <div className="flex flex-col gap-2 mt-2 w-full">
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded w-full">
              {contract.freelancerSigned 
                ? "Freelancer has signed! You can finalize the contract after making advance payment."
                : "Waiting for freelancer to sign the contract"}
            </div>

            {readyToFinalize && (contract.paymentStatus === 'ADVANCE_PAID' || pendingPayments[contract._id] === 'ADVANCE_PAID') && (
              <div className="flex flex-col gap-2 w-full">
                <button
                  onClick={() => openAcceptModal(contract._id)}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition w-full"
                >
                  Finalize Contract
                </button>
              </div>
            )}
          </div>
        )}

        {contract.status === "sent-to-freelancer" && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-2 rounded w-full mt-2">
            Contract sent to freelancer for review
          </div>
        )}
      </div>
    );
  };

  const getContractStatusBadge = (status, contract) => {
    if (status === "pending-signatures" && contract?.freelancerSigned) {
      return (
        <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded">
          Ready to Finalize
        </span>
      );
    }
    
    const statusMap = {
      draft: { bg: "bg-gray-100", text: "text-gray-800", label: "Draft" },
      "sent-to-freelancer": { bg: "bg-yellow-100", text: "text-yellow-800", label: "Pending Freelancer Review" },
      "revision-requested": { bg: "bg-orange-100", text: "text-orange-800", label: "Revision Requested" },
      "pending-signatures": { bg: "bg-blue-100", text: "text-blue-800", label: "Awaiting Signatures" },
      active: { bg: "bg-green-100", text: "text-green-800", label: "Active" },
      completed: { bg: "bg-purple-100", text: "text-purple-800", label: "Completed" },
    };
    
    const style = statusMap[status] || { bg: "bg-gray-100", text: "text-gray-800", label: status };
    
    return (
      <span className={`${style.bg} ${style.text} text-sm font-medium px-2.5 py-0.5 rounded`}>
        {style.label}
      </span>
    );
  };

  if (loading) {
    return <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div></div>;
  }

  return (
    <div className="container mx-auto py-10 px-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold">Freelancers Bids</h2>
      </div>
      
      {error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : (
        <div className="space-y-4">
          {bids.length === 0 ? (
            <p className="text-center text-gray-500">No bids found.</p>
          ) : (
            bids.map((bid) => {
              const contract = contracts[bid._id];
              const readyToFinalize = contract && isReadyToFinalize(contract);
              
              return (
                <div key={bid._id} className="bg-white shadow-md p-4 rounded-lg">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p><strong>Job:</strong> {bid.job?.title}</p>
                      <p><strong>Freelancer:</strong> {bid.freelancer?.name}</p>
                      <p><strong>Bid Amount:</strong> ₹{bid.amount}</p>
                      <p><strong>Bid Status:</strong> <span className="capitalize">{bid.status}</span></p>
                      
                      {contract && (
                        <div className="mt-2">
                          <p>
                            <strong>Contract Status:</strong> {getContractStatusBadge(contract.status, contract)}
                          </p>
                          <p>
                            <strong>Client Signature:</strong>{" "}
                            <span className={contract.clientSigned ? "text-green-600" : "text-red-600"}>
                              {contract.clientSigned ? "Signed" : "Not Signed"}
                            </span>
                          </p>
                          <p>
                            <strong>Freelancer Signature:</strong>{" "}
                            <span className={contract.freelancerSigned ? "text-green-600" : "text-red-600"}>
                              {contract.freelancerSigned ? "Signed" : "Not Signed"}
                            </span>
                          </p>
                          
                          {(contract.status === 'active' || 
                             contract.status === 'completed' || 
                             readyToFinalize) && (
                            <p>
                              <strong>Payment Status:</strong>{" "}
                              <span className={`text-sm font-medium px-2.5 py-0.5 rounded ${
                                !contract.paymentStatus || contract.paymentStatus === 'NOT_PAID' 
                                  ? "bg-red-100 text-red-800"
                                  : contract.paymentStatus === 'ADVANCE_PAID'
                                    ? "bg-yellow-100 text-yellow-800" 
                                    : "bg-green-100 text-green-800"
                              }`}>
                                {!contract.paymentStatus || contract.paymentStatus === 'NOT_PAID' 
                                  ? "Not Paid" 
                                  : contract.paymentStatus === 'ADVANCE_PAID' 
                                    ? "Advance Paid" 
                                    : "Fully Paid"}
                              </span>
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col justify-end">
                      {bid.status === "pending" && (
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => updateBidStatus(bid._id, "accepted")}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => updateBidStatus(bid._id, "rejected")}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      
                      {bid.status === "accepted" && (
                        <div className="mt-2">
                          {getContractActions(bid, contract)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {contract && readyToFinalize && (!contract.paymentStatus || contract.paymentStatus === 'NOT_PAID') && !pendingPayments[contract._id] && (
                    <div className="mt-4 border-t pt-4">
                      <div className="bg-yellow-50 border border-yellow-200 p-3 mb-4 rounded">
                        <p className="font-medium text-yellow-800"> Action Required</p>
                        <p className="text-yellow-700">You need to make an advance payment to finalize this contract.</p>
                      </div>
                      <div className="payment-section bg-white p-4 rounded-lg shadow-sm">
                        <h3 className="text-lg font-medium mb-2">Advance Payment Required</h3>
                        <p className="mb-3">Please make the advance payment to finalize the contract and start the project.</p>
                        <PaymentButton 
                          contractId={ensureStringId(contract._id)}
                          suggestedAmount={contract?.payment?.amount && !isNaN(contract.payment.amount) && contract.payment.amount > 0 
                            ? Math.floor(contract.payment.amount * 0.5) 
                            : (bid?.amount && !isNaN(bid.amount) && bid.amount > 0 
                              ? Math.floor(bid.amount * 0.5) 
                              : null)}
                          totalAmount={contract?.payment?.amount || bid?.amount || null}
                          paymentType="ADVANCE"
                          onPaymentSuccess={() => {
                            setPendingPayments(prev => ({
                              ...prev,
                              [contract._id]: 'ADVANCE_PAID',
                            }));
                            setRefreshTrigger(prev => prev + 1);
                          }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {contract && expandedPaymentSection === contract._id && (
                    <div className="mt-4 border-t pt-4">
                      {renderPaymentOptions(contract, bid)}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {showAcceptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Finalize Contract</h3>
            
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
              <p>The freelancer has signed the contract and advance payment has been made. By finalizing this contract, you are making it active and work can begin.</p>
            </div>
            
            {updateStatus && (
              <div className={`mb-4 p-2 rounded ${updateStatus.includes("Failed") ? "bg-red-100 text-red-700" : updateStatus.includes("success") ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                {updateStatus}
              </div>
            )}
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowAcceptModal(false);
                  setUpdateStatus("");
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleAcceptContract}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
              >
                Finalize Contract
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FreelancersBids;