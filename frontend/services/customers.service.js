import api from "../src/api/axios";

export const getCustomers = async (companyId) => {
  const res = await api.get(`/customers?companyId=${companyId}`);
  return res.data;
};

export const createCustomer = async (payload) => {
  try {
    const res = await api.post("/customers", payload);
    return res.data;
  } catch (err) {
    console.error("CREATE CUSTOMER ERROR:", err.response?.data);
    throw err;
  }
};

export const updateCustomer = async (id, payload) => {
  try {
    const res = await api.put(`/customers/${id}`, payload);
    return res.data;
  } catch (err) {
    console.error("UPDATE CUSTOMER ERROR:", err.response?.data);
    throw err;
  }
};

export const deleteCustomer = async (id) => {
  try {
    const res = await api.delete(`/customers/${id}`);
    return res.data;
  } catch (err) {
    console.error("DELETE CUSTOMER ERROR:", err.response?.data);
    throw err;
  }
};
