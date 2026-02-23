import httpService from "./httpservice";

export const getAllCustomers = async () => {
  return await httpService.get("/profile/all");
};
