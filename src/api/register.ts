import { registerAPI } from "./axiosConfig";

export const checkUserIdAPI = async (userId: string) => {
  return await registerAPI.get("/check-id", { params: { userId } });
};

export const checkUserEmailAPI = async (userEmail: string) => {
  return await registerAPI.get("/check-email", { params: { userEmail } });
};

export const checkUserNicknameAPI = async (userNickname: string) => {
  return await registerAPI.get("/check-nickname", { params: { userNickname } });
};

export const registerUserAPI = async (userData: {
  userId: string;
  userPw: string;
  userEmail: string;
  userNickname: string;
}) => {
  return await registerAPI.post("/register", userData);
};

export const verifyEmailAPI = async (token: string) => {
  return await registerAPI.get("/verify-email", {
    params: { token },
  });
};
