import client from "./client";

export const registerUser = (data) =>
  client.post("/auth/register", data);

export const loginUser = (data) =>
  client.post("/auth/login", data);

export const logoutUser = () => client.post("/auth/logout");

export const getCurrentUser = () =>
  client.post("/auth/current-user");

export const changeCurrentPassword = (data) =>
  client.post("/auth/change-password", data);

export const refreshAccessToken = () =>
  client.post("/auth/refresh-token");

export const verifyEmail = (verificationToken) =>
  client.get(`/auth/verify-email/${verificationToken}`);

export const resendEmailVerification = () =>
  client.post("/auth/resend-email-verification");

export const forgotPasswordRequest = (email) =>
  client.post("/auth/forgot-password", { email });

export const resetForgotPassword = (resetToken, newPassword) =>
  client.post(`/auth/reset-password/${resetToken}`, { newPassword });
