import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";

const PostJob = () => {
  const [jobData, setJobData] = useState({
    title: "",
    description: "",
    skills: "",
    budget: "",
    deadline: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Get today's date in YYYY-MM-DD format for the min attribute
  const today = new Date().toISOString().split("T")[0];

  const handleChange = (e) => {
    setJobData({ ...jobData, [e.target.name]: e.target.value });
    // Clear error when user changes input
    if (error && e.target.name === "deadline") {
      setError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!token) {
      setError("You must be logged in to post a job.");
      return;
    }

    // Validate deadline
    const selectedDate = new Date(jobData.deadline);
    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0); // Reset time for comparison
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < todayDate) {
      setError("Deadline cannot be in the past. Please select today or a future date.");
      return;
    }

    // Validate other fields
    if (!jobData.title.trim() || !jobData.description.trim() || !jobData.skills.trim() || !jobData.budget || !jobData.deadline) {
      setError("All fields are required.");
      return;
    }

    if (isNaN(parseFloat(jobData.budget)) || parseFloat(jobData.budget) <= 0) {
      setError("Please enter a valid budget greater than 0.");
      return;
    }

    try {
      console.log("Sending Job Data:", {
        title: jobData.title.trim(),
        description: jobData.description.trim(),
        budget: parseFloat(jobData.budget),
        requiredSkills: jobData.skills.split(",").map(skill => skill.trim()).filter(skill => skill),
        deadline: selectedDate,
      });

      const response = await axiosInstance.post(
        "/api/jobs",
        {
          title: jobData.title.trim(),
          description: jobData.description.trim(),
          budget: parseFloat(jobData.budget),
          requiredSkills: jobData.skills.split(",").map(skill => skill.trim()).filter(skill => skill),
          deadline: selectedDate,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("Job Posted Response:", response.data);
      alert("Job posted successfully!");
      navigate("/find-jobs");
    } catch (err) {
      console.error("Error posting job:", err.response?.data || err);
      setError(err.response?.data?.message || "Failed to post job. Please try again.");
    }
  };

  return (
    <div className="container mx-auto py-10 px-6">
      <h2 className="text-3xl font-bold text-center mb-6">Post a Job</h2>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6 max-w-lg mx-auto">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
      <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Job Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={jobData.title}
            placeholder="Job Title"
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Job Description
          </label>
          <textarea
            id="description"
            name="description"
            value={jobData.description}
            placeholder="Job Description"
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="5"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-1">
            Required Skills (comma-separated)
          </label>
          <input
            type="text"
            id="skills"
            name="skills"
            value={jobData.skills}
            placeholder="e.g., JavaScript, React, Node.js"
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">
            Budget (₹)
          </label>
          <input
            type="number"
            id="budget"
            name="budget"
            value={jobData.budget}
            placeholder="Budget (₹)"
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1"
            step="0.01"
            required
          />
        </div>
        <div className="mb-6">
          <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
            Deadline
          </label>
          <input
            type="date"
            id="deadline"
            name="deadline"
            value={jobData.deadline}
            onChange={handleChange}
            className="w-full border px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            min={today}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors duration-200"
        >
          Post Job
        </button>
      </form>
    </div>
  );
};

export default PostJob;