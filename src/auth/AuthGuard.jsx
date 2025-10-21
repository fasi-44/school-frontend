// app/auth/AuthGuard.jsx
import { Navigate, useLocation } from "react-router-dom";
// HOOK
import useAuth from "app/hooks/useAuth";
import { MatxLoading } from "app/components";

export default function AuthGuard({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const { pathname } = useLocation();

  // Show loading while checking authentication status
  if (loading) {
    return <div><MatxLoading /></div>;
  }

  if (isAuthenticated) return <>{children}</>;

  return <Navigate replace to="/" state={{ from: pathname }} />;
}
