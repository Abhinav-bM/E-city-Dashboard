import http from "../api/httpservice";

const authService = {
  /**
   * Login the admin
   * @param {string} email
   * @param {string} password
   */
  login: async (email, password) => {
    return await http.post("/admin/auth/login", { email, password });
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
    return await http.post("/admin/auth/refresh");
  },

  /**
   * Initial CSRF setup
   */
  getCsrf: async () => {
    return await http.get("/admin/auth/csrf");
  },
};

export default authService;
