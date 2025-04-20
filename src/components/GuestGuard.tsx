import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";

const GuestGuard = () => {
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);

  return userInfo ? <Navigate to="/" replace /> : <Outlet />;
};

export default GuestGuard;
