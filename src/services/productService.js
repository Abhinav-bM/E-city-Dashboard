import http from "@/api/httpservice";

const productService = {
  getAll: async (params) => {
    return await http.get("/product", { params });
  },
  getBySlug: async (slug) => {
    return await http.get(`/product/${slug}`);
  },
  getById: async (id) => {
    return await http.get(`/product/base/${id}`);
  },
  create: async (data) => {
    return await http.post("/product", data);
  },
  update: async (id, data) => {
    return await http.put(`/product/${id}`, data);
  },
  delete: async (id) => {
    return await http.delete(`/product/${id}`);
  },
  // Add other methods as needed
};

export default productService;
