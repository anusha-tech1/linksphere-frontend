import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const EditProfile = () => {
  const { id } = useParams(); 
  const [userData, setUserData] = useState({
    name: "",
    role: "",
    skills: "",
    portfolioLink: "",
    image: null, 
    contactInfo: {
      email: "",
      phone: "",
      location: "",
      github: "",
    },
  });

  useEffect(() => {
  
    axios
      .get(`http://localhost:4001/api/freelancers/${id}`)
      .then((res) => {
        setUserData({
          ...res.data,
          skills: res.data.skills ? res.data.skills.join(", ") : "",
          contactInfo: res.data.contactInfo || {
            email: "",
            phone: "",
            location: "",
            github: "",
          }, 
        });
      })
      .catch((err) => console.error("Error fetching data:", err));
  }, [id]);

  const handleChange = (e) => {
    setUserData({ ...userData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setUserData({ ...userData, image: e.target.files[0] });
  };

  const handleContactChange = (e) => {
    setUserData({
      ...userData,
      contactInfo: {
        ...userData.contactInfo,
        [e.target.name]: e.target.value,
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You must be logged in to update your profile.");
        return;
      }

      
      const formData = new FormData();
      formData.append("name", userData.name);
      formData.append("role", userData.role);
      formData.append(
        "skills",
        userData.skills.split(",").map((skill) => skill.trim())
      );
      formData.append("portfolioLink", userData.portfolioLink);

    
      formData.append("contactInfo[email]", userData.contactInfo.email);
      formData.append("contactInfo[phone]", userData.contactInfo.phone);
      formData.append("contactInfo[location]", userData.contactInfo.location);
      formData.append("contactInfo[github]", userData.contactInfo.github);

      
      if (userData.image && typeof userData.image === "object") {
        formData.append("image", userData.image);
      }

      await axios.put(`http://localhost:4001/api/freelancers/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data", 
        },
      });

      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <div className="container mx-auto py-10 px-6">
      <h2 className="text-3xl font-bold text-center mb-6">Edit Profile</h2>
      <form onSubmit={handleSubmit} className="max-w-lg mx-auto">
        <div className="mb-4">
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            name="name"
            value={userData.name}
            onChange={handleChange}
            className="w-full border px-4 py-2"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium">Role</label>
          <input
            type="text"
            name="role"
            value={userData.role}
            onChange={handleChange}
            className="w-full border px-4 py-2"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium">
            Skills (comma-separated)
          </label>
          <input
            type="text"
            name="skills"
            value={userData.skills}
            onChange={handleChange}
            className="w-full border px-4 py-2"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium">Portfolio Link</label>
          <input
            type="text"
            name="portfolioLink"
            value={userData.portfolioLink}
            onChange={handleChange}
            className="w-full border px-4 py-2"
          />
        </div>

        <div className="border-t pt-4">
          <h3 className="text-lg font-semibold mb-2">Contact Information</h3>

          <div className="mb-4">
            <label className="block text-sm font-medium">Email</label>
            <input
              type="email"
              name="email"
              value={userData.contactInfo.email}
              onChange={handleContactChange}
              className="w-full border px-4 py-2"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium">Phone</label>
            <input
              type="tel"
              name="phone"
              value={userData.contactInfo.phone}
              onChange={handleContactChange}
              className="w-full border px-4 py-2"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium">Location</label>
            <input
              type="text"
              name="location"
              value={userData.contactInfo.location}
              onChange={handleContactChange}
              className="w-full border px-4 py-2"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium">GitHub Profile</label>
            <input
              type="url"
              name="github"
              value={userData.contactInfo.github}
              onChange={handleContactChange}
              className="w-full border px-4 py-2"
              placeholder="https://github.com/username"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium">Profile Image</label>
          <input
            type="file"
            name="image"
            onChange={handleFileChange}
            className="w-full border px-4 py-2"
          />
        </div>

        <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
