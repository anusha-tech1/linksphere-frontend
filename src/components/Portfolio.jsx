import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Portfolio = () => {
    const { user } = useContext(AuthContext);

    if (!user || user.role !== 'freelancer') {
        return <Navigate to="/dashboard" />;
    }

    return (
        <div>
            <h1>Portfolio</h1>
            <p>Manage your portfolio here.</p>
        </div>
    );
};

const ContactSection = () => (
    <div className="mb-6 border-t pt-6">
      <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="mb-4">
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            name="contactInfo.email"
            value={formData.contactInfo?.email || ''}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-4 py-2"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium">Phone</label>
          <input
            type="tel"
            name="contactInfo.phone"
            value={formData.contactInfo?.phone || ''}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-4 py-2"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium">Location</label>
          <input
            type="text"
            name="contactInfo.location"
            value={formData.contactInfo?.location || ''}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-4 py-2"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium">GitHub Profile</label>
          <input
            type="url"
            name="contactInfo.github"
            value={formData.contactInfo?.github || ''}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-4 py-2"
            placeholder="https://github.com/username"
          />
        </div>
      </div>
    </div>
  );
  

export default Portfolio;
