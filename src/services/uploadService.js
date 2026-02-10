import http from "@/api/httpservice";

const uploadService = {
  uploadImage: async (formData) => {
    return await http.post("/upload/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

export default uploadService;
