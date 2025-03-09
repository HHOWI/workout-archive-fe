import { registerAPI } from "./axiosConfig";

export const checkUserId = async (userId: string) => {
  return await registerAPI.get("/check-id", { params: { userId } });
};

export const checkUserEmail = async (userEmail: string) => {
  return await registerAPI.get("/check-email", { params: { userEmail } });
};

export const checkUserNickname = async (userNickname: string) => {
  return await registerAPI.get("/check-nickname", { params: { userNickname } });
};

export const registerUser = async (userData: {
  userId: string;
  userPw: string;
  userEmail: string;
  userNickname: string;
}) => {
  return await registerAPI.post("/register", userData);
};

export const verifyEmail = async (token: string) => {
  return await registerAPI.get("/verify-email", {
    params: { token },
  });
};
