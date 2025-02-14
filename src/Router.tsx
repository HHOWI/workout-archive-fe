import { createBrowserRouter } from "react-router-dom";
import LayoutWithHeader from "./components/LayoutWithHeader";
import LayoutWithoutHeader from "./components/LayoutWithoutHeader";
import LoginPage from "./pages/LoginPage";

const router = createBrowserRouter([
  {
    path: "/",
    children: [{ index: true, element: <LoginPage /> }],
  },
]);

export default router;
