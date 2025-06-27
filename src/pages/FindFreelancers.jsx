import React, { useEffect, useState } from "react";
import axios from "axios";
import FreelancerCard from "../components/FreelancerCard";
import "./FindFreelancers.css";

const FindFreelancers = () => {
  const [freelancers, setFreelancers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchFreelancers = async () => {
      try {
        const response = await axios.get("http://localhost:4001/api/freelancers");
        setFreelancers(response.data);
      } catch (error) {
        console.error("Error fetching freelancers:", error);
      }
    };

    fetchFreelancers();
  }, []);

  const filteredFreelancers = freelancers.filter((freelancer) =>
    freelancer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="find-freelancers-container">
      <h1>Find Freelancers</h1>

      <input
        type="text"
        className="search-bar"
        placeholder="Search for freelancers..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />


      <div className="freelancer-grid">
      {filteredFreelancers.length > 0 ? (
        filteredFreelancers.map((freelancer) => (
  <FreelancerCard key={freelancer._id} freelancer={freelancer} />
        ))
      ) : (
        <p className="no-results">No freelancers found</p>
      )}
      </div>
    </div>
  );
};

export default FindFreelancers;
