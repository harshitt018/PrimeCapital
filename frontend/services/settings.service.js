import api from "../src/api/axios";

export const getSettings = async () => {
  const res = await api.get("/settings");
  return res.data;
};

export const updateSettings = async (data) => {
  const res = await api.put("/settings", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  return res.data;
};

export const deleteCompany = async () => {
  const res = await api.delete("/settings/company");
  return res.data;
};
