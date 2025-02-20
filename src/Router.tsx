import { createBrowserRouter, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import { useSelector } from "react-redux";
import { RootState } from "./store/store";
import HomePage from "./pages/HomePage";

const RootElement = () => {
  const { isLoggedIn } = useSelector((state: RootState) => state.auth);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <HomePage />;
};

const LoginElement = () => {
  const { isLoggedIn } = useSelector((state: RootState) => state.auth);

  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return <LoginPage />;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [{ index: true, element: <RootElement /> }],
  },
  {
    path: "/login",
    children: [{ index: true, element: <LoginElement /> }],
  },
]);

export default router;
