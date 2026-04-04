import http from "../api/httpservice";

const authService = {
  /**
   * Login the admin
   * @param {string} email
   * @param {string} password
   */
  login: async (email, password, options = {}) => {
    return await http.post("/admin/auth/login", { email, password }, options);
  },

  /**
   * Logout the admin
   */
  logout: async (options = {}) => {
    return await http.post("/admin/auth/logout", {}, options);
  },

  /**
   * Get current admin profile
   */
  getMe: async (options = {}) => {
    return await http.get("/admin/auth/me", options);
  },

  /**
   * Refresh the access token
   */
  refresh: async (options = {}) => {
    return await http.post("/admin/auth/refresh", {}, options);
  },

  /**
   * Initial CSRF setup
   */
  getCsrf: async (options = {}) => {
    return await http.get("/admin/auth/csrf", options);
  },
};

export default authService;
