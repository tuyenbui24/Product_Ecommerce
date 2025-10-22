import { NavLink, Link, Outlet } from "react-router-dom";

export default function AdminLayout() {
  const navItem = "flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100";
  const active = "bg-gray-100 text-gray-900 font-medium";

  return (
    <div className="min-h-screen flex">
      <aside className="fixed top-0 left-0 h-screen w-[240px] border-r bg-white p-4 overflow-y-auto">
        <div className="h-12 flex items-center justify-between mb-2">
          <Link to="/" className="font-semibold">Quản trị</Link>
        </div>
        <nav className="grid gap-1">
          <NavLink to="stats" className={({ isActive }) => `${navItem} ${isActive ? active : ""}`}>Quản lý thống kê</NavLink>
          <NavLink to="staffs"   className={({ isActive }) => `${navItem} ${isActive ? active : ""}`}>Quản lý tài khoản</NavLink>
          <NavLink to="users"    className={({ isActive }) => `${navItem} ${isActive ? active : ""}`}>Quản lý người dùng</NavLink>
          <NavLink to="orders"   className={({ isActive }) => `${navItem} ${isActive ? active : ""}`}>Quản lý đơn hàng</NavLink>
          <NavLink to="products" className={({ isActive }) => `${navItem} ${isActive ? active : ""}`}>Quản lý sản phẩm</NavLink>
          <NavLink to="categories" className={({ isActive }) => `${navItem} ${isActive ? active : ""}`}>Quản lý danh mục</NavLink>
        </nav>
      </aside>

      <div className="flex flex-col flex-1 ml-[240px] min-w-0">
        <header className="h-14 border-b bg-white px-4 flex items-center justify-between sticky top-0 z-10">
          <div className="font-medium">Trang quản trị</div>
          <Link to="/" className="text-sm px-3 py-1.5 rounded hover:bg-gray-100">
            Về trang bán hàng
          </Link>
        </header>

        <main className="p-6 min-w-0 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
