import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const ContractCompletionPage = () => {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [bid, setBid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState("");
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const fetchContractDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const storedUserRole = localStorage.getItem("userRole");
        
        if (!token) {
          setError("User not authenticated");
          setLoading(false);
          return;
        }
        
        setUserRole(storedUserRole);
        
        // Check if user is a client (only clients can complete contracts)
        if (storedUserRole !== "client") {
          setError("Only clients can mark contracts as complete.");
          setLoading(false);
          return;
        }
        
        // Fetch contract details
        const contractRes = await axios.get(
          `https://linksphere-backend-jkws.onrender.com/api/contracts/${contractId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setContract(contractRes.data);
        
        // Find associated bid
        try {
          const myBidsRes = await axios.get(
            "https://linksphere-backend-jkws.onrender.com/api/bids/freelancers-bids",
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

  const handleCompleteContract = async () => {
    try {
      const token = localStorage.getItem("token");
      
      // Call the complete contract endpoint
      await axios.post(
        `https://linksphere-backend-jkws.onrender.com/api/contracts/${contractId}/complete`,
        { feedback }, // You can add this to your backend if you want to save feedback
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      alert("Contract completed successfully!");
      navigate("/freelancers-bids");
    } catch (err) {
      console.error("Error completing contract:", err);
      setError("Failed to complete contract.");
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
          <div className="mt-3">
            <button 
              onClick={() => navigate("/freelancers-bids")} 
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
            >
              Back to Bids
            </button>
          </div>
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

  // Check if contract is already completed
  if (contract.status === "completed") {
    return (
      <div className="container mx-auto py-10 px-6">
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Success!</strong>
          <span className="block sm:inline"> This contract has already been marked as complete.</span>
          <div className="mt-3">
            <button 
              onClick={() => navigate("/freelancers-bids")} 
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition"
            >
              Back to Bids
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check if contract is not active
  if (contract.status !== "active") {
    return (
      <div className="container mx-auto py-10 px-6">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Notice!</strong>
          <span className="block sm:inline"> Only active contracts can be marked as complete. This contract is currently in "{contract.status}" status.</span>
          <div className="mt-3">
            <button 
              onClick={() => navigate("/freelancers-bids")} 
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 transition"
            >
              Back to Bids
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-6">
      <h2 className="text-3xl font-bold text-center mb-6">Complete Contract</h2>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-2">Contract Details</h3>
          <p><strong>Status:</strong> {contract.status}</p>
          <p><strong>Created:</strong> {new Date(contract.createdAt).toLocaleDateString()}</p>
          {bid && (
            <>
              <p><strong>Job:</strong> {bid.job?.title}</p>
              <p><strong>Freelancer:</strong> {bid.freelancer?.name}</p>
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

        <div className="bg-blue-50 border border-blue-200 p-4 rounded-md mb-6">
          <p className="text-blue-800">
            <strong>Important:</strong> By completing this contract, you confirm that all agreed-upon work has been delivered satisfactorily. This action cannot be undone.
          </p>
        </div>

        <div className="mb-6">
          <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-1">
            Feedback for Freelancer (Optional)
          </label>
          <textarea
            id="feedback"
            className="w-full h-32 p-4 border border-gray-300 rounded-md"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Share your experience working with this freelancer..."
          ></textarea>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => navigate("/freelancers-bids")}
            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleCompleteContract}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
          >
            Mark as Complete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContractCompletionPage;