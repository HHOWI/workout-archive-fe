import { userAPI } from "./axiosConfig";
import { UserDTO } from "../dtos/UserDTO";

export const loginUser = async (userDTO: UserDTO) => {
  return await userAPI.post("/login", userDTO);
};

export const logoutUser = async () => {
  return await userAPI.post("/logout");
};

export const updateProfileImage = async (formData: FormData) => {
  return await userAPI.post("/profile-image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
