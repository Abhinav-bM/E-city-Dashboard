import http from "../api/httpservice";

const extractAndSetCsrf = (data) => {
  const token = data?.data?.xsrfToken || data?.xsrfToken;
  if (token) {
    http.defaults.headers.common["X-XSRF-TOKEN"] = token;
  }
  return data;
};

const authService = {
  /**
   * Login the admin
   * @param {string} email
   * @param {string} password
   */
  login: async (email, password) => {
    const data = await http.post("/admin/auth/login", { email, password });
    return extractAndSetCsrf(data);
  },

  /**
   * Logout the admin
   */
  logout: async () => {
    return await http.post("/admin/auth/logout");
  },

  /**
   * Get current admin profile
   */
  getMe: async () => {
    return await http.get("/admin/auth/me");
  },

  /**
   * Refresh the access token
   */
  refresh: async () => {
    const data = await http.post("/admin/auth/refresh");
    return extractAndSetCsrf(data);
  },

  /**
   * Initial CSRF setup
   */
  getCsrf: async () => {
    const data = await http.get("/admin/auth/csrf");
    return extractAndSetCsrf(data);
  },
};

export default authService;
