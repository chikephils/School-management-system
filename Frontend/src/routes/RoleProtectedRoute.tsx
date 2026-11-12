import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../app/store/hooks";
import type { UserRole } from "../types/auth";

type RoleProtectedRouteProps = {
  allowedRoles: UserRole[];
};

function RoleProtectedRoute({ allowedRoles }: RoleProtectedRouteProps) {
  const user = useAppSelector((state) => state.auth.user);

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

export default RoleProtectedRoute;
