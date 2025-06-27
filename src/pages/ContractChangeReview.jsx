import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const ContractChangeReview = () => {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatedTerms, setUpdatedTerms] = useState("");
  const [responseMessage, setResponseMessage] = useState("");

  useEffect(() => {
    const fetchContract = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("User not logged in.");
          setLoading(false);
          return;
        }

        const res = await axios.get(`https://linksphere-backend-jkws.onrender.com/api/contracts/${contractId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setContract(res.data);
        setUpdatedTerms(res.data.terms);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching contract:", err);
        setError("Failed to load contract details.");
        setLoading(false);
      }
    };

    fetchContract();
  }, [contractId]);

  const handleAcceptChanges = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `https://linksphere-backend-jkws.onrender.com/api/contracts/${contractId}`,
        { 
          status: "sent-to-freelancer",
          terms: updatedTerms
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setResponseMessage("Changes accepted and contract sent back to freelancer.");
      setTimeout(() => {
        navigate("/freelancers-bids");
      }, 2000);
    } catch (err) {
      console.error("Error updating contract:", err);
      setError("Failed to update contract. Please try again.");
    }
  };

  const handleRejectChanges = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.patch(
        `https://linksphere-backend-jkws.onrender.com/api/contracts/${contractId}`,
        { status: "rejected" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setResponseMessage("Changes rejected. Contract has been cancelled.");
      setTimeout(() => {
        navigate("/freelancers-bids");
      }, 2000);
    } catch (err) {
      console.error("Error rejecting contract:", err);
      setError("Failed to reject contract. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button
          onClick={() => navigate("/freelancers-bids")}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Back to Bids
        </button>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
          Contract not found.
        </div>
        <button
          onClick={() => navigate("/freelancers-bids")}
          className="bg-gray-500 text-white px-4 py-2 rounded"
        >
          Back to Bids
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Review Contract Changes</h2>

      {responseMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {responseMessage}
        </div>
      )}

      <div className="bg-white shadow-md rounded p-6 mb-6">
        <h3 className="text-xl font-semibold mb-4">Contract Details</h3>
        <div className="mb-4">
          <p className="mb-2">
            <span className="font-semibold">Status:</span> {contract.status}
          </p>
        </div>

        <div className="mb-6">
          <h4 className="font-semibold mb-2">Change Requests:</h4>
          {contract.changeRequests && contract.changeRequests.length > 0 ? (
            <div className="bg-gray-50 p-4 rounded">
              {contract.changeRequests.map((request, index) => (
                <div key={index} className="mb-3 last:mb-0 pb-3 last:pb-0 border-b last:border-b-0 border-gray-200">
                  <p className="text-sm text-gray-500">
                    Requested by: {request.by} on{" "}
                    {new Date(request.timestamp).toLocaleDateString()}
                  </p>
                  <p className="mt-1">{request.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No change requests found.</p>
          )}
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 font-semibold mb-2">
            Contract Terms:
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="10"
            value={updatedTerms}
            onChange={(e) => setUpdatedTerms(e.target.value)}
          ></textarea>
        </div>

        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleAcceptChanges}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition"
          >
            Accept Changes
          </button>
          <button
            onClick={handleRejectChanges}
            className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition"
          >
            Reject Changes
          </button>
          <button
            onClick={() => navigate("/freelancers-bids")}
            className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600 transition"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContractChangeReview;