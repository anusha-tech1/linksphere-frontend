import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://linksphere-backend-jkws.onrender.com", // Change to your backend API port
  withCredentials: true, // if you're using cookies/auth
});

export default axiosInstance;
