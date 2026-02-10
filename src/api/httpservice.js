import axios from "axios";

// Create Axios instance
const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 10000, // Set request timeout (10 seconds)
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
http.interceptors.request.use(
  (config) => {
    // Add authorization token if available
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor
http.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error("API Error:", error?.response?.data || error.message);
    return Promise.reject(error.response?.data || error.message);
  },
);

export default http;
