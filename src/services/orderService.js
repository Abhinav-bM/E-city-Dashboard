import http from "@/api/httpservice";

const orderService = {
  getAll: async (params) => {
    // params: { status, page, limit }
    return await http.get("/order", { params });
  },
  getById: async (id) => {
    return await http.get(`/order/${id}`);
  },
  updateStatus: async (id, status) => {
    return await http.patch(`/order/${id}/status`, { status });
  },
  downloadInvoice: async (id) => {
    return await http.get(`/order/${id}/invoice`, { responseType: "blob" });
  },
};

export default orderService;
