import { useState, useMemo } from "react";
import {
  Link,
  useNavigate,
  useLocation,
  createSearchParams,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Search,
  ShoppingCart,
  MapPin,
  Phone,
  User as UserIcon,
  LogOut,
  Users,
  UserCog,
  ShoppingBag,
  Package,
} from "lucide-react";
import { logoutThunk } from "@store/slices/authSlice";
import logo from "@assets/logo.png";

export default function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const isAuthPage = /^\/(login|register|admin\/login)(\/|$)/.test(pathname);
  const isAdminArea = pathname.startsWith("/admin");

  const isAuthenticated = useSelector((s) => !!s.auth?.isAuthenticated);
  const user = useSelector((s) => s.auth?.user || null);
  const cartCount = useSelector((s) => {
    const q = s.cart?.totalQuantity;
    if (typeof q === "number") return q;
    return Array.isArray(s.cart?.items) ? s.cart.items.length : 0;
  });

  const rawRoles = user?.roles ?? user?.authorities ?? [];
  const normRoles = useMemo(() => {
    return (rawRoles || [])
      .map((r) => (typeof r === "string" ? r : r?.authority || r?.name || ""))
      .map((r) => r.toUpperCase())
      .map((r) => (r.startsWith("ROLE_") ? r : `ROLE_${r}`));
  }, [rawRoles]);
  const hasRole = (role) => normRoles.includes(`ROLE_${role.toUpperCase()}`);
  const isAdmin = hasRole("ADMIN");
  const isStaff = hasRole("STAFF");
  const isManager = isAdmin || isStaff;

  const onLogout = async () => {
    await dispatch(logoutThunk());
    navigate("/", { replace: true });
  };

  const [q, setQ] = useState("");
  const onSearch = (e) => {
    e.preventDefault();
    const params = createSearchParams({ q: q.trim() }).toString();
    navigate(`/products?${params}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-b from-yellow-100 to-white shadow">
      <div className="max-w-7xl mx-auto px-4">
        <div className="h-16 flex items-center justify-between gap-4">
          <Link to="/" aria-label="Trang chủ" className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="h-10 w-auto" />
          </Link>

          <form onSubmit={onSearch} className="relative flex-1 max-w-xl">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm kiếm"
              className="w-full h-10 rounded-full border border-yellow-300/70 bg-white/90 backdrop-blur px-4 pr-12 placeholder-gray-400 focus:outline-none focus:border-yellow-500"
            />
            <button
              type="submit"
              aria-label="Tìm kiếm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-yellow-400 hover:bg-yellow-500 grid place-items-center cursor-pointer"
            >
              <Search className="w-4 h-4 text-white" />
            </button>
          </form>

          <div className="hidden md:block text-sm text-gray-700 leading-tight">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>Tìm <b>247</b> cửa hàng</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              <b className="text-red-600">0987456123</b>
              <span className="bg-yellow-300 px-1.5 rounded text-xs">FREE</span>
            </div>
          </div>
        </div>

        {/* Menu + Actions */}
        <div className="h-10 flex items-center justify-between">
          <nav className="flex items-center gap-8 text-sm font-semibold">
            <div className="relative group">
              <button className="text-red-700 font-semibold cursor-pointer select-none inline-flex items-center gap-1">
                NAM
              </button>
              <div className="absolute left-0 top-full z-40 w-56 rounded bg-white shadow-md py-2 opacity-0 translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition transform ease-out duration-150 origin-top">
                <Link to="/products?category=ao-polo-nam" className="block px-4 py-2 hover:bg-gray-100">Áo polo nam</Link>
                <Link to="/products?category=ao-thun-nam" className="block px-4 py-2 hover:bg-gray-100">Áo thun nam</Link>
              </div>
            </div>

            <div className="relative group">
              <button className="text-pink-700 font-semibold cursor-pointer select-none inline-flex items-center gap-1">
                NỮ
              </button>
              <div className="absolute left-0 top-full z-40 w-56 rounded bg-white shadow-md py-2 opacity-0 translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition transform ease-out duration-150 origin-top">
                <Link to="/products?category=ao-polo-nu" className="block px-4 py-2 hover:bg-gray-100">Áo polo nữ</Link>
                <Link to="/products?category=ao-thun-nu" className="block px-4 py-2 hover:bg-gray-100">Áo thun nữ</Link>
              </div>
            </div>
          </nav>

          <div className="flex items-center gap-5">
            {/* Ẩn giỏ hàng cho admin/staff hoặc khi đang ở khu admin */}
            {!isManager && !isAdminArea && (
              <Link to="/cart" className="relative" aria-label="Giỏ hàng">
                <ShoppingCart className="w-6 h-6 text-gray-700" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full grid place-items-center">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {/* Auth/Role menu */}
            {!isAuthPage &&
              (!isAuthenticated ? (
                <div className="text-sm font-medium">
                  <Link to="/register" className="hover:text-black">ĐĂNG KÝ</Link>
                  <span> / </span>
                  <Link to="/login" className="hover:text-black">ĐĂNG NHẬP</Link>
                </div>
              ) : (
                <div className="relative group pb-2">
                  <button className="flex items-center gap-2 text-sm font-medium hover:text-black cursor-pointer">
                    <UserIcon className="w-5 h-5" />
                    <span>{user?.firstName || user?.email || "Tài khoản"}</span>
                  </button>

                  <div className="absolute right-0 top-full z-40 w-56 rounded bg-white shadow-md py-2 opacity-0 translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition">
                    {isManager ? (
                      !isAdminArea ? (
                        <>
                          <Link to="/admin/staffs" className="px-4 py-2 hover:bg-gray-100 flex items-center gap-2">
                            <UserCog className="w-4 h-4" /> Quản lý Staff
                          </Link>
                          <Link to="/admin/users" className="px-4 py-2 hover:bg-gray-100 flex items-center gap-2">
                            <Users className="w-4 h-4" /> Quản lý User
                          </Link>
                          <Link to="/admin/orders" className="px-4 py-2 hover:bg-gray-100 flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4" /> Quản lý đơn hàng
                          </Link>
                          <Link to="/admin/products" className="px-4 py-2 hover:bg-gray-100 flex items-center gap-2">
                            <Package className="w-4 h-4" /> Quản lý sản phẩm
                          </Link>
                        </>
                      ) : (
                        <Link to="/" className="px-4 py-2 hover:bg-gray-100 flex items-center gap-2">
                          Về trang bán hàng
                        </Link>
                      )
                    ) : (
                      <>
                        <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100">Thông tin của tôi</Link>
                        <Link to="/orders" className="block px-4 py-2 hover:bg-gray-100">Đơn hàng của tôi</Link>
                      </>
                    )}

                    <button
                      onClick={onLogout}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" /> Đăng xuất
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </header>
  );
}
