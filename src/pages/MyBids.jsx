import React, { useEffect, useState } from "react";
import axios from "axios";
import { jsPDF } from "jspdf";
import Modal from "react-modal"; 

Modal.setAppElement('#root'); 

const MyBids = () => {
  const [bids, setBids] = useState([]);
  const [error, setError] = useState(null);
  const [selectedContract, setSelectedContract] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSigningContract, setIsSigningContract] = useState(false);
  const [acceptingContract, setAcceptingContract] = useState(false);

  useEffect(() => {
    fetchBids();
  }, []);

  const fetchBids = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("https://linksphere-backend-jkws.onrender.com/api/bids/my-bids", {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      console.log("Full bids response:", res.data);
      
      // Check the structure of each bid
      res.data.forEach(bid => {
        console.log(`Bid ID: ${bid._id}, Status: ${bid.status}`);
        console.log(`Contract ID exists: ${Boolean(bid.contractId)}`);
        if (bid.contractId) {
          console.log(`Contract data:`, bid.contractId);
        }
      });
      
      setBids(res.data);
    } catch (err) {
      console.error("Error fetching bids:", err);
      setError("Failed to load bids.");
    }
  };

  // Generate and download contract as PDF
  const generatePDF = (contract) => {
    if (!contract) return;

    const doc = new jsPDF();
    
    // Add header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text("SERVICE CONTRACT", 105, 20, { align: "center" });
    
    // Add contract information
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    
    // Client information
    doc.setFont('helvetica', 'bold');
    doc.text("Client Information:", 20, 40);
    doc.setFont('helvetica', 'normal');
    doc.text(`Full Name: ${contract.clientInfo?.fullName || 'N/A'}`, 20, 50);
    doc.text(`Email: ${contract.clientInfo?.email || 'N/A'}`, 20, 60);
    doc.text(`Company: ${contract.clientInfo?.companyName || 'N/A'}`, 20, 70);
    
    // Freelancer information
    doc.setFont('helvetica', 'bold');
    doc.text("Freelancer Information:", 20, 90);
    doc.setFont('helvetica', 'normal');
    doc.text(`Full Name: ${contract.freelancerInfo?.fullName || 'N/A'}`, 20, 100);
    doc.text(`Email: ${contract.freelancerInfo?.email || 'N/A'}`, 20, 110);
    
    // Project details
    doc.setFont('helvetica', 'bold');
    doc.text("Project Details:", 20, 130);
    doc.setFont('helvetica', 'normal');
    doc.text(`Title: ${contract.projectDetails?.title || 'N/A'}`, 20, 140);
    
    // Handle long descriptions with word wrap
    const description = contract.projectDetails?.description || 'N/A';
    const wrappedText = doc.splitTextToSize(description, 170);
    doc.text(wrappedText, 20, 150);
    
    // Calculate vertical position after description
    const nextY = 150 + (wrappedText.length * 7);
    
    // Project dates
    doc.text(`Start Date: ${new Date(contract.projectDetails?.startDate).toLocaleDateString() || 'N/A'}`, 20, nextY);
    doc.text(`End Date: ${new Date(contract.projectDetails?.endDate).toLocaleDateString() || 'N/A'}`, 20, nextY + 10);
    
    // Deliverables
    doc.setFont('helvetica', 'bold');
    doc.text("Deliverables:", 20, nextY + 30);
    doc.setFont('helvetica', 'normal');
    
    let deliverableY = nextY + 40;
    if (contract.projectDetails?.deliverables && contract.projectDetails.deliverables.length > 0) {
      contract.projectDetails.deliverables.forEach((item, index) => {
        doc.text(`• ${item}`, 25, deliverableY);
        deliverableY += 10;
      });
    } else {
      doc.text("No deliverables specified", 25, deliverableY);
    }
    
    // Payment details
    doc.setFont('helvetica', 'bold');
    doc.text("Payment Details:", 20, deliverableY + 20);
    doc.setFont('helvetica', 'normal');
    // Fix the formatting issue with the amount
    doc.text(`Amount: ₹${contract.payment?.amount || 'N/A'}`, 20, deliverableY + 30);
    doc.text(`Method: ${contract.payment?.method || 'N/A'}`, 20, deliverableY + 40);
    doc.text(`Terms: ${contract.payment?.terms || 'N/A'}`, 20, deliverableY + 50);
    
    // Additional terms
    if (contract.additionalTerms) {
      doc.setFont('helvetica', 'bold');
      doc.text("Additional Terms:", 20, deliverableY + 70);
      doc.setFont('helvetica', 'normal');
      const wrappedTerms = doc.splitTextToSize(contract.additionalTerms, 170);
      doc.text(wrappedTerms, 20, deliverableY + 80);
    }
    
    // // Add signature fields
    // const sigY = doc.internal.pageSize.getHeight() - 60;
    
    // doc.line(20, sigY, 100, sigY);
    // doc.text("Client Signature", 20, sigY + 10);
    
    // doc.line(110, sigY, 190, sigY);
    // doc.text("Freelancer Signature", 110, sigY + 10);
    
    // Save the PDF
    doc.save(`${contract.projectDetails?.title || 'contract'}_contract.pdf`);
  };

  // Fetch contract details
  const handleViewContract = async (contractId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:4001/api/contracts/${contractId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSelectedContract(res.data);
      setIsModalOpen(true);
    } catch (err) {
      console.error("Error fetching contract:", err);
      setError("Failed to load contract details.");
    }
  };

  // Sign the contract as freelancer
  const handleSignContract = async () => {
    try {
      setIsSigningContract(true);
      const token = localStorage.getItem("token");
      
      await axios.post(
        `http://localhost:4001/api/contracts/${selectedContract._id}/sign`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      // Refresh contract data
      const updatedContract = await axios.get(
        `http://localhost:4001/api/contracts/${selectedContract._id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSelectedContract(updatedContract.data);
      fetchBids();
      alert("Contract signed successfully!");
    } catch (err) {
      console.error("Error signing contract:", err);
      alert("Failed to sign contract. Please try again.");
    } finally {
      setIsSigningContract(false);
    }
  };

  // Accept the contract without signing yet
  const handleAcceptContract = async (contractId) => {
    try {
      setAcceptingContract(true);
      const token = localStorage.getItem("token");
      
      await axios.post(`http://localhost:4001/api/contracts/${contractId}/accept`, {
        acceptedBy: "freelancer"
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Refresh the bids list to show updated status
      fetchBids();
      
      alert("Contract accepted successfully!");
    } catch (err) {
      console.error("Error accepting contract:", err);
      alert("Failed to accept contract. Please try again.");
    } finally {
      setAcceptingContract(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-200 text-gray-800';
      case 'sent-to-freelancer':
        return 'bg-blue-200 text-blue-800';
      case 'revision-requested':
        return 'bg-orange-200 text-orange-800';
      case 'pending-signatures':
        return 'bg-purple-200 text-purple-800';
      case 'active':
        return 'bg-green-200 text-green-800';
      case 'completed':
        return 'bg-green-500 text-white';
      case 'accepted':
        return 'bg-teal-200 text-teal-800';
      default:
        return 'bg-gray-200 text-gray-800';
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <h2 className="text-2xl font-bold text-center mb-6">My Bids</h2>

      {error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : bids.length === 0 ? (
        <p className="text-center text-gray-500">No bids found. Start bidding on projects!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bids.map((bid) => (
            <div key={bid._id} className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="font-semibold text-lg truncate">{bid.job?.title || 'Untitled Job'}</h3>
              </div>
              
              <div className="p-4">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Your Bid:</span>
                    <span className="font-medium">₹{bid.amount}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      bid.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                      bid.status === 'accepted' ? 'bg-green-200 text-green-800' :
                      bid.status === 'rejected' ? 'bg-red-200 text-red-800' :
                      bid.status === 'contract-created' ? 'bg-blue-200 text-blue-800' :
                      'bg-gray-200 text-gray-800'
                    }`}>
                      {bid.status === 'contract-created' ? 'Contract Created' : bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                    </span>
                  </div>
                  
                  {bid.contractId && typeof bid.contractId === 'object' && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Contract:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(bid.contractId.status)}`}>
                        {bid.contractId.status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </span>
                    </div>
                  )}
                </div>
                
                {bid.status === 'contract-created' && (!bid.contractId || typeof bid.contractId !== 'object') ? (
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-sm text-yellow-600">
                      Contract was created but needs to refresh. 
                      <button 
                        onClick={fetchBids} 
                        className="underline ml-1 text-blue-500 hover:text-blue-700"
                      >
                        Refresh Now
                      </button>
                    </p>
                  </div>
                ) : bid.contractId && typeof bid.contractId === 'object' ? (
                  <div className="pt-3 border-t border-gray-200 flex flex-col space-y-2">
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors w-full"
                      onClick={() => handleViewContract(bid.contractId._id)}
                    >
                      View Contract
                    </button>
                    
                    {/* Accept button */}
                    {bid.contractId.status === 'sent-to-freelancer' && (
                      <button
                        className="bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors w-full"
                        onClick={() => handleAcceptContract(bid.contractId._id)}
                        disabled={acceptingContract}
                      >
                        {acceptingContract ? 'Accepting...' : 'Accept Contract'}
                      </button>
                    )}
                    
                    {/* <button
                      className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-md text-sm font-medium transition-colors w-full"
                      onClick={() => generatePDF(bid.contractId)}
                    >
                      Download PDF
                    </button> */}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic">No contract created yet.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      
      {/* Contract Details Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => {
          setIsModalOpen(false);
        }}
        contentLabel="Contract Details"
        className="max-w-4xl mx-auto mt-20 bg-white rounded-lg shadow-xl p-0 overflow-hidden"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center"
      >
        {selectedContract && (
          <div>
            {/* Modal Header */}
            <div className="bg-blue-600 text-white px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold">Contract Details</h3>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                }}
                className="text-white hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {/* Status Banner */}
              <div className={`mb-6 px-4 py-3 rounded-md ${getStatusBadgeClass(selectedContract.status)}`}>
                <div className="flex justify-between items-center">
                  <span className="font-medium">
                    Status: {selectedContract.status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </span>
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${selectedContract.clientSigned ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
                      Client {selectedContract.clientSigned ? 'Signed' : 'Unsigned'}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${selectedContract.freelancerSigned ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
                      Freelancer {selectedContract.freelancerSigned ? 'Signed' : 'Unsigned'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Contract Content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Client Information */}
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="font-semibold text-gray-800 mb-3 pb-1 border-b">Client Information</h4>
                  <div className="space-y-2">
                    <p><span className="text-gray-600">Name:</span> {selectedContract.clientInfo?.fullName}</p>
                    <p><span className="text-gray-600">Email:</span> {selectedContract.clientInfo?.email}</p>
                    {selectedContract.clientInfo?.companyName && (
                      <p><span className="text-gray-600">Company:</span> {selectedContract.clientInfo.companyName}</p>
                    )}
                  </div>
                </div>
                
                {/* Freelancer Information */}
                <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-semibold text-gray-800 mb-3 pb-1 border-b">Freelancer Information</h4>
                  <div className="space-y-2">
                    <p><span className="text-gray-600">Name:</span> {selectedContract.freelancerInfo?.fullName}</p>
                    <p><span className="text-gray-600">Email:</span> {selectedContract.freelancerInfo?.email}</p>
                  </div>
                </div>
                
                {/* Project Details */}
                <div className="bg-gray-50 p-4 rounded-md col-span-1 md:col-span-2">
                  <h4 className="font-semibold text-gray-800 mb-3 pb-1 border-b">Project Details</h4>
                  <div className="space-y-3">
                    <p><span className="text-gray-600">Title:</span> {selectedContract.projectDetails?.title}</p>
                    <div>
                      <span className="text-gray-600">Description:</span>
                      <p className="mt-1 text-sm">{selectedContract.projectDetails?.description}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <p><span className="text-gray-600">Start Date:</span> {formatDate(selectedContract.projectDetails?.startDate)}</p>
                      <p><span className="text-gray-600">End Date:</span> {formatDate(selectedContract.projectDetails?.endDate)}</p>
                    </div>
                    
                    {/* Deliverables */}
                    <div>
                      <span className="text-gray-600">Deliverables:</span>
                      {selectedContract.projectDetails?.deliverables && selectedContract.projectDetails.deliverables.length > 0 ? (
                        <ul className="list-disc list-inside mt-1 text-sm">
                          {selectedContract.projectDetails.deliverables.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-1 text-sm italic">No deliverables specified</p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Payment Details */}
                <div className="bg-gray-50 p-4 rounded-md col-span-1 md:col-span-2">
                  <h4 className="font-semibold text-gray-800 mb-3 pb-1 border-b">Payment Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <p><span className="text-gray-600">Amount:</span> ₹{selectedContract.payment?.amount}</p>
                    <p><span className="text-gray-600">Method:</span> {selectedContract.payment?.method}</p>
                    <p><span className="text-gray-600">Terms:</span> {selectedContract.payment?.terms}</p>
                  </div>
                </div>
                
                {/* Additional Terms */}
                {selectedContract.additionalTerms && (
                  <div className="bg-gray-50 p-4 rounded-md col-span-1 md:col-span-2">
                    <h4 className="font-semibold text-gray-800 mb-3 pb-1 border-b">Additional Terms</h4>
                    <p className="text-sm whitespace-pre-line">{selectedContract.additionalTerms}</p>
                  </div>
                )}
                
                {/* Change Request History - Keep this section to view existing change requests */}
                {selectedContract.changeRequests && selectedContract.changeRequests.length > 0 && (
                  <div className="bg-gray-50 p-4 rounded-md col-span-1 md:col-span-2">
                    <h4 className="font-semibold text-gray-800 mb-3 pb-1 border-b">Change Request History</h4>
                    <div className="space-y-3">
                      {selectedContract.changeRequests.map((request, index) => (
                        <div key={index} className="bg-white p-3 rounded border border-gray-200">
                          <div className="flex justify-between items-start">
                            <span className="font-medium text-sm">{request.requestedBy === 'client' ? 'Client' : 'Freelancer'} requested changes</span>
                            <span className="text-xs text-gray-500">{new Date(request.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm mt-2">{request.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="mt-8 space-y-4">
                {!selectedContract.freelancerSigned && (selectedContract.status === 'pending-signatures' || selectedContract.status === 'accepted') && (
                  <button
                    onClick={handleSignContract}
                    disabled={isSigningContract}
                    className="bg-green-500 hover:bg-green-600 text-white py-2 px-6 rounded-md font-medium transition-colors w-full"
                  >
                    {isSigningContract ? 'Signing...' : 'Sign Contract'}
                  </button>
                )}
                
                {selectedContract.status === 'sent-to-freelancer' && (
                  <button
                    onClick={() => handleAcceptContract(selectedContract._id)}
                    disabled={acceptingContract}
                    className="bg-teal-500 hover:bg-teal-600 text-white py-2 px-6 rounded-md font-medium transition-colors w-full"
                  >
                    {acceptingContract ? 'Accepting...' : 'Accept Contract'}
                  </button>
                )}
                
                <button
                  onClick={() => generatePDF(selectedContract)}
                  className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-md font-medium transition-colors w-full"
                >
                  Download as PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyBids;