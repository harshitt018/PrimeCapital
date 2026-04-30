import api from "../src/api/axios";

export const getMyCompany = async () => {
  const res = await api.get("/company");
  return res.data;
};

export const saveCompany = async (data) => {
  const res = await api.post("/company", data);
  return res.data;
};
