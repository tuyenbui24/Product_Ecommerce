import { useEffect, useMemo, useState } from "react";
import { searchCategories, createCategory, updateCategory, deleteCategory } from "@/api/adminApi";
import { toast } from "react-toastify";

export default function AdminCategories() {
  const [kw, setKw] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", slug: "" });

  const load = async (_page = page) => {
    setLoading(true);
    try {
      const { data } = await searchCategories({ page: _page, keyword: kw.trim() });
      const list = data?.content ?? data?.items ?? [];
      setRows(list);
      setTotal(data?.totalElements ?? data?.total ?? list.length);
      setSize(data?.size ?? data?.pageSize ?? 10);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Tải danh mục thất bại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1); }, []);
  useEffect(() => { load(page); /* eslint-disable-next-line */ }, [page]);

  const onSearch = (e) => { e.preventDefault(); setPage(1); load(1); };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", slug: "" });
    setOpen(true);
  };

  const openEdit = (c) => {
    setEditing(c);
    setForm({ name: c.name ?? "", slug: c.slug ?? "" });
    setOpen(true);
  };

  const onSave = async (e) => {
    e.preventDefault();
    if (!form.name?.trim()) return toast.error("Tên danh mục không được để trống");
    const payload = { name: form.name.trim(), slug: (form.slug || "").trim() };

    try {
      if (editing) {
        await updateCategory(editing.id, payload);
        toast.success("Đã cập nhật danh mục");
      } else {
        await createCategory(payload);
        toast.success("Đã tạo danh mục");
      }
      setOpen(false);
      if (!editing) { setPage(1); load(1); } else { load(page); }
    } catch (e) {
      toast.error(e?.response?.data?.message || "Lưu danh mục thất bại");
    }
  };

  const onDelete = async (id) => {
    if (!confirm("Xoá danh mục này?")) return;
    try {
      await deleteCategory(id);
      toast.success("Đã xoá danh mục");
      if (rows.length === 1 && page > 1) setPage(p => p - 1); else load(page);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Xoá thất bại");
    }
  };

  const totalPages = useMemo(() => Math.max(1, Math.ceil((total || 0) / (size || 10))), [total, size]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý Danh mục</h1>
        <button onClick={openCreate} className="h-10 px-4 rounded bg-emerald-600 text-white">Thêm danh mục</button>
      </div>

      <form onSubmit={onSearch} className="flex gap-2">
        <input value={kw} onChange={e=>setKw(e.target.value)} placeholder="Tìm theo tên..." className="h-10 rounded border px-3" />
        <button className="h-10 px-4 rounded bg-blue-600 text-white">Tìm kiếm</button>
      </form>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr className="text-left text-sm">
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">Tên</th>
              <th className="px-3 py-2">Slug</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!loading && rows?.length === 0 && (
              <tr><td colSpan={4} className="px-3 py-4 text-center text-gray-500">Không có dữ liệu</td></tr>
            )}
            {rows.map(c => (
              <tr key={c.id} className="border-t">
                <td className="px-3 py-2">{c.id}</td>
                <td className="px-3 py-2">{c.name}</td>
                <td className="px-3 py-2">{c.slug}</td>
                <td className="px-3 py-2 flex gap-2">
                  <button onClick={()=>openEdit(c)} className="h-9 px-3 rounded border">Sửa</button>
                  <button onClick={()=>onDelete(c.id)} className="h-9 px-3 rounded bg-red-600 text-white">Xoá</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <div className="p-4 text-center text-gray-500">Đang tải...</div>}
      </div>

      <div className="flex items-center gap-2">
        <button disabled={page<=1} onClick={()=>setPage(p=>p-1)} className="h-9 px-3 rounded border disabled:opacity-60">Trước</button>
        <div className="text-sm">Trang {page}/{totalPages}</div>
        <button disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)} className="h-9 px-3 rounded border disabled:opacity-60">Sau</button>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/30 grid place-items-center p-4">
          <form onSubmit={onSave} className="bg-white w-[560px] max-w-[95vw] rounded-xl p-5 grid gap-3">
            <h2 className="text-lg font-semibold">{editing ? "Sửa danh mục" : "Thêm danh mục"}</h2>

            <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})}
                   placeholder="Tên danh mục" className="h-11 rounded border px-3" required />

            <input value={form.slug} onChange={e=>setForm({...form, slug:e.target.value})}
                   placeholder="Slug (để trống sẽ tự tạo)" className="h-11 rounded border px-3" />

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={()=>setOpen(false)} className="h-10 px-4 rounded border">Huỷ</button>
              <button className="h-10 px-4 rounded bg-blue-600 text-white">{editing ? "Lưu" : "Tạo mới"}</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
