import { useState, useEffect } from "react";
import axios from "axios";

const MyJobs = ({ user }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const fetchMyJobs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Please log in to view your jobs.");
        setLoading(false);
        return;
      }

      const response = await axios.get("http://localhost:4001/api/jobs/my-jobs", {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setJobs(response.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching my jobs:", err);
      setError("Failed to load your jobs. Please try again.");
      setLoading(false);
    }
  };

  const handleDeleteJob = async (jobId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please log in first!");
        return;
      }

      console.log("Attempting to delete job:", jobId);
      console.log("Token exists:", !!token);
      console.log("User:", user);
      
      // Find the job we're trying to delete
      const jobToDelete = jobs.find(job => job._id === jobId);
      console.log("Job to delete:", jobToDelete);

      const response = await axios.delete(`http://localhost:4001/api/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Remove the deleted job from the state
      setJobs(jobs.filter(job => job._id !== jobId));
      setDeleteConfirm(null);
      alert("Job deleted successfully!");
    } catch (error) {
      console.error("Error deleting job:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      alert(error.response?.data?.message || "Failed to delete job.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "open": return "bg-green-100 text-green-800";
      case "in-progress": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const canDeleteJob = (job) => {
    // Only allow deletion of open jobs
    return job.status === "open";
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">
      <p className="text-center text-gray-800">Loading your jobs...</p>
    </div>;
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen">
      <p className="text-red-500 text-center">{error}</p>
    </div>;
  }

  return (
    <div className="container mx-auto py-10 px-6">
      <h2 className="text-3xl font-bold text-center mb-6">My Posted Jobs</h2>

      {jobs.length === 0 ? (
        <div className="text-center">
          <p className="text-gray-600 mb-4">You haven't posted any jobs yet.</p>
          <a href="/post-job" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
            Post Your First Job
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          <p className="text-center text-gray-600 mb-4">
            You have posted {jobs.length} job{jobs.length !== 1 ? 's' : ''}
          </p>
          
          {jobs.map((job) => (
            <div key={job._id} className="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-2xl font-bold text-gray-900">{job.title}</h3>
                    <span className={`px-3 py-1 rounded text-sm font-medium ${getStatusColor(job.status)}`}>
                      {job.status.charAt(0).toUpperCase() + job.status.slice(1).replace('-', ' ')}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-4">{job.description}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Budget</p>
                  <p className="font-semibold text-green-600">₹{job.budget}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Deadline</p>
                  <p className="font-semibold text-red-500">
                    {new Date(job.deadline).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Posted On</p>
                  <p className="font-semibold">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Required Skills</p>
                <div className="flex flex-wrap gap-2">
                  {job.requiredSkills.map((skill, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t">
                {canDeleteJob(job) && (
                  <button
                    onClick={() => setDeleteConfirm(job._id)}
                    className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                  >
                    Delete Job
                  </button>
                )}
                {!canDeleteJob(job) && (
                  <p className="text-gray-500 text-sm">
                    Jobs that are in progress or completed cannot be deleted
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-bold mb-4 text-red-600">Confirm Deletion</h3>
            <p className="mb-6">
              Are you sure you want to delete this job? This action cannot be undone and will also delete all associated bids.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => handleDeleteJob(deleteConfirm)}
                className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-gray-400 text-white py-2 rounded hover:bg-gray-500 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyJobs;