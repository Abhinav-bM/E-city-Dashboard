import axios from "axios";

// Create Axios instance
const http = axios.create({
  baseURL: "/api",
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor
http.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor
http.interceptors.response.use(
  (response) => {
    // If the response is a blob (like PDF download), return the data directly
    if (response.config.responseType === "blob") {
      return response.data;
    }

    // Automatically extract and set CSRF token if present in any successful response
    const xsrfToken = response.data?.data?.xsrfToken || response.data?.xsrfToken;
    if (xsrfToken) {
      http.defaults.headers.common["X-XSRF-TOKEN"] = xsrfToken;
      // Also sync with raw axios for initial session/CSRF handshakes
      axios.defaults.headers.common["X-XSRF-TOKEN"] = xsrfToken;
    }

    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and not already retrying
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/admin/auth/refresh") &&
      !originalRequest.url.includes("/admin/auth/login")
    ) {
      originalRequest._retry = true;

      try {
        // Attempt silent token refresh
        // Handled automatically by success interceptor above
        await axios.post(
          "/api/admin/auth/refresh",
          {},
          { withCredentials: true },
        );

        // Success! The interceptor above updated the header in http.defaults
        // So we retry the original request with the new header
        originalRequest.headers["X-XSRF-TOKEN"] =
          http.defaults.headers.common["X-XSRF-TOKEN"];

        return http(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login unless _noRedirect is specified
        console.error("Session expired:", refreshError);

        if (typeof window !== "undefined" && !originalRequest._noRedirect) {
          const currentPath = window.location.pathname;
          // Avoid redirect loop if already on login page
          if (!currentPath.includes("/auth/login")) {
            window.location.href = "/auth/login";
          }
        }
        return Promise.reject(refreshError);
      }
    }

    console.error("API Error:", error?.response?.data || error.message);
    return Promise.reject(error.response?.data || error.message);
  },
);

export default http;
