import Home from "@pages/Home";
import Login from "@pages/Auth/Login";
import AdminLogin from "@pages/Auth/AdminLogin";
import Register from "@pages/Auth/Register";

import ProductList from "@pages/Product/ProductList";
import ProductDetail from "@pages/Product/ProductDetail";
import SearchPage from "@pages/Product/SearchPage";
import CategoryPage from "@pages/Product/CategoryPage";

import Cart from "@pages/Cart";
import Checkout from "@pages/Checkout";

import OrderList from "@pages/Order/OrderList";
import OrderDetail from "@pages/Order/OrderDetail";

import Profile from "@pages/User/Profile";

import AdminProducts from "@pages/Admin/Products";
import AdminUsers from "@pages/Admin/Users";
import AdminStaffs from "@pages/Admin/Staffs";
import AdminCategories from "@pages/Admin/Categories";
import AdminOrders from "@pages/Admin/Orders";
import AdminStats from "@pages/Admin/AdminStats";

import MainLayout from "@layouts/MainLayout";
import AdminLayout from "@layouts/AdminLayout";
import AuthLayout from "@layouts/AuthLayout";
import VnpayReturnPage from "@/pages/Checkout";
import VnpayResultPage from "@pages/Checkout/VnpayResult";


export const publicRoutes = [
  { path: "/", element: <Home />, layout: MainLayout },
  { path: "/login", element: <Login />, layout: AuthLayout  },  
  { path: "/admin/login", element: <AdminLogin />, layout: null },
  { path: "/register", element: <Register />, layout: AuthLayout  },

  { path: "/products/detail/:id", element: <ProductDetail /> },
  { path: "/products", element: <ProductList /> },

  { path: "/cart", element: <Cart />, denyRoles: ["admin", "staff"] },
  { path: "/checkout", element: <Checkout />, denyRoles: ["admin", "staff"] },

  { path: "/profile", element: <Profile />, roles: ["user"] },
  { path: "/search", element: <SearchPage />, layout: MainLayout },
  { path: "/category/:id", element: <CategoryPage />, layout: MainLayout },
  { path: "/payment/vnpay-result", element: <VnpayResultPage />, layout: MainLayout }
];


export const privateRoutes = [
  {
    path: "/admin/users",
    element: <AdminUsers />,
    roles: ["ROLE_ADMIN","ROLE_STAFF"],
    layout: AdminLayout,
  },
  {
    path: "/admin/products",
    element: <AdminProducts />,
    roles: ["ROLE_ADMIN","ROLE_STAFF"],
    layout: AdminLayout,
  },
  {
    path: "/admin/categories",
    element: <AdminCategories />,
    roles: ["ROLE_ADMIN","ROLE_STAFF"],
    layout: AdminLayout,
  },
  {
    path: "/admin/staffs",
    element: <AdminStaffs />,
    roles: ["ROLE_ADMIN","ROLE_STAFF"],
    layout: AdminLayout,
  },
  {
    path: "/admin/orders",
    element: <AdminOrders />,
    roles: ["ROLE_ADMIN","ROLE_STAFF"],
    layout: AdminLayout,
  },
  { path: "/admin/stats", 
    element: <AdminStats /> , 
    roles: ["ROLE_ADMIN","ROLE_STAFF"], 
    layout: AdminLayout 
  },
  { path: "/cart",
    element: <Cart />,
    roles: ["ROLE_USER"] 
  },
  { path: "/orders", element: <OrderList /> , roles: ["ROLE_USER"] },
  { path: "/orders/:id", element: <OrderDetail /> , roles: ["ROLE_USER"] },
  { path: "/payment/vnpay-return", element: <VnpayReturnPage /> , roles: ["ROLE_USER"] },
];
