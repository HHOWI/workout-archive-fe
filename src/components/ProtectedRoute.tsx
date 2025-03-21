import { Navigate, Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store/store";
import { useState, useEffect } from "react";
import { verifyTokenAPI } from "../api/user";
import { clearUserInfo } from "../store/slices/authSlice";

const ProtectedRoute: React.FC = () => {
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const dispatch = useDispatch();
  const [isValid, setIsValid] = useState<boolean | null>(null);

  useEffect(() => {
    const validateToken = async () => {
      try {
        const response = await verifyTokenAPI();
        const tokenExpired = response.headers["x-token-expired"] === "true";
        if (response?.data && !tokenExpired) {
          setIsValid(true);
        } else {
          dispatch(clearUserInfo()); // 토큰 만료 시 Redux 초기화
          setIsValid(false);
        }
      } catch (error) {
        dispatch(clearUserInfo());
        setIsValid(false);
      }
    };
    validateToken();
  }, [dispatch]);

  if (isValid === null) return <div>인증 확인 중...</div>;

  if (!isValid) {
    const redirectReason = userInfo
      ? "reason=token_expired"
      : "reason=unauthenticated";
    return (
      <Navigate
        to={`/login?${redirectReason}&redirect=${encodeURIComponent(
          window.location.pathname
        )}`}
        replace
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
