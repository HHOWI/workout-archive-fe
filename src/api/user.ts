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

export const updateProfileImage = async (formData: FormData) => {
  return await instance.post("/profile-image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
