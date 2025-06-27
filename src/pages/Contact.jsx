import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaGithub } from "react-icons/fa"; 

const StarRating = ({ rating, setRating, disabled }) => {
  const handleStarClick = (value) => {
    if (!disabled) {
      setRating(value);
    }
  };

  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-6 h-6 cursor-pointer ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
          onClick={() => handleStarClick(star)}
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.286 3.97c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.54-1.118l1.286-3.97a1 1 0 00-.364-1.118L2.69 9.397c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.97z" />
        </svg>
      ))}
    </div>
  );
};

const Contact = () => {
  const { id } = useParams(); 
  const [freelancer, setFreelancer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rating, setRating] = useState(0);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [ratings, setRatings] = useState(() => {
    // Load ratings from localStorage
    const stored = localStorage.getItem(`freelancer_ratings_${id}`);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    const fetchFreelancer = async () => {
      try {
        const response = await axios.get(`http://localhost:4001/api/freelancers/${id}`);
        setFreelancer(response.data);
      } catch (error) {
        console.error("Error fetching freelancer details:", error);
        setError("Failed to load freelancer details.");
      } finally {
        setLoading(false);
      }
    };

    fetchFreelancer();
  }, [id]);

  useEffect(() => {
    // Save ratings to localStorage whenever they change
    localStorage.setItem(`freelancer_ratings_${id}`, JSON.stringify(ratings));
  }, [ratings, id]);

  const handleRatingSubmit = () => {
    if (rating === 0) {
      setSubmissionStatus("Please select a rating");
      return;
    }
    // Add new rating to the array
    const newRatings = [...ratings, rating];
    setRatings(newRatings);
    setSubmissionStatus("Rating submitted successfully!");
    setRating(0); // Reset rating after submission
  };

  // Calculate average rating
  const averageRating = ratings.length > 0
    ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
    : 0;

  if (loading) return <div className="text-center py-8 text-white">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
  if (!freelancer) return <div className="text-center py-8 text-white">Freelancer not found</div>;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-300 px-4">
      <div className="max-w-2xl w-full bg-gray-500 text-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center mb-6">
          Contact {freelancer.name}
        </h2>

        <div className="space-y-6">
          <div className="p-4 bg-gray-700 rounded-lg">
            <h3 className="text-lg font-semibold">Rate this Freelancer</h3>
            <div className="mt-2 flex items-center space-x-4">
              <StarRating rating={rating} setRating={setRating} disabled={false} />
              <button
                onClick={handleRatingSubmit}
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition"
              >
                Submit
              </button>
            </div>
            {submissionStatus && (
              <p className={`mt-2 ${submissionStatus.includes("successfully") ? "text-green-400" : "text-red-400"}`}>
                {submissionStatus}
              </p>
            )}
          </div>

          <div className="p-4 bg-gray-700 rounded-lg">
            <h3 className="text-lg font-semibold">Average Rating</h3>
            <div className="mt-2 flex items-center">
              <StarRating
                rating={Math.round(averageRating)}
                setRating={() => {}}
                disabled={true}
              />
              <span className="ml-2 text-gray-300">
                ({averageRating.toFixed(1)} / 5)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-gray-700 rounded-lg flex items-center space-x-4">
              <FaEnvelope className="text-yellow-400 text-2xl" />
              <div>
                <h3 className="text-lg font-semibold">Email</h3>
                <p className="text-gray-300">{freelancer.contactInfo?.email || "Not provided"}</p>
              </div>
            </div>

            <div className="p-4 bg-gray-700 rounded-lg flex items-center space-x-4">
              <FaPhone className="text-green-400 text-2xl" />
              <div>
                <h3 className="text-lg font-semibold">Phone</h3>
                <p className="text-gray-300">{freelancer.contactInfo?.phone || "Not provided"}</p>
              </div>
            </div>

            <div className="p-4 bg-gray-700 rounded-lg flex items-center space-x-4">
              <FaMapMarkerAlt className="text-red-400 text-2xl" />
              <div>
                <h3 className="text-lg font-semibold">Location</h3>
                <p className="text-gray-300">{freelancer.contactInfo?.location || "Not provided"}</p>
              </div>
            </div>

            <div className="p-4 bg-gray-700 rounded-lg flex items-center space-x-4">
              <FaGithub className="text-blue-400 text-2xl" />
              <div>
                <h3 className="text-lg font-semibold">GitHub</h3>
                {freelancer.contactInfo?.github ? (
                  <a
                    href={freelancer.contactInfo.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-300 hover:underline"
                  >
                    View GitHub Profile
                  </a>
                ) : (
                  <p className="text-gray-300">Not provided</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;