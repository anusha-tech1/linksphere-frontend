import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const ContractEditor = () => {
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    freelancerInfo: { fullName: "", email: "" },
  });
  const [changeHistory, setChangeHistory] = useState([]);
  const { contractId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchContractData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          setError("User not logged in.");
          setLoading(false);
          return;
        }

        const contractRes = await axios.get(`https://linksphere-backend-jkws.onrender.com/api/contracts/${contractId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("Fetched contract:", contractRes.data); // Debug log
        setContract(contractRes.data);

        setFormData({
          freelancerInfo: {
            fullName: contractRes.data.freelancerInfo?.fullName || "",
            email: contractRes.data.freelancerInfo?.email || "",
          },
        });

        if (contractRes.data.changeRequests && contractRes.data.changeRequests.length > 0) {
          setChangeHistory(contractRes.data.changeRequests);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching contract:", err);
        setError("Failed to load contract details.");
        setLoading(false);
      }
    };

    fetchContractData();
  }, [contractId]);

  const handleChange = (e, section, field) => {
    const { value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError("");
      const token = localStorage.getItem("token");

      const updateData = {
        freelancerInfo: formData.freelancerInfo,
        status: "sent-to-freelancer",
      };
      console.log("Submitting update:", updateData); // Debug log

      await axios.patch(
        `https://linksphere-backend-jkws.onrender.com/api/contracts/${contractId}`,
        updateData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Contract updated and sent back to the freelancer.");
      navigate("/freelancers-bids");
    } catch (err) {
      console.error("Error updating contract:", err.response?.data || err);
      setError("Failed to update the contract. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="container mx-auto py-10 px-6">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Edit Contract</h2>

        {contract && contract.status === "revision-requested" && (
          <div className="mb-6 bg-yellow-50 border border-yellow-300 p-4 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Changes Requested</h3>
            {changeHistory.map((change, index) => (
              <div key={index} className="mb-2 pb-2 border-b">
                <div className="flex justify-between">
                  <span className="font-semibold capitalize">By: {change.by}</span>
                  <span className="text-sm text-gray-500">
                    {new Date(change.timestamp).toLocaleString()}
                  </span>
                </div>
                <p className="mt-1">{change.message}</p>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2" htmlFor="freelancerFullName">
              Freelancer Full Name
            </label>
            <input
              type="text"
              id="freelancerFullName"
              value={formData.freelancerInfo.fullName}
              onChange={(e) => handleChange(e, "freelancerInfo", "fullName")}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2" htmlFor="freelancerEmail">
              Freelancer Email
            </label>
            <input
              type="email"
              id="freelancerEmail"
              value={formData.freelancerInfo.email}
              onChange={(e) => handleChange(e, "freelancerInfo", "email")}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              disabled={submitting}
              className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${
                submitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {submitting ? "Saving..." : "Save and Resend Contract"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/freelancers-bids")}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContractEditor;