import { NavLink, Link, Outlet } from "react-router-dom";

export default function AdminLayout() {
  const navItem = "flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100";
  const active = "bg-gray-100 text-gray-900 font-medium";

  return (
    <div className="min-h-screen grid grid-cols-[240px_1fr]">
      {/* Sidebar */}
      <aside className="border-r bg-white p-4">
        <div className="h-12 flex items-center justify-between mb-2">
          <Link to="/" className="font-semibold">Admin</Link>
        </div>
        <nav className="grid gap-1">
          <NavLink to="staffs"   className={({ isActive }) => `${navItem} ${isActive ? active : ""}`}>Staffs</NavLink>
          <NavLink to="users"    className={({ isActive }) => `${navItem} ${isActive ? active : ""}`}>Users</NavLink>
          <NavLink to="orders"   className={({ isActive }) => `${navItem} ${isActive ? active : ""}`}>Orders</NavLink>
          <NavLink to="products" className={({ isActive }) => `${navItem} ${isActive ? active : ""}`}>Products</NavLink>
          <NavLink to="categories" className={({ isActive }) => `${navItem} ${isActive ? active : ""}`}>Categories</NavLink>
        </nav>
      </aside>

      {/* Content */}
      <div className="flex flex-col min-w-0">
        <header className="h-14 border-b bg-white px-4 flex items-center justify-between">
          <div className="font-medium">Trang quản trị</div>
          <Link to="/" className="text-sm px-3 py-1.5 rounded hover:bg-gray-100">
            Về trang bán hàng
          </Link>
        </header>
        <main className="p-6 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
