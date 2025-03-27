import { publicAPI } from "./axiosConfig";

export const checkUserIdAPI = async (userId: string) => {
  return await publicAPI.get("/register/check-id", { params: { userId } });
};

export const checkUserEmailAPI = async (userEmail: string) => {
  return await publicAPI.get("/register/check-email", {
    params: { userEmail },
  });
};

export const checkUserNicknameAPI = async (userNickname: string) => {
  return await publicAPI.get("/register/check-nickname", {
    params: { userNickname },
  });
};

export const registerUserAPI = async (userData: {
  userId: string;
  userPw: string;
  userEmail: string;
  userNickname: string;
}) => {
  return await publicAPI.post("/register/register", userData);
};

export const verifyEmailAPI = async (token: string) => {
  return await publicAPI.get("/register/verify-email", {
    params: { token },
  });
};
