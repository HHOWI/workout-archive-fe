import { userAPI } from "./axiosConfig";
import { LoginDTO } from "../dtos/UserDTO";

export const loginUserAPI = async (loginDTO: LoginDTO) => {
  return await userAPI.post("/login", loginDTO);
};

export const logoutUserAPI = async () => {
  return await userAPI.post("/logout");
};

export const updateProfileImageAPI = async (formData: FormData) => {
  return await userAPI.post("/profile-image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// 토큰 유효성 확인 및 사용자 정보 가져오기
export const verifyTokenAPI = async () => {
  return await userAPI.get("/verify-token");
};

export const getProfileImageAPI = async (userNickname: string) => {
  const response = await userAPI.get(`/profile-image/${userNickname}`);
  return response.data;
};
