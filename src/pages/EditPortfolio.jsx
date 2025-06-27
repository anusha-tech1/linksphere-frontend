// // pages/EditPortfolio.js
// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axios from 'axios';

// const EditPortfolio = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();

//   const [freelancer, setFreelancer] = useState({
//     name: '',
//     role: '',
//     skills: '',
//     portfolioLink: '',
//     image: null
//   });

//   useEffect(() => {
//     axios.get(`https://linksphere-backend-jkws.onrender.com/api/freelancers/${id}`)
//       .then(response => {
//         const { name, role, skills, portfolioLink } = response.data;
//         setFreelancer({
//           name,
//           role,
//           skills: skills.join(', '),
//           portfolioLink
//         });
//       })
//       .catch(error => console.error('Error fetching freelancer:', error));
//   }, [id]);

//   const handleChange = (e) => {
//     setFreelancer({ ...freelancer, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const updatedData = {
//       name: freelancer.name,
//       role: freelancer.role,
//       skills: freelancer.skills.split(',').map(skill => skill.trim()),
//       portfolioLink: freelancer.portfolioLink
//     };

//     try {
//       await axios.put(`https://linksphere-backend-jkws.onrender.com/api/freelancers/${id}`, updatedData);
//       alert('Portfolio updated successfully!');
//       navigate(`/portfolio/${id}`);
//     } catch (error) {
//       console.error('Error updating portfolio:', error);
//     }
//   };

//   return (
//     <div>
//       <h2>Edit Portfolio</h2>
//       <form onSubmit={handleSubmit}>
//         <input type="text" name="name" value={freelancer.name} onChange={handleChange} required />
//         <input type="text" name="role" value={freelancer.role} onChange={handleChange} required />
//         <input type="text" name="skills" value={freelancer.skills} onChange={handleChange} required />
//         <input type="url" name="portfolioLink" value={freelancer.portfolioLink} onChange={handleChange} />
//         <button type="submit">Save Changes</button>
//       </form>
//     </div>
//   );
// };

// export default EditPortfolio;
