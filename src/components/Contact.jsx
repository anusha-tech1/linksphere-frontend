import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const Contact = () => {
  const { id } = useParams();
  const [freelancer, setFreelancer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchFreelancerContact = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:4001/api/freelancers/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFreelancer(response.data);
      } catch (err) {
        setError('Failed to load freelancer contact information');
      } finally {
        setLoading(false);
      }
    };

    fetchFreelancerContact();
  }, [id]);

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
  if (!freelancer) return <div className="text-center py-8">Freelancer not found</div>;

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Contact {freelancer.name}</h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Email</h3>
              <p className="text-gray-600">{freelancer.contactInfo?.email}</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Phone</h3>
              <p className="text-gray-600">{freelancer.contactInfo?.phone}</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Location</h3>
              <p className="text-gray-600">{freelancer.contactInfo?.location}</p>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">GitHub</h3>
              {freelancer.contactInfo?.github ? (
                <a 
                  href={freelancer.contactInfo.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View GitHub Profile
                </a>
              ) : (
                <p className="text-gray-600">Not provided</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;