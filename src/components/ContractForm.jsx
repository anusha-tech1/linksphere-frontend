import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";

const ContractForm = () => {
  const { bidId } = useParams();
  const navigate = useNavigate();
  console.log("Contract form received bidId:", bidId);
  const [contractDetails, setContractDetails] = useState({
    clientInfo: {
      fullName: '',
      email: '',
      companyName: '',
    },
    freelancerInfo: {
      fullName: '',
      email: '',
    },
    projectDetails: {
      title: '',
      description: '',
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 1)), // Default to tomorrow
      deliverables: [],
    },
    payment: {
      amount: '',
      method: '',
      terms: '',
    },
    additionalTerms: '',
    status: 'draft',
  });

  const [newDeliverable, setNewDeliverable] = useState('');
  const [activeStep, setActiveStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailErrors, setEmailErrors] = useState({
    clientEmail: '',
    freelancerEmail: '',
  });

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const [section, field] = name.split('.');
    
    if (field) {
      setContractDetails((prevState) => ({
        ...prevState,
        [section]: {
          ...prevState[section],
          [field]: value,
        },
      }));

      // Validate email fields
      if (field === 'email') {
        const isValid = validateEmail(value);
        setEmailErrors((prev) => ({
          ...prev,
          [section === 'clientInfo' ? 'clientEmail' : 'freelancerEmail']: 
            value && !isValid ? 'Please enter a valid email address' : 
            !value ? 'Email is required' : '',
        }));
      }
    } else {
      setContractDetails((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const addDeliverable = () => {
    if (newDeliverable.trim()) {
      setContractDetails((prevState) => ({
        ...prevState,
        projectDetails: {
          ...prevState.projectDetails,
          deliverables: [...prevState.projectDetails.deliverables, newDeliverable.trim()]
        }
      }));
      setNewDeliverable('');
    }
  };

  const removeDeliverable = (index) => {
    setContractDetails((prevState) => ({
      ...prevState,
      projectDetails: {
        ...prevState.projectDetails,
        deliverables: prevState.projectDetails.deliverables.filter((_, i) => i !== index)
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
  
    try {
      // Validate bidId is present
      if (!bidId) {
        throw new Error("Missing bid ID. Cannot create contract.");
      }
      
      // Validate emails before submission
      if (!validateEmail(contractDetails.clientInfo.email) || 
          !validateEmail(contractDetails.freelancerInfo.email)) {
        throw new Error("Please provide valid email addresses for both client and freelancer.");
      }
      
      // Create a copy of the contract details to modify
      const contractToSubmit = {...contractDetails, bidId};
      
      // Ensure end date is at least 1 millisecond later than start date
      const startDate = new Date(contractToSubmit.projectDetails.startDate);
      let endDate = new Date(contractToSubmit.projectDetails.endDate);
      
      // If they're somehow the same or endDate is earlier, set it to 1 day later
      if (endDate <= startDate) {
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 1);
        contractToSubmit.projectDetails.endDate = endDate;
      }
  
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:4001/api/contracts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(contractToSubmit)
      });
  
      if (response.ok) {
        const data = await response.json();
        alert('Contract successfully sent to freelancer!');
        console.log('Contract created and sent:', data);
        navigate('/dashboard'); // Redirect after success
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create and send contract');
      }
    } catch (error) {
      console.error('Error creating contract:', error);
      alert(error.message || 'Failed to send contract. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    // Validate emails before proceeding to next step
    if (activeStep === 1) {
      if (!contractDetails.clientInfo.email) {
        setEmailErrors((prev) => ({
          ...prev,
          clientEmail: 'Email is required',
        }));
        return;
      }
      if (!validateEmail(contractDetails.clientInfo.email)) {
        setEmailErrors((prev) => ({
          ...prev,
          clientEmail: 'Please enter a valid email address',
        }));
        return;
      }
    }
    if (activeStep === 2) {
      if (!contractDetails.freelancerInfo.email) {
        setEmailErrors((prev) => ({
          ...prev,
          freelancerEmail: 'Email is required',
        }));
        return;
      }
      if (!validateEmail(contractDetails.freelancerInfo.email)) {
        setEmailErrors((prev) => ({
          ...prev,
          freelancerEmail: 'Please enter a valid email address',
        }));
        return;
      }
    }
    setActiveStep(prev => Math.min(prev + 1, 4));
  };

  const prevStep = () => setActiveStep(prev => Math.max(prev - 1, 1));

  // Get today's date at midnight for date comparisons
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-center mb-8 text-blue-800">Professional Service Contract</h1>
      
      <div className="mb-6">
        <div className="flex justify-between mb-4">
          {[1, 2, 3, 4].map(step => (
            <div 
              key={step} 
              className={`flex-1 text-center ${activeStep >= step ? 'text-blue-600' : 'text-gray-400'}`}
            >
              <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-1 ${activeStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                {step}
              </div>
              <span className="text-sm">
                {step === 1 && "Client"}
                {step === 2 && "Freelancer"}
                {step === 3 && "Project"}
                {step === 4 && "Payment"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 1: Client Information */}
        {activeStep === 1 && (
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Client Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="clientInfo.fullName"
                  value={contractDetails.clientInfo.fullName}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  name="clientInfo.email"
                  value={contractDetails.clientInfo.email}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500 ${emailErrors.clientEmail ? 'border-red-500' : 'border-gray-300'}`}
                  required
                />
                {emailErrors.clientEmail && (
                  <p className="text-red-500 text-sm mt-1">{emailErrors.clientEmail}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name (Optional)</label>
                <input
                  type="text"
                  name="clientInfo.companyName"
                  value={contractDetails.clientInfo.companyName}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Freelancer Information */}
        {activeStep === 2 && (
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Freelancer Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="freelancerInfo.fullName"
                  value={contractDetails.freelancerInfo.fullName}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                <input
                  type="email"
                  name="freelancerInfo.email"
                  value={contractDetails.freelancerInfo.email}
                  onChange={handleChange}
                  className={`w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500 ${emailErrors.freelancerEmail ? 'border-red-500' : 'border-gray-300'}`}
                  required
                />
                {emailErrors.freelancerEmail && (
                  <p className="text-red-500 text-sm mt-1">{emailErrors.freelancerEmail}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Project Details */}
        {activeStep === 3 && (
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Project Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
                <input
                  type="text"
                  name="projectDetails.title"
                  value={contractDetails.projectDetails.title}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Description</label>
                <textarea
                  name="projectDetails.description"
                  value={contractDetails.projectDetails.description}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 h-32"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <DatePicker
                    selected={contractDetails.projectDetails.startDate}
                    onChange={(date) => {
                      setContractDetails((prevState) => {
                        // If end date is not after new start date, set end date to day after start date
                        let newEndDate = prevState.projectDetails.endDate;
                        const dayAfter = new Date(date);
                        dayAfter.setDate(date.getDate() + 1);
                        
                        if (prevState.projectDetails.endDate <= date) {
                          newEndDate = dayAfter;
                        }
                        
                        return {
                          ...prevState,
                          projectDetails: {
                            ...prevState.projectDetails,
                            startDate: date,
                            endDate: newEndDate
                          }
                        };
                      });
                    }}
                    minDate={today}
                    dateFormat="yyyy-MM-dd"
                    className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <DatePicker
                    selected={contractDetails.projectDetails.endDate}
                    onChange={(date) => {
                      setContractDetails((prevState) => ({
                        ...prevState,
                        projectDetails: {
                          ...prevState.projectDetails,
                          endDate: date
                        }
                      }));
                    }}
                    minDate={new Date(contractDetails.projectDetails.startDate.getTime() + 86400000)} // +1 day in milliseconds
                    dateFormat="yyyy-MM-dd"
                    className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deliverables</label>
                <div className="flex">
                  <input
                    type="text"
                    value={newDeliverable}
                    onChange={(e) => setNewDeliverable(e.target.value)}
                    className="flex-1 p-2 border border-gray-300 rounded-l focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add a deliverable"
                  />
                  <button
                    type="button"
                    onClick={addDeliverable}
                    className="bg-blue-600 text-white px-4 rounded-r hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                <ul className="mt-2 space-y-1">
                  {contractDetails.projectDetails.deliverables.map((deliverable, index) => (
                    <li key={index} className="flex items-center bg-white p-2 rounded border">
                      <span className="flex-1">{deliverable}</span>
                      <button
                        type="button"
                        onClick={() => removeDeliverable(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Payment Details */}
        {activeStep === 4 && (
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Payment Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 text-gray-500 bg-gray-100 rounded-l-md border border-r-0 border-gray-300">
                    ₹
                  </span>
                  <input
                    type="number"
                    name="payment.amount"
                    value={contractDetails.payment.amount}
                    onChange={handleChange}
                    className="flex-1 p-2 border border-gray-300 rounded-r focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                <select
                  name="payment.method"
                  value={contractDetails.payment.method}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select payment method</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Razorpay">Razorpay</option>
                  <option value="UPI">UPI</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Crypto">Cryptocurrency</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Terms</label>
                <select
                  name="payment.terms"
                  value={contractDetails.payment.terms}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select payment terms</option>
                  <option value="Full payment upfront">Full payment upfront</option>
                  <option value="50% upfront, 50% on completion">50% upfront, 50% on completion</option>
                </select>
              </div>
            </div>

            <h3 className="text-lg font-medium mt-6 mb-2">Additional Terms & Conditions</h3>
            <textarea
              name="additionalTerms"
              value={contractDetails.additionalTerms}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 h-32"
              placeholder="Specify any additional terms, conditions, or special arrangements..."
            />
          </div>
        )}

        <div className="flex justify-between">
          {activeStep > 1 && (
            <button
              type="button"
              onClick={prevStep}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Previous
            </button>
          )}
          
          {activeStep < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              className="ml-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting || emailErrors.clientEmail || emailErrors.freelancerEmail}
              className="ml-auto px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Sending...' : 'Send Contract to Freelancer'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ContractForm;