import { useEffect, useMemo, useState } from "react";
import { searchUsers, deleteUser } from "@/api/adminApi";
import { toast } from "react-toastify";

export default function AdminUsers() {
  const [kw, setKw] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const pageSize = 10;

  async function load() {
    setLoading(true);
    try {
      const { data } = await searchUsers({ page, keyword: kw.trim() });
      setRows(data?.data ?? []);
      setTotal(data?.totalItems ?? 0);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Tải danh sách user thất bại");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [page]);
  const onSearch = (e) => { e.preventDefault(); setPage(1); load(); };

  const onDelete = async (id) => {
    if (!confirm("Xoá user này?")) return;
    try {
      await deleteUser(id);
      toast.success("Đã xoá user");
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Xoá user thất bại");
    }
  };

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý User</h1>
      </div>

      <form onSubmit={onSearch} className="flex gap-2">
        <input
          value={kw}
          onChange={(e)=>setKw(e.target.value)}
          placeholder="Tìm theo tên, email..."
          className="h-10 rounded border px-3"
        />
        <button className="h-10 px-4 rounded bg-blue-600 text-white">Tìm kiếm</button>
      </form>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr className="text-left text-sm">
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">Họ</th>
              <th className="px-3 py-2">Tên</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!loading && rows?.length === 0 && (
              <tr><td colSpan={5} className="px-3 py-4 text-center text-gray-500">Không có dữ liệu</td></tr>
            )}
            {rows.map(u => (
              <tr key={u.id} className="border-t">
                <td className="px-3 py-2">{u.id}</td>
                <td className="px-3 py-2">{u.lastName}</td>
                <td className="px-3 py-2">{u.firstName}</td>
                <td className="px-3 py-2">{u.email}</td>
                <td className="px-3 py-2">
                  <button onClick={()=>onDelete(u.id)} className="h-9 px-3 rounded bg-red-600 text-white">
                    Xoá
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <div className="p-4 text-center text-gray-500">Đang tải...</div>}
      </div>

      <div className="flex items-center gap-2">
        <button disabled={page<=1} onClick={()=>setPage(p=>p-1)}
                className="h-9 px-3 rounded border disabled:opacity-60">Trước</button>
        <div className="text-sm">Trang {page}/{totalPages}</div>
        <button disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)}
                className="h-9 px-3 rounded border disabled:opacity-60">Sau</button>
      </div>
    </div>
  );
}
