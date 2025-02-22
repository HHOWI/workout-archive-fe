import { useSelector } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { RootState } from "../store/store";

const LoginGuard = () => {
  const { isLoggedIn } = useSelector((state: RootState) => state.auth);

  return isLoggedIn ? <Navigate to="/" replace /> : <Outlet />;
};

export default LoginGuard;
