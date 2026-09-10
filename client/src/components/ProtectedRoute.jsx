import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../features/auth/authSlice";

// Wrap any route element: <ProtectedRoute roles={['kitchen']}><KitchenDashboard/></ProtectedRoute>
// roles=[] (default) means "any authenticated user, regardless of role" is allowed.
export default function ProtectedRoute({ children, roles = [], unauthorizedTo = "/" }) {
  const user = useSelector(selectCurrentUser);

  if (!user) return <Navigate to="/login" replace />;
  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to={unauthorizedTo} replace />;
  }
  return children;
}
