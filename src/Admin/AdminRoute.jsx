import { Navigate } from "react-router-dom";

/**
 * Protects admin routes.
 * Reads `user` from localStorage (set during login).
 * Redirects to /login if not authenticated, or / if not admin.
 */
const AdminRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  const user  = JSON.parse(localStorage.getItem("user") || "{}");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default AdminRoute;
