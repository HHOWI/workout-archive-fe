import { createBrowserRouter } from "react-router-dom";
import Layout from "./components/Layout";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginGuard from "./components/LoginGuard";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import ErrorPage from "./pages/ErrorPage";
import RegisterSuccessPage from "./pages/RegisterSuccessPage";
import EmailVerificationPage from "./pages/EmailVerificationPage";
import WorkoutRecordPage from "./pages/WorkoutRecordPage";
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />, // 전역 오류 처리
    children: [
      // 공용
      { index: true, element: <HomePage /> },
      // 로그인 전용
      {
        element: <ProtectedRoute />,
        children: [
          { path: "profile", element: <ProfilePage /> },
          { path: "workout-record", element: <WorkoutRecordPage /> },
        ],
      },
      // 비로그인 전용
      {
        element: <LoginGuard />,
        children: [
          { path: "login", element: <LoginPage /> },
          { path: "register", element: <RegisterPage /> },
          { path: "register-success", element: <RegisterSuccessPage /> },
          { path: "verify-email", element: <EmailVerificationPage /> },
        ],
      },
    ],
  },
]);

export default router;
