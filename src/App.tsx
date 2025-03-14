import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUserInfo } from "./store/slices/authSlice";
import { verifyTokenAPI } from "./api/user";
import { RouterProvider } from "react-router-dom";
import router from "./Router";

function App() {
  const dispatch = useDispatch();

  // 페이지 로드 시 토큰 유효성 확인 및 사용자 정보 가져오기
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // 토큰 유효성 확인 API 호출
        const response = await verifyTokenAPI();
        // 유효한 토큰이면 Redux 상태에 사용자 정보 설정
        if (response && response.data) {
          dispatch(setUserInfo(response.data));
        }
      } catch (error) {
        console.error("인증 상태 확인 중 오류 발생:", error);
        // 오류 발생 시 아무것도 하지 않음 (비로그인 상태로 간주)
      }
    };

    checkAuthStatus();
  }, [dispatch]);

  return <RouterProvider router={router} />;
}

export default App;
