import http from "@/api/httpservice";

const categoryService = {
  getAll: async () => {
    return await http.get("/category");
  },
  create: async (data) => {
    return await http.post("/category", data);
  },
  update: async (id, data) => {
    return await http.put(`/category/${id}`, data);
  },
  delete: async (id) => {
    return await http.delete(`/category/${id}`);
  },
};

export default categoryService;
