import { Navigate, createBrowserRouter } from "react-router-dom";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import NewTabComponent from "../pages/NewTabComponent";
import ProtectedRoute from "./ProtectedRoute";
import User from "../pages/User";
import Company from "../pages/Company";
import Application from "../pages/Application";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" />,
    index: true,
  },
  {
    path: "/login",
    element: <Login />,
    index: true,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/application",
        element: <Application />,
      },
      {
        path: "/user",
        element: <User />,
      },
      {
        path: "/company",
        element: <Company />,
      },
      {
        path: "/dashboard/app/:id",
        element: <NewTabComponent />,
      },
      {
        path: "*",
        element: <Navigate to="/dashboard" />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/login" />,
    index: true,
  },
]);

export default router;
