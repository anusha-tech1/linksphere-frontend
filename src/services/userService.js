import axios from "axios";

const API_URL = "https://linksphere-backend-jkws.onrender.com/api/users"; 


export const registerUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/register`, userData);
    return response.data;
  } catch (error) {
    console.error("Error during user registration:", error.response?.data || error.message);
    throw error;
  }
};
