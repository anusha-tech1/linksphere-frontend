import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; 
import axios from "axios";
import jsPDF from "jspdf";

const ViewContractPage = () => {
  const { contractId } = useParams();
  const navigate = useNavigate();
  const [contract, setContract] = useState(null);
  const [bid, setBid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState("");
  
  useEffect(() => {
    const fetchContractDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const storedUserRole = localStorage.getItem("userRole");
        
        if (!token) {
          setError("User not authenticated");
          setLoading(false);
          return;
        }
        
        setUserRole(storedUserRole);
        
        // Fetch contract details
        const contractRes = await axios.get(
          `https://linksphere-backend-jkws.onrender.com/api/contracts/${contractId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        setContract(contractRes.data);
        
        // Find associated bid
        try {
          const bidsEndpoint = storedUserRole === "client"
             ? "https://linksphere-backend-jkws.onrender.com/api/bids/freelancers-bids"
             : "https://linksphere-backend-jkws.onrender.com/api/bids/my-bids";
          
          const myBidsRes = await axios.get(
            bidsEndpoint,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          
          const associatedBid = myBidsRes.data.find(
            bid => bid.contractId === contractId
          );
          
          if (associatedBid) {
            setBid(associatedBid);
          }
        } catch (err) {
          console.error("Error fetching associated bid:", err);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching contract details:", err);
        setError("Failed to load contract details");
        setLoading(false);
      }
    };

    fetchContractDetails();
  }, [contractId]);

  const formatDate = (dateString) => {
    if (!dateString || dateString === "Invalid Date") return "Not specified";
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const downloadContract = () => {
    if (!contract) return;

    const doc = new jsPDF();
    const margin = 20;
    const pageWidth = 210;
    const pageHeight = 297;
    const maxWidth = pageWidth - 2 * margin;
    let currentY = 20;

    // Helper function to check if we need a new page
    const checkPageBreak = (neededHeight) => {
      if (currentY + neededHeight > pageHeight - margin) {
        doc.addPage();
        currentY = margin;
        return true;
      }
      return false;
    };

    // Helper function to add text with proper spacing
    const addText = (text, options = {}) => {
      const {
        x = margin,
        fontSize = 10,
        fontStyle = 'normal',
        align = 'left',
        maxWidth: textMaxWidth = maxWidth,
        lineHeight = 1.2
      } = options;

      doc.setFont("helvetica", fontStyle);
      doc.setFontSize(fontSize);
      
      const textLines = doc.splitTextToSize(text, textMaxWidth);
      const textHeight = textLines.length * fontSize * 0.35 * lineHeight;
      
      checkPageBreak(textHeight + 5);
      
      if (align === 'center') {
        doc.text(textLines, pageWidth / 2, currentY, { align: 'center' });
      } else {
        doc.text(textLines, x, currentY);
      }
      
      currentY += textHeight + (fontSize * 0.1);
      return textHeight;
    };

    // Helper function to add a section header
    const addSectionHeader = (title) => {
      currentY += 8; // Extra space before section
      addText(title, { fontSize: 12, fontStyle: 'bold' });
      currentY += 3; // Space after header
    };

    // Helper function to add a field
    const addField = (label, value, indent = 0) => {
      if (!value || value === "Not specified" || value === "undefined") {
        value = "Not specified";
      }
      
      const fieldText = `${label}: ${value}`;
      addText(fieldText, { x: margin + indent, fontSize: 9 });
      currentY += 2; // Small gap between fields
    };

    // Helper function to add a horizontal line
    const addHorizontalLine = () => {
      checkPageBreak(10);
      doc.setLineWidth(0.5);
      doc.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 8;
    };

    try {
      // Title
      addText("SERVICE CONTRACT", { 
        fontSize: 18, 
        fontStyle: 'bold', 
        align: 'center' 
      });
      currentY += 5;

      // Contract metadata
      addText(`Contract ID: ${contract._id || 'N/A'}`, { fontSize: 8 });
      addText(`Generated on: ${new Date().toLocaleDateString()}`, { fontSize: 8 });
      addText(`Status: ${contract.status?.replace(/-/g, ' ').toUpperCase() || 'UNKNOWN'}`, { fontSize: 8 });
      
      addHorizontalLine();

      // Client Information Section
      addSectionHeader("CLIENT INFORMATION");
      addField("Full Name", contract.clientInfo?.fullName);
      addField("Email Address", contract.clientInfo?.email);
      addField("Company Name", contract.clientInfo?.companyName);

      // Freelancer Information Section
      addSectionHeader("FREELANCER INFORMATION");
      addField("Full Name", contract.freelancerInfo?.fullName);
      addField("Email Address", contract.freelancerInfo?.email);

      // Project Details Section
      addSectionHeader("PROJECT DETAILS");
      addField("Project Title", contract.projectDetails?.title);
      
      // Project description with proper wrapping
      if (contract.projectDetails?.description) {
        addText("Project Description:", { fontSize: 9, fontStyle: 'bold' });
        addText(contract.projectDetails.description, { 
          fontSize: 9, 
          x: margin + 5,
          lineHeight: 1.3 
        });
        currentY += 3;
      }
      
      addField("Start Date", formatDate(contract.projectDetails?.startDate));
      addField("End Date", formatDate(contract.projectDetails?.endDate));

      // Deliverables Section
      if (contract.projectDetails?.deliverables?.length > 0) {
        addSectionHeader("PROJECT DELIVERABLES");
        contract.projectDetails.deliverables.forEach((deliverable, index) => {
          addText(`${index + 1}. ${deliverable}`, { 
            x: margin + 5, 
            fontSize: 9,
            lineHeight: 1.2 
          });
          currentY += 1;
        });
      }

      // Payment Information Section
      addSectionHeader("PAYMENT TERMS");
      addField("Total Amount", `₹${contract.payment?.amount?.toLocaleString('en-IN') || '0'}`);
      addField("Payment Method", contract.payment?.method);
      addField("Payment Terms", contract.payment?.terms);
      addField("Payment Status", contract.paymentStatus);
      
      if (contract.advanceAmount) {
        addField("Advance Amount", `₹${contract.advanceAmount.toLocaleString('en-IN')}`);
      }
      
      if (contract.finalAmount) {
        addField("Final Amount", `₹${contract.finalAmount.toLocaleString('en-IN')}`);
      }

      // Additional Terms Section
      if (contract.additionalTerms) {
        addSectionHeader("ADDITIONAL TERMS & CONDITIONS");
        addText(contract.additionalTerms, { 
          fontSize: 9,
          lineHeight: 1.3,
          x: margin + 5 
        });
      }

      // Signature Section
      addSectionHeader("SIGNATURES");
      
      // Create signature boxes
      checkPageBreak(60);
      
      const signatureBoxWidth = (maxWidth - 20) / 2;
      const leftBoxX = margin;
      const rightBoxX = margin + signatureBoxWidth + 20;
      
      // Client signature box
      doc.rect(leftBoxX, currentY, signatureBoxWidth, 40);
      addText("CLIENT SIGNATURE", { x: leftBoxX + 5, fontSize: 9, fontStyle: 'bold' });
      currentY += 8;
      
      const clientStatus = contract.clientSigned ? "✓ SIGNED" : "PENDING";
      addText(`Status: ${clientStatus}`, { x: leftBoxX + 5, fontSize: 8 });
      addText(`Name: ${contract.clientInfo?.fullName || 'N/A'}`, { x: leftBoxX + 5, fontSize: 8 });
      
      if (contract.clientSigned) {
        addText(`Date: ${formatDate(contract.updatedAt)}`, { x: leftBoxX + 5, fontSize: 8 });
      }
      
      // Reset Y for freelancer box
      currentY -= 24;
      
      // Freelancer signature box
      doc.rect(rightBoxX, currentY, signatureBoxWidth, 40);
      addText("FREELANCER SIGNATURE", { x: rightBoxX + 5, fontSize: 9, fontStyle: 'bold' });
      currentY += 8;
      
      const freelancerStatus = contract.freelancerSigned ? "✓ SIGNED" : "PENDING";
      addText(`Status: ${freelancerStatus}`, { x: rightBoxX + 5, fontSize: 8 });
      addText(`Name: ${contract.freelancerInfo?.fullName || 'N/A'}`, { x: rightBoxX + 5, fontSize: 8 });
      
      if (contract.freelancerSigned) {
        addText(`Date: ${formatDate(contract.updatedAt)}`, { x: rightBoxX + 5, fontSize: 8 });
      }
      
      currentY += 20;

      // Change Requests Section (if any)
      if (contract.changeRequests?.length > 0) {
        addSectionHeader("CHANGE REQUEST HISTORY");
        contract.changeRequests.forEach((request, index) => {
          checkPageBreak(30);
          addText(`Change Request #${index + 1}`, { fontSize: 9, fontStyle: 'bold' });
          addField("Requested By", request.by);
          addField("Date", formatDate(request.timestamp));
          addField("Message", request.message);
          currentY += 3;
        });
      }

      // Footer
      checkPageBreak(20);
      addHorizontalLine();
      addText("This contract is electronically generated and valid without physical signature when both parties have digitally accepted the terms.", {
        fontSize: 7,
        align: 'center',
        x: pageWidth / 2
      });

      // Save the PDF
      doc.save(`contract-${contractId}.pdf`);
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("There was an error generating the PDF. Please try again.");
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      "sent-to-freelancer": "bg-blue-100 text-blue-800",
      "revision-requested": "bg-yellow-100 text-yellow-800",
      "pending-signatures": "bg-purple-100 text-purple-800",
      "active": "bg-green-100 text-green-800",
      "completed": "bg-gray-100 text-gray-800",
      "cancelled": "bg-red-100 text-red-800"
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusClasses[status] || "bg-gray-100 text-gray-800"}`}>
        {status?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
        <button 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => navigate(-1)}
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
          <p>Contract not found</p>
        </div>
        <button 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => navigate(-1)}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">View Contract</h1>
          <div className="flex space-x-2">
            {getStatusBadge(contract.status)}
            <button
              onClick={downloadContract}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Download Contract
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Back
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Contract Details</h2>
            <div className="space-y-3">
              <div>
                <span className="text-gray-600 font-medium">Contract ID:</span>
                <p>{contract._id || contract.id}</p>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Title:</span>
                <p>{contract.projectDetails?.title || "Not specified"}</p>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Description:</span>
                <p>{contract.projectDetails?.description || "No description provided"}</p>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Status:</span>
                <p>{contract.status?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Created On:</span>
                <p>{formatDate(contract.createdAt)}</p>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Project Terms</h2>
            <div className="space-y-3">
              <div>
                <span className="text-gray-600 font-medium">Start Date:</span>
                <p>{formatDate(contract.projectDetails?.startDate)}</p>
              </div>
              <div>
                <span className="text-gray-600 font-medium">End Date:</span>
                <p>{formatDate(contract.projectDetails?.endDate)}</p>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Payment Amount:</span>
                <p>₹{contract.payment?.amount?.toFixed(2) || "Not specified"}</p>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Payment Terms:</span>
                <p>{contract.payment?.terms || "Not specified"}</p>
              </div>
              <div>
                <span className="text-gray-600 font-medium">Payment Status:</span>
                <p>{contract.paymentStatus || "Not specified"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Parties</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded">
            <div>
              <h3 className="text-lg font-medium mb-2">Client</h3>
              <p><span className="text-gray-600 font-medium">Full Name:</span> {contract.clientInfo?.fullName || "Not specified"}</p>
              <p><span className="text-gray-600 font-medium">Email:</span> {contract.clientInfo?.email || "Not specified"}</p>
              <p><span className="text-gray-600 font-medium">Company:</span> {contract.clientInfo?.companyName || "Not specified"}</p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Freelancer</h3>
              <p><span className="text-gray-600 font-medium">Full Name:</span> {contract.freelancerInfo?.fullName || "Not specified"}</p>
              <p><span className="text-gray-600 font-medium">Email:</span> {contract.freelancerInfo?.email || "Not specified"}</p>
            </div>
          </div>
        </div>

        {contract.projectDetails?.deliverables?.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Deliverables</h2>
            <div className="bg-gray-50 p-4 rounded">
              <ul className="list-disc pl-5">
                {contract.projectDetails.deliverables.map((deliverable, index) => (
                  <li key={index}>{deliverable}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {contract.additionalTerms && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Additional Terms</h2>
            <div className="bg-gray-50 p-4 rounded">
              <p>{contract.additionalTerms}</p>
            </div>
          </div>
        )}

        {contract.changeRequests && contract.changeRequests.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Change Request History</h2>
            <div className="space-y-4">
              {contract.changeRequests.map((change, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded">
                  <p className="text-sm text-gray-500">Requested on {formatDate(change.timestamp)}</p>
                  <p className="mt-1 font-medium">By: {change.by}</p>
                  <p className="mt-1">Message: {change.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 border-t pt-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="flex flex-wrap gap-3">
            {contract.status === "revision-requested" && (
              <button
                onClick={() => navigate(`/review-contract-changes/${contractId}`)}
                className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              >
                Review Change Requests
              </button>
            )}
            
            {contract.status === "pending-signatures" && (
              <button
                onClick={() => navigate(`/sign-contract/${contractId}`)}
                className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                Sign Contract
              </button>
            )}
            
            {contract.status === "active" && userRole === "client" && (
              <button
                onClick={() => navigate(`/complete-contract/${contractId}`)}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Mark as Complete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewContractPage;