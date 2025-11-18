import { useState, useMemo, useEffect, useRef } from "react";
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
  User as UserIcon,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { logoutThunk } from "@store/slices/authSlice";
import { getAllCategories } from "@/api/productApi";
import logo from "@assets/logo.png";

export default function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { pathname } = useLocation();

  const isAdminArea = pathname.startsWith("/admin");
  if (isAdminArea) return null;

  const isAuthPage = /^\/(login|register|admin\/login)(\/|$)/.test(pathname);
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
    const params = createSearchParams({
      q: q.trim(),
      page: 1,
      size: 12,
    }).toString();
    navigate(`/search?${params}`);
  };

  const [cates, setCates] = useState([]);
  const [loadingCates, setLoadingCates] = useState(false);
  useEffect(() => {
    (async () => {
      try {
        setLoadingCates(true);
        const { data } = await getAllCategories();
        setCates(Array.isArray(data) ? data : []);
      } finally {
        setLoadingCates(false);
      }
    })();
  }, []);

  const grouped = useMemo(() => {
    const groups = { NAM: [], NỮ: [], "TRẺ EM": [] };
    for (const c of cates) {
      const base = (c.slug || c.name || "").toLowerCase();
      if (base.includes("nam")) groups["NAM"].push(c);
      else if (base.includes("nu") || base.includes("nữ")) groups["NỮ"].push(c);
      else if (
        base.includes("tre") ||
        base.includes("trẻ") ||
        base.includes("kid") ||
        base.includes("be")
      )
        groups["TRẺ EM"].push(c);
    }
    Object.keys(groups).forEach((k) =>
      groups[k].sort((a, b) => (a.name || "").localeCompare(b.name || ""))
    );
    return groups;
  }, [cates]);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const mobileRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (mobileRef.current && !mobileRef.current.contains(e.target)) {
        setMobileOpen(false);
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const MenuGroup = ({ label, items, colorClass }) => (
    <div className="relative group hidden md:block">
      <button
        className={`${colorClass} font-semibold cursor-pointer select-none inline-flex items-center gap-1`}
      >
        {label}
      </button>
      <div className="absolute left-0 top-full z-40 w-64 rounded bg-white shadow-md py-2 opacity-0 translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition ease-out duration-150 origin-top">
        {loadingCates && (
          <div className="px-4 py-2 text-sm text-gray-500">Đang tải...</div>
        )}
        {!loadingCates && items.length === 0 && (
          <div className="px-4 py-2 text-sm text-gray-500">Chưa có danh mục</div>
        )}
        {items.map((it) => (
          <Link
            key={it.id}
            to={`/category/${it.id}?page=1&size=12`}
            className="block px-4 py-2 hover:bg-gray-100"
          >
            {it.name}
          </Link>
        ))}
      </div>
    </div>
  );

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-b from-yellow-100 to-white shadow">
      <div className="max-w-7xl mx-auto px-4 relative">
        <div className="h-16 flex items-center justify-between gap-4">
          <button
            onClick={() => setMobileOpen((p) => !p)}
            className="md:hidden text-gray-700"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

          <Link to="/" aria-label="Trang chủ" className="flex items-center gap-3">
            <img src={logo} alt="Logo" className="h-10 w-auto" />
          </Link>

          <form
            onSubmit={onSearch}
            className="relative flex-1 max-w-xl hidden sm:block"
          >
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

          <div className="flex items-center gap-5">
            <Link to="/cart" className="relative" aria-label="Giỏ hàng">
              <ShoppingCart className="w-6 h-6 text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full grid place-items-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {!isAuthPage && (
              <>
                {!isAuthenticated ? (
                  <div className="hidden md:block text-sm font-medium">
                    <Link to="/register" className="hover:text-black">
                      ĐĂNG KÝ
                    </Link>
                    <span> / </span>
                    <Link to="/login" className="hover:text-black">
                      ĐĂNG NHẬP
                    </Link>
                  </div>
                ) : (
                  <div className="relative group hidden md:block pb-2">
                    <button className="flex items-center gap-2 text-sm font-medium hover:text-black cursor-pointer">
                      <UserIcon className="w-5 h-5" />
                      <span>{user?.firstName || user?.email || "Tài khoản"}</span>
                    </button>
                    <div className="absolute right-0 top-full z-40 w-56 rounded bg-white shadow-md py-2 opacity-0 translate-y-1 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition">
                      {isManager ? (
                        <>
                          <Link to="/admin/stats" className="block px-4 py-2 hover:bg-gray-100">Quản lý thống kê</Link>
                          <Link to="/admin/staffs" className="block px-4 py-2 hover:bg-gray-100">Quản lý tài khoản</Link>
                          <Link to="/admin/users" className="block px-4 py-2 hover:bg-gray-100">Quản lý người dùng</Link>
                          <Link to="/admin/orders" className="block px-4 py-2 hover:bg-gray-100">Quản lý đơn hàng</Link>
                          <Link to="/admin/products" className="block px-4 py-2 hover:bg-gray-100">Quản lý sản phẩm</Link>
                          <Link to="/admin/categories" className="block px-4 py-2 hover:bg-gray-100">Quản lý danh mục</Link>
                        </>
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
                )}
              </>
            )}
          </div>
        </div>

        <div className="h-10 hidden md:flex items-center justify-between">
          <nav className="flex items-center gap-8 text-sm font-semibold">
            <MenuGroup label="NAM" items={grouped["NAM"]} colorClass="text-red-700" />
            <MenuGroup label="NỮ" items={grouped["NỮ"]} colorClass="text-pink-700" />
            <MenuGroup label="TRẺ EM" items={grouped["TRẺ EM"]} colorClass="text-emerald-700" />
          </nav>
        </div>

        {mobileOpen && (
          <div
            ref={mobileRef}
            className="fixed top-16 left-0 w-full z-40 bg-[#FFF3CD] shadow-md"
          >
            {Object.entries(grouped).map(([label, items]) => (
              <div key={label} className="border-b border-yellow-300">
                <button
                  onClick={() =>
                    setOpenDropdown((p) => (p === label ? null : label))
                  }
                  className="w-full text-left px-4 py-3 font-semibold flex justify-between items-center"
                >
                  <span>{label}</span>
                  <span>{openDropdown === label ? "−" : "+"}</span>
                </button>
                {openDropdown === label && (
                  <div className="bg-yellow-50">
                    {items.map((it) => (
                      <Link
                        key={it.id}
                        to={`/category/${it.id}?page=1&size=12`}
                        onClick={() => setMobileOpen(false)}
                        className="block px-6 py-2 text-sm hover:bg-yellow-100"
                      >
                        {it.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}

            <div className="p-3 border-t border-yellow-300">
              {!isAuthenticated ? (
                <div className="space-x-2 text-sm">
                  <Link to="/login" onClick={() => setMobileOpen(false)}>
                    Đăng nhập
                  </Link>
                  <span>/</span>
                  <Link to="/register" onClick={() => setMobileOpen(false)}>
                    Đăng ký
                  </Link>
                </div>
              ) : (
                <>
                  {isManager ? (
                    <>
                      <Link to="/admin/stats" className="block px-4 py-2 hover:bg-yellow-100" onClick={() => setMobileOpen(false)}>Quản lý thống kê</Link>
                      <Link to="/admin/staffs" className="block px-4 py-2 hover:bg-yellow-100" onClick={() => setMobileOpen(false)}>Quản lý tài khoản</Link>
                      <Link to="/admin/users" className="block px-4 py-2 hover:bg-yellow-100" onClick={() => setMobileOpen(false)}>Quản lý người dùng</Link>
                      <Link to="/admin/orders" className="block px-4 py-2 hover:bg-yellow-100" onClick={() => setMobileOpen(false)}>Quản lý đơn hàng</Link>
                      <Link to="/admin/products" className="block px-4 py-2 hover:bg-yellow-100" onClick={() => setMobileOpen(false)}>Quản lý sản phẩm</Link>
                      <Link to="/admin/categories" className="block px-4 py-2 hover:bg-yellow-100" onClick={() => setMobileOpen(false)}>Quản lý danh mục</Link>
                    </>
                  ) : (
                    <>
                      <Link to="/profile" className="block px-4 py-2 text-sm hover:bg-yellow-100" onClick={() => setMobileOpen(false)}>Thông tin cá nhân</Link>
                      <Link to="/orders" className="block px-4 py-2 text-sm hover:bg-yellow-100" onClick={() => setMobileOpen(false)}>Đơn hàng của tôi</Link>
                    </>
                  )}
                  <button
                    onClick={onLogout}
                    className="flex items-center gap-2 text-gray-700 px-4 py-2 hover:bg-yellow-100 w-full text-left text-sm"
                  >
                    <LogOut className="w-4 h-4" /> Đăng xuất
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
