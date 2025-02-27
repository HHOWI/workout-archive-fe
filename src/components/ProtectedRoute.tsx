import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store/store";

const ProtectedRoute = () => {
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);

  return userInfo ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
