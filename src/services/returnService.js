import http from "../api/httpservice";

// Fetch all returns (Admin)
export const getAllReturns = async () => {
  const response = await http.get("/return/all");
  return response; // { success, data: [...] }
};

// Update return status (Admin)
export const updateReturnStatus = async (returnId, status, adminNotes = "") => {
  const response = await http.put(`/return/${returnId}/status`, {
    status,
    adminNotes,
  });
  return response;
};
