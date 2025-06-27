import { useState, useEffect } from "react";
import axios from "axios";

const FindJobs = ({ user }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bidDetails, setBidDetails] = useState({ amount: "", proposal: "", timeline: "" });
  const [selectedJob, setSelectedJob] = useState(null);

  const [search, setSearch] = useState("");
  const [skills, setSkills] = useState("");
  const [budget, setBudget] = useState("");

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async (filters = {}) => {
    try {
      setLoading(true);
      const response = await axios.get("https://linksphere-backend-jkws.onrender.com/api/jobs/search", { params: filters });
      setJobs(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError("Failed to load jobs. Please try again.");
      setLoading(false);
    }
  };

  const handleSearch = () => {
    const filters = {};
    if (search) filters.title = search;
    if (skills) filters.skills = skills;
    if (budget) filters.budget = parseInt(budget, 10);
    
    fetchJobs(filters);
  };
  
  const openApplyModal = (job) => {
    setSelectedJob(job);
    setBidDetails({ amount: "", proposal: "", timeline: "" });
  };
  
  const closeApplyModal = () => {
    setSelectedJob(null);
  };
  
  const handleApply = async () => {
    if (!bidDetails.amount || !bidDetails.proposal || !bidDetails.timeline) {
      return alert("All fields are required.");
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) return alert("Please log in first!");

      await axios.post(
        `https://linksphere-backend-jkws.onrender.com/api/jobs/${selectedJob._id}/apply`,
        {
          bidAmount: bidDetails.amount,
          proposal: bidDetails.proposal,
          timeline: bidDetails.timeline,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Successfully applied for the job!");
      closeApplyModal();
    } catch (error) {
      console.error("Error applying for job:", error);
      alert(error.response?.data?.message || "Failed to apply for the job.");
    }
  };

  return (
    <div className="container mx-auto py-10 px-6">
      <h2 className="text-3xl font-bold text-center mb-6">Find Jobs</h2>

      <div className="flex flex-wrap gap-4 mb-6 justify-center">
        <input
          type="text"
          placeholder="Search by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border p-2 rounded w-full sm:w-1/4"
        />

        <input
          type="text"
          placeholder="Filter by skills (comma separated)..."
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          className="border p-2 rounded w-full sm:w-1/4"
        />

        <input
          type="number"
          placeholder="Filter by budget..."
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          className="border p-2 rounded w-full sm:w-1/4"
        />

        <button onClick={handleSearch} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Search
        </button>
      </div>

      {error && <p className="text-red-500 text-center">{error}</p>}

      {loading ? (
        <p className="text-center text-gray-800">Loading...</p>
      ) : jobs.length === 0 ? (
        <p className="text-center text-gray-800">No open jobs found. Try a different search.</p>
      ) : (
        <div className="space-y-6">
          <p className="text-center text-gray-600 mb-4">Showing {jobs.length} available jobs</p>
          {jobs.map((job) => (
            <div key={job._id} className="bg-white shadow-lg rounded-lg p-6 border border-gray-200 hover:shadow-2xl transition-shadow duration-300">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-2xl font-bold text-gray-900">{job.title}</h3>
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">Open</span>
              </div>
              <p className="text-gray-700 mb-4">{job.description}</p>

              <div className="flex flex-col sm:flex-row sm:justify-between text-gray-800">
                <p>
                  <strong>Skills:</strong> <span className="text-blue-600">{job.requiredSkills.join(", ")}</span>
                </p>
                <p className="font-semibold">
                  <strong>Budget:</strong> <span className="text-green-600">₹{job.budget}</span>
                </p>
                <p>
                  <strong>Deadline:</strong> <span className="text-red-500">{new Date(job.deadline).toLocaleDateString()}</span>
                </p>
              </div>

              {user?.role === "freelancer" && (
                <button onClick={() => openApplyModal(job)} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
                  Apply
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedJob && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4">Apply for {selectedJob.title}</h2>
            <input
              type="text"
              placeholder="Bid Amount (₹)"
              className="w-full p-2 border mb-2"
              value={bidDetails.amount}
              onChange={(e) => setBidDetails({ ...bidDetails, amount: e.target.value })}
            />
            <textarea
              placeholder="Proposal"
              className="w-full p-2 border mb-2"
              value={bidDetails.proposal}
              onChange={(e) => setBidDetails({ ...bidDetails, proposal: e.target.value })}
            />
            <input
              type="text"
              placeholder="Timeline (e.g., 2 weeks)"
              className="w-full p-2 border mb-4"
              value={bidDetails.timeline}
              onChange={(e) => setBidDetails({ ...bidDetails, timeline: e.target.value })}
            />
            <button onClick={handleApply} className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">
              Submit Application
            </button>
            <button onClick={closeApplyModal} className="w-full bg-gray-400 text-white p-2 rounded mt-2 hover:bg-gray-500">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FindJobs;