import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { hasAnyRole, hasNoneOf } from "@/utils/auth";
import PropTypes from "prop-types";

export default function ProtectedRoute({ roles = [], denyRoles = [] }) {
  const isAuthenticated = useSelector((s) => !!s.auth?.isAuthenticated);
  const user = useSelector((s) => s.auth?.user || null);
  const location = useLocation();

  const userRoles = user?.roles || user?.authorities || [];

  const isAdminArea = location.pathname.startsWith("/admin");
  const loginPath = isAdminArea ? "/admin/login" : "/login";

  if (!isAuthenticated) {
    return <Navigate to={loginPath} replace state={{ from: location }} />;
  }

  if (roles.length && !hasAnyRole(userRoles, roles)) {
    return <Navigate to="/" replace />;
  }

  if (denyRoles.length && !hasNoneOf(userRoles, denyRoles)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

ProtectedRoute.propTypes = {
  roles: PropTypes.arrayOf(PropTypes.string),
  denyRoles: PropTypes.arrayOf(PropTypes.string),
};
