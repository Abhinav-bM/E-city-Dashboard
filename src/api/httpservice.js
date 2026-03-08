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
    // but DON'T extract further if it's already a Blob
    if (response.config.responseType === "blob") {
      return response.data;
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
        // Attempt to refresh the token using a relative path
        const refreshRes = await axios.post(
          "/api/admin/auth/refresh",
          {},
          { withCredentials: true },
        );

        const newCsrf =
          refreshRes.data?.data?.xsrfToken || refreshRes.data?.xsrfToken;
        if (newCsrf) {
          http.defaults.headers.common["X-XSRF-TOKEN"] = newCsrf;
        }

        // Retry the original request
        return http(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login or handle session expiration
        console.error("Session expired:", refreshError);

        if (typeof window !== "undefined") {
          const currentPath = window.location.pathname;
          // Avoid redirect loop if already on login page
          if (!currentPath.includes("/auth/login")) {
            window.location.href = "/auth/login";
          }
        }
        return Promise.reject(refreshError);
      }
    }

    // Still reject other 401s (e.g. from login itself) but don't loop
    if (error.response?.status === 401 && typeof window !== "undefined") {
      const currentPath = window.location.pathname;
      if (
        !currentPath.includes("/auth/login") &&
        !originalRequest.url.includes("/admin/auth/login")
      ) {
        // Only redirect if not already on login and not a login request
        // window.location.href = "/auth/login";
      }
    }

    console.error("API Error:", error?.response?.data || error.message);
    return Promise.reject(error.response?.data || error.message);
  },
);

export default http;
