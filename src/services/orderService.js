import http from "@/api/httpservice";

const orderService = {
  getAll: async (params) => {
    // params: { status, page, limit }
    return await http.get("/order", { params });
  },
  getById: async (id) => {
    return await http.get(`/order/admin/${id}`);
  },
  updateStatus: async (id, status, extraData = {}) => {
    return await http.patch(`/order/${id}/status`, { status, ...extraData });
  },
  downloadInvoice: async (id) => {
    return await http.get(`/order/admin/${id}/invoice`, { responseType: "blob" });
  },
};

export default orderService;
