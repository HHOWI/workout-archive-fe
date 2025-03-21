import axios from "axios";
import { store } from "../store/store";
import { clearUserInfo } from "../store/slices/authSlice";
import { logoutUserAPI } from "./user";

// 인증이 필요한 인스턴스 생성
export const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true,
});

// 인증이 필요없는 API용 인스턴스 (토큰 전송 안 함)
export const publicAxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: false,
});

// 토큰 만료 중복 처리 방지를 위한 변수
let isHandlingTokenExpiration = false;

// 로그아웃 및 리디렉션 처리 함수
const handleTokenExpiration = async (): Promise<void> => {
  if (isHandlingTokenExpiration) return;
  isHandlingTokenExpiration = true;

  try {
    await logoutUserAPI();
  } catch (error) {
    console.error("로그아웃 API 호출 실패:", error);
  } finally {
    store.dispatch(clearUserInfo());
    isHandlingTokenExpiration = false;
  }
};

// 응답 인터셉터 설정
axiosInstance.interceptors.response.use(
  (response) => {
    const tokenExpired = response.headers["x-token-expired"] === "true";
    if (tokenExpired && !isHandlingTokenExpiration) {
      handleTokenExpiration();
    }
    return response;
  },
  async (error) => {
    if (error.response?.status === 401 && !isHandlingTokenExpiration) {
      await handleTokenExpiration();
    }
    return Promise.reject(error);
  }
);

// API 경로별 인스턴스 생성
export const userAPI = axiosInstance;
export const workoutAPI = axiosInstance;
export const workoutPlaceAPI = axiosInstance;
export const exerciseAPI = axiosInstance;
// 인증이 필요 없는 API 요청용 인스턴스
export const publicUserAPI = publicAxiosInstance;
export const publicWorkoutAPI = publicAxiosInstance;
export const registerAPI = publicAxiosInstance;
export const publicExerciseAPI = publicAxiosInstance;
export const publicWorkoutPlaceAPI = publicAxiosInstance;
