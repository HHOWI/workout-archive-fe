import { RouterProvider } from "react-router-dom";
import router from "./Router";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { verifyTokenAPI } from "./api/user";
import { clearUserInfo, setUserInfo } from "./store/slices/authSlice";

function App() {
  const dispatch = useDispatch();
  const userInfo = useSelector((state: any) => state.auth.userInfo);
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      if (userInfo) {
        setIsAuthChecked(true);
        return;
      }
      try {
        const response = await verifyTokenAPI();
        if (response?.data) {
          dispatch(setUserInfo(response.data));
        } else {
          dispatch(clearUserInfo());
        }
      } catch (error) {
        console.error("인증 상태 확인 중 오류 발생:", error);
        dispatch(clearUserInfo());
      } finally {
        setIsAuthChecked(true);
      }
    };
    checkAuthStatus();
  }, [dispatch, userInfo]);

  if (!isAuthChecked) return <div>로딩 중...</div>;

  return <RouterProvider router={router} />;
}

export default App;
