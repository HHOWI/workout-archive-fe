import { publicAPI, authAPI } from "./axiosConfig";
import { LoginDTO } from "../dtos/UserDTO";

export const loginUserAPI = async (loginDTO: LoginDTO) => {
  return await authAPI.post("/users/login", loginDTO);
};

export const logoutUserAPI = async () => {
  return await authAPI.post("/users/logout");
};

export const updateProfileImageAPI = async (formData: FormData) => {
  return await authAPI.post("/users/profile-image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// 토큰 유효성 확인 및 사용자 정보 가져오기
export const verifyTokenAPI = async () => {
  const response = await authAPI.get("/users/verify-token");
  return response;
};

export const getProfileImageAPI = async (userNickname: string) => {
  const response = await publicAPI.get(`/users/profile-image/${userNickname}`);
  return response.data;
};

// 프로필 소유권 확인 API
export const checkProfileOwnershipAPI = async (userNickname: string) => {
  const response = await authAPI.get(
    `/users/check-profile-ownership/${userNickname}`
  );
  return response.data;
};

// 닉네임으로 사용자 시퀀스 조회 API
export const getUserSeqByNicknameAPI = async (
  userNickname: string
): Promise<number> => {
  const response = await publicAPI.get(`/users/seq/${userNickname}`);
  return response.data.userSeq;
};

// 통합 프로필 정보 조회 API
export const getProfileInfoAPI = async (userNickname: string) => {
  const response = await authAPI.get(`/users/profile-info/${userNickname}`);
  return response.data;
};
