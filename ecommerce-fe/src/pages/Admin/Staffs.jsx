import { useEffect, useMemo, useState } from "react";
import { searchStaffs, createStaff, updateStaff, deleteStaff } from "@/api/adminApi";
import http from "@/api/http";
import { toast } from "react-toastify";

export default function AdminStaffs() {
  const [kw, setKw] = useState("");
  const [page, setPage] = useState(1);

  const [rows, setRows] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // modal state
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  // roles
  const [roleOptions, setRoleOptions] = useState([]); // [{id, name, description}]
  // form phù hợp StaffCreateRequest
  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    enabled: true,
    photos: "",
    roleIds: [],          // <-- QUAN TRỌNG
  });

  // --- load list ---
  async function load() {
    setLoading(true);
    try {
      const { data } = await searchStaffs({ page, keyword: kw.trim() });
      setRows(data?.data ?? []);
      setTotalItems(data?.totalItems ?? 0);
      setTotalPages(data?.totalPages ?? 1);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Tải danh sách staff thất bại");
    } finally {
      setLoading(false);
    }
  }

  // --- load roles ---
  async function loadRoles() {
    try {
      const { data } = await http.get("/staffs/roles");
      setRoleOptions(Array.isArray(data) ? data : []);
    } catch {
      setRoleOptions([]);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [page]);
  useEffect(() => { loadRoles(); }, []);

  const onSearch = (e) => { e.preventDefault(); setPage(1); load(); };

  const openCreate = () => {
    setEditing(null);
    // mặc định chọn role đầu tiên nếu có
    const defaultRoleId = roleOptions?.[0]?.id ? [roleOptions[0].id] : [];
    setForm({
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      enabled: true,
      photos: "",
      roleIds: defaultRoleId,
    });
    setOpen(true);
  };

  const openEdit = (s) => {
    setEditing(s);
    setForm({
      email: s.email ?? "",
      password: "", // để trống -> BE sẽ không đổi password
      firstName: s.firstName ?? "",
      lastName: s.lastName ?? "",
      enabled: !!s.enabled,
      photos: s.photoPath ?? "",
      roleIds: (s.roles ?? []).map(r => r.id), // <-- map sang id
    });
    setOpen(true);
  };

  const onSave = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      // nếu đang sửa và password rỗng thì xoá field để tránh gửi chuỗi rỗng
      if (editing && !payload.password) delete payload.password;

      if (editing) {
        await updateStaff(editing.id, payload);
        toast.success("Đã cập nhật tài khoản");
      } else {
        await createStaff(payload);
        toast.success("Đã tạo tài khoản");
      }
      setOpen(false);
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Lưu tài khoản thất bại");
    }
  };

  const onDelete = async (id) => {
    if (!confirm("Xoá tài khoản này?")) return;
    try {
      await deleteStaff(id);
      toast.success("Đã xoá tài khoản");
      load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Xoá thất bại");
    }
  };

  // helpers hiển thị role
  const renderRoleNames = (roles) =>
    (roles ?? []).map(r => (r?.name || "").replace(/^ROLE_/, "")).join(", ");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý Staff/Admin</h1>
        <button onClick={openCreate} className="h-10 px-4 rounded bg-emerald-600 text-white">
          Thêm tài khoản
        </button>
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
              <th className="px-3 py-2">Ảnh</th>
              <th className="px-3 py-2">Họ</th>
              <th className="px-3 py-2">Tên</th>
              <th className="px-3 py-2">Email</th>
              <th className="px-3 py-2">Role</th>
              <th className="px-3 py-2">Trạng thái</th>
              <th className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!loading && rows?.length === 0 && (
              <tr><td colSpan={8} className="px-3 py-4 text-center text-gray-500">Không có dữ liệu</td></tr>
            )}
            {rows.map(s => (
              <tr key={s.id} className="border-t">
                <td className="px-3 py-2">{s.id}</td>
                <td className="px-3 py-2">
                  {s.photoPath ? (
                    <img
                      src={`/staff-photos/${s.id}/${s.photoPath}`}
                      alt={s.fullName || s.email}
                      className="w-10 h-10 object-cover rounded-full border"
                      onError={(e)=>{e.currentTarget.style.display='none';}}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 grid place-items-center text-xs text-gray-600">N/A</div>
                  )}
                </td>
                <td className="px-3 py-2">{s.lastName}</td>
                <td className="px-3 py-2">{s.firstName}</td>
                <td className="px-3 py-2">{s.email}</td>
                <td className="px-3 py-2">{renderRoleNames(s.roles)}</td>
                <td className="px-3 py-2">{s.enabled ? "Hoạt động" : "Khoá"}</td>
                <td className="px-3 py-2 flex gap-2">
                  <button onClick={()=>openEdit(s)} className="h-9 px-3 rounded border">Sửa</button>
                  <button onClick={()=>onDelete(s.id)} className="h-9 px-3 rounded bg-red-600 text-white">Xoá</button>
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
            <h2 className="text-lg font-semibold">{editing ? "Sửa tài khoản" : "Thêm tài khoản"}</h2>

            <div className="grid grid-cols-2 gap-3">
              <input value={form.lastName} onChange={e=>setForm({...form, lastName:e.target.value})}
                     placeholder="Họ" className="h-11 rounded border px-3" required />
              <input value={form.firstName} onChange={e=>setForm({...form, firstName:e.target.value})}
                     placeholder="Tên" className="h-11 rounded border px-3" required />
            </div>

            <input type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})}
                   placeholder="Email" className="h-11 rounded border px-3" required />

            {!editing && (
              <input type="password" value={form.password}
                     onChange={e=>setForm({...form, password:e.target.value})}
                     placeholder="Mật khẩu" className="h-11 rounded border px-3" required minLength={6} />
            )}

            {/* chọn nhiều role nếu muốn */}
            <select
              multiple
              value={form.roleIds}
              onChange={e=>{
                const selected = Array.from(e.target.selectedOptions).map(o => Number(o.value));
                setForm({...form, roleIds: selected});
              }}
              className="h-28 rounded border px-3"
            >
              {roleOptions.map(o => (
                <option key={o.id} value={o.id}>
                  {o.name?.replace(/^ROLE_/, "")}
                </option>
              ))}
            </select>

            <label className="inline-flex items-center gap-2">
              <input type="checkbox" checked={form.enabled} onChange={e=>setForm({...form, enabled:e.target.checked})} />
              <span>Hoạt động</span>
            </label>

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
