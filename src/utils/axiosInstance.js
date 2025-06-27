import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:4001", // Change to your backend API port
  withCredentials: true, // if you're using cookies/auth
});

export default axiosInstance;
