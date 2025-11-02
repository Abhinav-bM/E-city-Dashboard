import httpService from "./httpservice";

// Add new product
export const addProduct = async (data) => {
  return await httpService.post("/product/create-product", data);
};

// Get all products
export const getAllProducts = async () => {
  return await httpService.get("/product/all");
};
