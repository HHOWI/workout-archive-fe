import { RouterProvider } from "react-router-dom";
import router from "./Router";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { verifyTokenAPI } from "./api/user";
import { clearUserInfo, setUserInfo } from "./store/slices/authSlice";

const App: React.FC = () => {
  const dispatch = useDispatch();
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await verifyTokenAPI();
        const tokenExpired = response.headers["x-token-expired"] === "true";
        if (response?.data && !tokenExpired) {
          dispatch(setUserInfo(response.data));
        }
      } catch (error) {
        console.error("인증 상태 확인 중 오류 발생:", error);
      } finally {
        setIsAuthChecked(true);
      }
    };
    checkAuthStatus();
  }, [dispatch]);

  if (!isAuthChecked) return <div>로딩 중...</div>;

  if (!isAuthChecked) return <div>로딩 중...</div>;

  return <RouterProvider router={router} />;
};

export default App;
