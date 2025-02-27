import axios from "axios";
import { UserDTO } from "../dtos/UserDTO";

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL + "/users",
  withCredentials: true,
});

export const loginUser = async (userDTO: UserDTO) => {
  return await instance.post("/login", userDTO);
};

export const logoutUser = async () => {
  return await instance.post("/logout");
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
  return await instance.get("/verify-email", {
    params: { token },
  });
};

export const updateProfileImage = async (formData: FormData) => {
  return await instance.post("/profile-image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
