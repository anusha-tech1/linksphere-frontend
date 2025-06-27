import React, { useState, useEffect } from 'react';
import axios from 'axios';

const PortfolioPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    skills: '',
    portfolioLink: '',
    contactInfo: { email: '', phone: '', location: '', github: '' },
    image: null
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEdit, setIsEdit] = useState(false);
  const [portfolioId, setPortfolioId] = useState(null);

  
  const fetchPortfolio = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axios.get('http://localhost:4001/api/freelancers/me', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data) {
        setFormData({
          name: response.data.name || '',
          role: response.data.role || '',
          skills: response.data.skills.join(', ') || '',
          portfolioLink: response.data.portfolioLink || '',
          contactInfo: response.data.contactInfo || { email: '', phone: '', location: '', github: '' }
        });
        setPortfolioId(response.data._id);
        setIsEdit(true);
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('contactInfo.')) {
      const field = name.split('.')[1]; 
      setFormData((prevData) => ({
        ...prevData,
        contactInfo: { ...prevData.contactInfo, [field]: value }
      }));
    } else {
      setFormData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    setFormData((prevData) => ({
      ...prevData,
      image: e.target.files[0]
    }));
  };


  const validateInputs = () => {
    if (!formData.name || !formData.role || !formData.skills) {
      setError('Name, Role, and Skills are required.');
      return false;
    }
    return true;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
  
    if (!validateInputs()) return;
  
    const token = localStorage.getItem('token');
    const apiUrl = isEdit
      ? `http://localhost:4001/api/freelancers/${portfolioId}`
      : 'http://localhost:4001/api/freelancers';
    const method = isEdit ? 'put' : 'post';
  
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('role', formData.role);
      formDataToSend.append('skills', formData.skills.split(',').map(skill => skill.trim()));
      formDataToSend.append('portfolioLink', formData.portfolioLink);
      formDataToSend.append('contactInfo[email]', formData.contactInfo.email);
      formDataToSend.append('contactInfo[phone]', formData.contactInfo.phone);
      formDataToSend.append('contactInfo[location]', formData.contactInfo.location);
      formDataToSend.append('contactInfo[github]', formData.contactInfo.github);
      
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }
  
      await axios[method](apiUrl, formDataToSend, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
  
      setSuccess('Portfolio updated successfully!');
      setTimeout(() => window.location.reload(), 1000); 
    } catch (error) {
      console.error('Error saving portfolio:', error);
      setError('Failed to save portfolio.');
    }
  };
  
  return (
    <div className="container mx-auto py-10 px-6">
      <h2 className="text-3xl font-bold text-center mb-6">{isEdit ? 'Edit Portfolio' : 'Add Portfolio'}</h2>
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {success && <p className="text-green-500 text-center mb-4">{success}</p>}
      <form onSubmit={handleSubmit} className="max-w-lg mx-auto" encType="multipart/form-data">

        <div className="mb-4">
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-4 py-2"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium">Role</label>
          <input
            type="text"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-4 py-2"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium">Skills (comma-separated)</label>
          <input
            type="text"
            name="skills"
            value={formData.skills}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-4 py-2"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium">Portfolio Link</label>
          <input
            type="url"
            name="portfolioLink"
            value={formData.portfolioLink}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-4 py-2"
          />
        </div>

        <div className="mb-6 border-t pt-6">
          <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-sm font-medium">Email</label>
              <input
                type="email"
                name="contactInfo.email"
                value={formData.contactInfo.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-4 py-2"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Phone</label>
              <input
                type="tel"
                name="contactInfo.phone"
                value={formData.contactInfo.phone}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-4 py-2"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">Location</label>
              <input
                type="text"
                name="contactInfo.location"
                value={formData.contactInfo.location}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-4 py-2"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium">GitHub Profile</label>
              <input
                type="url"
                name="contactInfo.github"
                value={formData.contactInfo.github}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded px-4 py-2"
                placeholder="https://github.com/username"
              />
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium">Profile Image</label>
          <input type="file" onChange={handleFileChange} className="w-full border border-gray-300 rounded px-4 py-2" />
        </div>

        <button type="submit" className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700">
          {isEdit ? 'Update Portfolio' : 'Submit Portfolio'}
        </button>
      </form>
    </div>
  );
};

export default PortfolioPage;
