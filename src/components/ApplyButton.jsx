import { useState } from "react";
import axios from "axios";

const ApplyButton = ({ jobId }) => {
  const [bidAmount, setBidAmount] = useState("");
  const [timeline, setTimeline] = useState("");
  const [proposal, setProposal] = useState("");

  const applyForJob = async () => {
    const token = localStorage.getItem("token");
    await axios.post(`https://linksphere-backend-jkws.onrender.com/api/jobs/${jobId}/bid`, { bidAmount, timeline, proposal }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    alert("Bid submitted!");
  };

  return (
    <div>
      <input type="number" placeholder="Bid Amount ($)" onChange={(e) => setBidAmount(e.target.value)} />
      <input type="text" placeholder="Timeline (e.g., 7 days)" onChange={(e) => setTimeline(e.target.value)} />
      <textarea placeholder="Proposal Message" onChange={(e) => setProposal(e.target.value)} />
      <button onClick={applyForJob} className="bg-green-500 text-white px-4 py-2 rounded">Apply</button>
    </div>
  );
};

export default ApplyButton;
