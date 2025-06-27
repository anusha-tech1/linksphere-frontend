import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ContractSigningPage = () => {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [bid, setBid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState("");
  const [hasSigned, setHasSigned] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    const fetchContractDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");
        const storedUserRole = localStorage.getItem("userRole");
        
        if (!token) {
          setError("User not authenticated");
          setLoading(false);
          return;
        }
        
        setUserRole(storedUserRole);
        
        // Fetch contract details
        const contractRes = await axios.get(
          `http://localhost:4001/api/contracts/${contractId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        const contractData = contractRes.data;
        setContract(contractData);
        
        // Check if user has already signed
        if (storedUserRole === "client") {
          setHasSigned(contractData.clientSigned);
        } else if (storedUserRole === "freelancer") {
          setHasSigned(contractData.freelancerSigned);
        }
        
        // Find associated bid
        try {
          // Based on role, fetch the appropriate bids
          const bidsEndpoint = storedUserRole === "client" 
            ? "http://localhost:4001/api/bids/freelancers-bids" 
            : "http://localhost:4001/api/bids/my-bids";
            
          const myBidsRes = await axios.get(
            bidsEndpoint,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          const associatedBid = myBidsRes.data.find(
            bid => bid.contractId === contractId
          );
          
          if (associatedBid) {
            setBid(associatedBid);
          }
        } catch (err) {
          console.error("Error fetching associated bid:", err);
          // Continue without bid data if we can't find it
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching contract details:", err);
        setError("Failed to load contract details.");
        setLoading(false);
      }
    };
    
    fetchContractDetails();
  }, [contractId]);

  const handleSignContract = async () => {
    try {
      if (!name.trim()) {
        alert("Please enter your full name to sign the contract.");
        return;
      }
      
      const token = localStorage.getItem("token");
      
      // Call the sign endpoint
      await axios.post(
        `http://localhost:4001/api/contracts/${contractId}/sign`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setHasSigned(true);
      alert("Contract signed successfully!");
      
      // Check if both parties have signed now
      const updatedContractRes = await axios.get(
        `http://localhost:4001/api/contracts/${contractId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (updatedContractRes.data.clientSigned && updatedContractRes.data.freelancerSigned) {
        alert("Both parties have signed the contract. The contract is now active!");
      }
      
      navigate(userRole === "client" ? "/freelancers-bids" : "/my-bids");
    } catch (err) {
      console.error("Error signing contract:", err);
      setError("Failed to sign contract.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10 px-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="container mx-auto py-10 px-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Notice!</strong>
          <span className="block sm:inline"> Contract not found.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-6">
      <h2 className="text-3xl font-bold text-center mb-6">Contract Signing</h2>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-2">Contract Details</h3>
          <p><strong>Status:</strong> {contract.status}</p>
          <p><strong>Created:</strong> {new Date(contract.createdAt).toLocaleDateString()}</p>
          {bid && (
            <>
              <p><strong>Job:</strong> {bid.job?.title}</p>
              <p><strong>Amount:</strong> ₹{bid.amount}</p>
            </>
          )}
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Contract Terms</h3>
          <div className="border border-gray-300 rounded-md p-4 bg-gray-50">
            <pre className="whitespace-pre-wrap">{contract.terms || "No terms specified"}</pre>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Signatures</h3>
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex-1 p-4 border border-gray-300 rounded-md">
              <p className="font-medium">Client</p>
              {contract.clientSigned ? (
                <p className="text-green-600">Signed ✓</p>
              ) : (
                <p className="text-yellow-600">Not signed yet</p>
              )}
            </div>
            <div className="flex-1 p-4 border border-gray-300 rounded-md">
              <p className="font-medium">Freelancer</p>
              {contract.freelancerSigned ? (
                <p className="text-green-600">Signed ✓</p>
              ) : (
                <p className="text-yellow-600">Not signed yet</p>
              )}
            </div>
          </div>
        </div>

        {!hasSigned && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Sign Contract</h3>
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md mb-4">
              <p>By signing this contract, you agree to all terms and conditions stated above.</p>
            </div>
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Type your full name to sign
              </label>
              <input
                type="text"
                id="name"
                className="w-full p-2 border border-gray-300 rounded-md"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
              />
            </div>
            <button
              onClick={handleSignContract}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
              disabled={!name.trim()}
            >
              Sign Contract
            </button>
          </div>
        )}

        {hasSigned && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6">
            <strong>You have already signed this contract.</strong>
            {!(contract.clientSigned && contract.freelancerSigned) && (
              <p>Waiting for the other party to sign.</p>
            )}
          </div>
        )}

        <div className="flex justify-between mt-6">
          <button
            onClick={() => navigate(userRole === "client" ? "/freelancers-bids" : "/my-bids")}
            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContractSigningPage;