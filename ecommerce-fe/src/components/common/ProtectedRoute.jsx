import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { hasAnyRole, hasNoneOf } from "@/utils/auth";
import PropTypes from "prop-types";

export default function ProtectedRoute({ roles = [], denyRoles = [] }) {
  const isAuthenticated = useSelector((s) => !!s.auth?.isAuthenticated);
  const user = useSelector((s) => s.auth?.user || null);
  const location = useLocation();

  const isAdminArea = location.pathname.startsWith("/admin");
  const loginPath = isAdminArea ? "/admin/login" : "/login";

  if (!isAuthenticated) {
    return <Navigate to={loginPath} replace state={{ from: location }} />;
  }

  const userRoles = useMemo(
    () => user?.roles || user?.authorities || [],
    [user]
  );

  if (roles.length && !hasAnyRole(userRoles, roles)) {
    return <Navigate to="/" replace />;
  }

  if (denyRoles.length && !hasNoneOf(userRoles, denyRoles)) {
    return <Navigate to="/" replace />;
  }

  // DEBUG (có thể bỏ sau khi kiểm tra xong)
  console.log(
    "[Guard] path=",
    location.pathname,
    "isAuth=",
    isAuthenticated,
    "userRoles=",
    userRoles,
    "need=",
    roles,
    "deny=",
    denyRoles
  );

  return <Outlet />;
}

ProtectedRoute.propTypes = {
  roles: PropTypes.arrayOf(PropTypes.string),
  denyRoles: PropTypes.arrayOf(PropTypes.string),
};
