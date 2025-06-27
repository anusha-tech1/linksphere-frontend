import React from "react";
import { useNavigate } from "react-router-dom";
import { FaEdit } from "react-icons/fa"; 
import "./FreelancerCard.css";

const FreelancerCard = ({ freelancer }) => {
const navigate = useNavigate();
const loggedInUser = JSON.parse(localStorage.getItem("user"));


    const handleEditClick = () => {
    navigate(`/edit-profile/${freelancer._id}`); 
 };

 
 const handleContactClick = () => {
 navigate(`/contact/${freelancer._id}`); 
 };

 
 console.log("Logged-in User ID:", loggedInUser?.id);
 console.log("Freelancer User ID:", freelancer?.userId);

 return (
     <div className="freelancer-card">
     {loggedInUser && String(loggedInUser.id) === String(freelancer.userId) && (
     <FaEdit className="edit-icon" onClick={handleEditClick} />
     )}

    <img
        src={
            freelancer.image
             ? `http://localhost:4001/uploads/${freelancer.image}`
            : "/default-avatar.png"
         }
        alt={freelancer.name}
        className="freelancer-card-image"s
     />
      <h2>{freelancer.name}</h2>
     <p>
     <strong>Role:</strong> {freelancer.role}
     </p>
     <p>
     <strong>Skills:</strong> {freelancer.skills.join(", ")}
     </p>
     <p>
     <strong>Portfolio:</strong>{" "}
     <a
         href={freelancer.portfolioLink}
         target="_blank"
         rel="noopener noreferrer"
     >
     {freelancer.portfolioLink}
     </a>
     </p>
      <button className="contact-button" onClick={handleContactClick}>
     Contact
     </button>
     </div>
 );
};

export default FreelancerCard;
