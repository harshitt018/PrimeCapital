import api from "../src/api/axios";

export const registerUser = (data) => api.post("/auth/register", data);

export const verifyRegisterOtp = (data) => api.post("/auth/verify-code", data);

export const resendRegisterOtp = (data) =>
  api.post("/auth/resend-register-code", data);

export const loginUser = async (data) => {
  const res = await api.post("/auth/login", data);

  // tokens save
  localStorage.setItem("accessToken", res.data.accessToken);
  localStorage.setItem("refreshToken", res.data.refreshToken);

  // user save
  localStorage.setItem("user", JSON.stringify(res.data.user));

  return res.data;
};

export const forgotPassword = (data) => api.post("/auth/forgot-password", data);

export const resetPassword = (data) => api.post("/auth/reset-password", data);

export const changePassword = async (data) => {
  const res = await api.post("/auth/change-password", data);
  return res.data;
};
