import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAppSelector } from "../app/store/hooks";

function ProtectedRoute() {
  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const location = useLocation();

  if (!accessToken) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }
  return <Outlet />;
}

export default ProtectedRoute;
