import { Navigate } from "react-router-dom";

export default function PublicRoute({ children }) {
  const token = localStorage.getItem("accessToken");

  // Agar already logged in hai → dashboard bhej do
  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
