import axios from "axios";
import { store } from "../store/store";
import { clearUserInfo } from "../store/slices/authSlice";

// 기본 Axios 인스턴스 생성
export const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true,
});

// 토큰 만료 메시지 표시 함수
const showTokenExpiredMessage = () => {
  // 세션 스토리지에 메시지 저장 (로그인 페이지에서 확인)
  sessionStorage.setItem(
    "auth_message",
    "로그인 인증 시간이 만료되었습니다. 다시 로그인해 주세요."
  );

  // 사용자에게 알림 메시지 표시
  alert("로그인 인증 시간이 만료되었습니다. 다시 로그인해 주세요.");
};

// 응답 인터셉터 설정
axiosInstance.interceptors.response.use(
  (response) => {
    // 성공적인 응답은 그대로 반환
    return response;
  },
  (error) => {
    // 401 Unauthorized 에러 처리
    if (error.response && error.response.status === 401) {
      // 토큰 만료 메시지 표시
      showTokenExpiredMessage();

      // Redux 스토어에서 사용자 정보 제거
      store.dispatch(clearUserInfo());

      // 로그인 페이지로 리디렉션 (현재 페이지 URL을 state로 전달하여 로그인 후 돌아올 수 있도록)
      const currentPath = window.location.pathname;
      if (currentPath !== "/login") {
        window.location.href =
          "/login?redirect=" + encodeURIComponent(currentPath);
      }
    }

    // 다른 모든 에러는 그대로 반환하여 개별 catch 블록에서 처리
    return Promise.reject(error);
  }
);

// API 경로별 인스턴스 생성
export const userAPI = axios.create({
  baseURL: process.env.REACT_APP_API_URL + "/users",
  withCredentials: true,
});

export const workoutAPI = axios.create({
  baseURL: process.env.REACT_APP_API_URL + "/workouts",
  withCredentials: true,
});

export const registerAPI = axios.create({
  baseURL: process.env.REACT_APP_API_URL + "/register",
  withCredentials: true,
});

// 각 API 인스턴스에도 동일한 인터셉터 적용
userAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      showTokenExpiredMessage();
      store.dispatch(clearUserInfo());
      const currentPath = window.location.pathname;
      if (currentPath !== "/login") {
        window.location.href =
          "/login?redirect=" + encodeURIComponent(currentPath);
      }
    }
    return Promise.reject(error);
  }
);

workoutAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      showTokenExpiredMessage();
      store.dispatch(clearUserInfo());
      const currentPath = window.location.pathname;
      if (currentPath !== "/login") {
        window.location.href =
          "/login?redirect=" + encodeURIComponent(currentPath);
      }
    }
    return Promise.reject(error);
  }
);

registerAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      showTokenExpiredMessage();
      store.dispatch(clearUserInfo());
      const currentPath = window.location.pathname;
      if (currentPath !== "/login") {
        window.location.href =
          "/login?redirect=" + encodeURIComponent(currentPath);
      }
    }
    return Promise.reject(error);
  }
);
