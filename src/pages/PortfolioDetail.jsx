import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const PortfolioDetail = () => {
  const { id } = useParams();
  const [freelancer, setFreelancer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFreelancer = async () => {
      try {
        const response = await axios.get(`https://linksphere-backend-jkws.onrender.com/api/freelancers/${id}`);
        setFreelancer(response.data);
      } catch (err) {
        setError("Failed to fetch freelancer details.");
      } finally {
        setLoading(false);
      }
    };

    fetchFreelancer();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 py-10 text-xl">{error}</div>;
  }

  if (!freelancer) {
    return <div className="text-center text-gray-500 py-10 text-xl">Freelancer not found.</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        
        <div className="relative h-64">
          {freelancer.image ? (
            <img
              src={`/uploads/${freelancer.image}`} 
              alt={freelancer.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No image available</span>
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{freelancer.name}</h1>
              <h3 className="text-xl text-gray-600 mb-2">{freelancer.role}</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {freelancer.skills.map((skill, index) => (
                  <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <button
              onClick={() => navigate(`/edit/${id}`)}
              className="bg-yellow-500 text-white px-6 py-2 rounded-lg hover:bg-yellow-600 transition duration-200"
            >
              Edit Profile
            </button>
          </div>

          {freelancer.contactInfo && (
            <div className="mt-8 border-t pt-6">
              <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <strong>Email:</strong> {freelancer.contactInfo.email || "Not provided"}
                </div>
                <div>
                  <strong>Phone:</strong> {freelancer.contactInfo.phone || "Not provided"}
                </div>
                <div>
                  <strong>Location:</strong> {freelancer.contactInfo.location || "Not provided"}
                </div>
                <div>
                  <strong>GitHub:</strong>{" "}
                  {freelancer.contactInfo.github ? (
                    <a
                      href={freelancer.contactInfo.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      View GitHub
                    </a>
                  ) : (
                    "Not provided"
                  )}
                </div>
              </div>
            </div>
          )}

          {freelancer.portfolioLink && (
            <div className="mt-8 border-t pt-6">
              <h2 className="text-2xl font-semibold mb-4">Portfolio</h2>
              <a
                href={freelancer.portfolioLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
              >
                View Full Portfolio
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PortfolioDetail;
