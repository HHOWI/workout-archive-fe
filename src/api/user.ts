import axios from "axios";

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL + "/users",
});

export const loginUser = async (userId: string, userPw: string) => {
  return await instance.post("/login", { userId, userPw });
};

export const checkUserId = async (userId: string) => {
  return await instance.get("/check-id", { params: { userId } });
};

export const checkUserEmail = async (userEmail: string) => {
  return await instance.get("/check-email", { params: { userEmail } });
};

export const checkUserNickname = async (userNickname: string) => {
  return await instance.get("/check-nickname", { params: { userNickname } });
};

export const registerUser = async (userData: {
  userId: string;
  userPw: string;
  userEmail: string;
  userNickname: string;
}) => {
  return await instance.post("/register", userData);
};

export const verifyEmail = async (token: string) => {
  return await instance.get("/verify-email", { params: { token } });
};
