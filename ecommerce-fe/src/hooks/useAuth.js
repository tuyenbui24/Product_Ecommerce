import { useSelector } from "react-redux";

export default function useAuth() {
  const { isAuthenticated, user, loading } = useSelector((s) => s.auth);
  const roles = user?.roles || [];
  return { isAuthenticated, user, roles, loading };
}
