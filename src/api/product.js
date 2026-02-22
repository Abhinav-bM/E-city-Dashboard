import httpService from "./httpservice";

// Add new product
export const addProduct = async (data) => {
  return await httpService.post("/product/", data);
};

// Update product
export const updateProduct = async (id, data) => {
  return await httpService.put(`/product/${id}`, data);
};

// Get product by base ID (for editing)
export const getProductByBaseId = async (id) => {
  return await httpService.get(`/product/base/${id}`);
};

// Get all products
export const getAllProducts = async (params) => {
  return await httpService.get("/product/", { params });
};
