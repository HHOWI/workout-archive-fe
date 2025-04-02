import { createBrowserRouter, useParams } from "react-router-dom";
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
import BodyLogPage from "./pages/BodyLogPage";
import StatisticsPage from "./pages/StatisticsPage";
import WorkoutPlacePage from "./pages/WorkoutPlacePage";
import NotificationsPage from "./pages/NotificationsPage";
import FeedPage from "./pages/FeedPage";

const ProfileWrapper = () => {
  const { nickname } = useParams(); // URL 파라미터에서 nickname 가져오기
  return <ProfilePage key={nickname} />; // nickname을 key로 설정
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <ErrorPage />,
    children: [
      // 공용 경로
      { index: true, element: <HomePage /> },
      { path: "/profile/:nickname", element: <ProfileWrapper /> },
      { path: "/workoutplace/:placeSeq", element: <WorkoutPlacePage /> },

      // 로그인 전용 경로
      {
        element: <ProtectedRoute />,
        children: [
          { path: "workout-record/:nickname", element: <WorkoutRecordPage /> },
          { path: "body-log/:nickname", element: <BodyLogPage /> },
          { path: "statistics/:nickname", element: <StatisticsPage /> },
          {
            path: "/notifications",
            element: <NotificationsPage />,
          },
          {
            path: "/feed",
            element: <FeedPage />,
          },
        ],
      },
    ],
  },
  // 비로그인 전용 경로 (Layout 제외)
  {
    element: <LoginGuard />,
    children: [
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "register-success", element: <RegisterSuccessPage /> },
      { path: "verify-email", element: <EmailVerificationPage /> },
    ],
  },
]);

export default router;
