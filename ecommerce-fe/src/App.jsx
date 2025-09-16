// src/App.jsx
import { Fragment, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Routes, Route, useLocation } from "react-router-dom";
import { publicRoutes, privateRoutes } from "@routes";
import MainLayout from "@layouts/MainLayout";
import ProtectedRoute from "@components/common/ProtectedRoute";
import { fetchMeThunk } from "@store/slices/authSlice";
import { getToken } from "@/utils/storage";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AdminLayout from "@layouts/AdminLayout";
import AdminUsers from "@pages/admin/Users";
import AdminProducts from "@pages/admin/Products";
import AdminCategories from "@pages/admin/Categories";
import AdminStaffs from "@pages/admin/Staffs";
import AdminOrders from "@pages/admin/Orders";

function App() {
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const user = useSelector(s => s.auth.user);

  const isUserArea = /^\/(profile|orders|checkout)(\/|$)/.test(pathname);

  useEffect(() => {
    if (getToken() && !user && isUserArea) {
      dispatch(fetchMeThunk());
    }
  }, [dispatch, user, isUserArea]);

  return (
    <>
      <Routes>
        {publicRoutes.map((route, i) => {
          const Layout = route.layout === null ? Fragment : route.layout || MainLayout;
          const page = <Layout>{route.element}</Layout>;

          if (route.denyRoles?.length) {
            return (
              <Route key={`pub-${i}`} element={<ProtectedRoute denyRoles={route.denyRoles} />}>
                <Route path={route.path} element={page} />
              </Route>
            );
          }
          return <Route key={`pub-${i}`} path={route.path} element={page} />;
        })}

        {privateRoutes.map((route, i) => {
          const isAdminPath = String(route.path || "").startsWith("/admin");
          if (isAdminPath) return null;

          const Layout = route.layout === null ? Fragment : route.layout || MainLayout;
          return (
            <Route key={`pri-${i}`} element={<ProtectedRoute roles={route.roles} />}>
              <Route path={route.path} element={<Layout>{route.element}</Layout>} />
            </Route>
          );
        })}

        <Route element={<ProtectedRoute roles={['ROLE_ADMIN','ROLE_STAFF']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="users" element={<AdminUsers />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="staffs" element={<AdminStaffs />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="categories" element={<AdminCategories />} />
          </Route>
        </Route>
      </Routes>

      <ToastContainer position="top-center" autoClose={2000} />
    </>
  );
}

export default App;
