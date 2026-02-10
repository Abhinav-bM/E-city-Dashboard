import http from "@/api/httpservice";

const brandService = {
  getAll: async () => {
    return await http.get("/brand");
  },
  create: async (data) => {
    return await http.post("/brand", data);
  },
};

export default brandService;
