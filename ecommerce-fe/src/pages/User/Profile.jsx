import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import http from "@/api/http";
import { logoutThunk } from "@store/slices/authSlice";

export default function Profile() {
  const dispatch = useDispatch();
  const auth = useSelector((s) => s.auth || {});

  const [me, setMe] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const [pwd, setPwd] = useState({ oldPassword: "", newPassword: "", confirm: "" });
  const [pwdMsg, setPwdMsg] = useState("");
  const [pwdErr, setPwdErr] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setErr("");
        setMsg("");

        if (auth?.user?.email) {
          const u = auth.user;
          if (!cancelled) {
            setMe({
              firstName: u.firstName || "",
              lastName: u.lastName || "",
              email: u.email || "",
            });
          }
        }

        const { data } = await http.get("/users/me");
        if (!cancelled) {
          setMe((s) => ({
            ...s,
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            email: data.email || "",
          }));
        }
      } catch (e) {
        const status = e?.response?.status;
        if (status === 401) {
          setErr("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.");
          setTimeout(() => (window.location.href = "/login"), 800);
        } else {
          setErr(e?.response?.data?.message || "Không tải được thông tin.");
        }
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [auth?.user]);

  async function onSaveProfile(e) {
    e.preventDefault();
    setSaving(true);
    setErr("");
    setMsg("");
    try {
      await http.put("/users/me", {
        firstName: me.firstName,
        lastName: me.lastName,
      });
      setMsg("Cập nhật thông tin thành công.");
    } catch (e) {
      const status = e?.response?.status;
      if (status === 401) {
        setErr("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.");
        setTimeout(() => (window.location.href = "/login"), 800);
      } else if (status === 403) {
        setErr("Bạn không có quyền cập nhật thông tin này.");
      } else {
        setErr(e?.response?.data?.message || "Cập nhật thất bại.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function onChangePassword(e) {
    e.preventDefault();
    setPwdErr("");
    setPwdMsg("");

    if (pwd.newPassword.length < 6) return setPwdErr("Mật khẩu mới phải từ 6 ký tự.");
    if (pwd.newPassword !== pwd.confirm) return setPwdErr("Xác nhận mật khẩu không khớp.");

    setPwdLoading(true);
    try {
      await http.put("/users/me/password", {
        oldPassword: pwd.oldPassword,
        newPassword: pwd.newPassword,
        confirmPassword: pwd.confirm,
      });
      setPwdMsg("Đổi mật khẩu thành công.");
      setPwd({ oldPassword: "", newPassword: "", confirm: "" });
    } catch (e) {
      const status = e?.response?.status;
      if (status === 401) {
        setPwdErr("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.");
        setTimeout(() => (window.location.href = "/login"), 800);
      } else if (status === 403) {
        setPwdErr("Bạn không có quyền đổi mật khẩu.");
      } else {
        setPwdErr(e?.response?.data?.message || "Đổi mật khẩu thất bại.");
      }
    } finally {
      setPwdLoading(false);
    }
  }

  const onLogout = async () => {
    await dispatch(logoutThunk());
    window.location.href = "/login";
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-4">Thông tin của bạn</h1>

      <form onSubmit={onSaveProfile} className="bg-white rounded-xl shadow p-6 mb-6 grid gap-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              className="w-full h-11 rounded-lg border px-3 bg-gray-50"
              value={me.email}
              disabled
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Họ</label>
            <input
              className="w-full h-11 rounded-lg border px-3 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              value={me.lastName}
              onChange={(e) => setMe({ ...me, lastName: e.target.value })}
              placeholder="Nguyễn"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Tên</label>
            <input
              className="w-full h-11 rounded-lg border px-3 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              value={me.firstName}
              onChange={(e) => setMe({ ...me, firstName: e.target.value })}
              placeholder="Văn A"
              required
            />
          </div>
        </div>

        {msg && <div className="text-green-700 bg-green-50 rounded px-3 py-2 text-sm">{msg}</div>}
        {err && <div className="text-red-700 bg-red-50 rounded px-3 py-2 text-sm">{err}</div>}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving}
            className="h-11 px-5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-60"
          >
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </form>

      <form onSubmit={onChangePassword} className="bg-white rounded-xl shadow p-6 mb-6 grid gap-4">
        <h2 className="text-lg font-semibold">Đổi mật khẩu</h2>

        <input
          type="password"
          className="w-full h-11 rounded-lg border px-3"
          placeholder="Mật khẩu hiện tại"
          value={pwd.oldPassword}
          onChange={(e) => setPwd({ ...pwd, oldPassword: e.target.value })}
          required
        />
        <input
          type="password"
          className="w-full h-11 rounded-lg border px-3"
          placeholder="Mật khẩu mới"
          value={pwd.newPassword}
          onChange={(e) => setPwd({ ...pwd, newPassword: e.target.value })}
          required
          minLength={6}
        />
        <input
          type="password"
          className="w-full h-11 rounded-lg border px-3"
          placeholder="Nhập lại mật khẩu mới"
          value={pwd.confirm}
          onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
          required
          minLength={6}
        />

        {pwdMsg && <div className="text-green-700 bg-green-50 rounded px-3 py-2 text-sm">{pwdMsg}</div>}
        {pwdErr && <div className="text-red-700 bg-red-50 rounded px-3 py-2 text-sm">{pwdErr}</div>}

        <button
          type="submit"
          disabled={pwdLoading}
          className="h-11 px-5 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-medium disabled:opacity-60"
        >
          {pwdLoading ? "Đang đổi mật khẩu..." : "Đổi mật khẩu"}
        </button>
      </form>

      <div className="bg-white rounded-xl shadow p-6 flex justify-between items-center">
        <div className="text-sm text-gray-600">Đăng xuất khỏi tài khoản?</div>
        <button
          onClick={onLogout}
          className="h-11 px-5 rounded-full bg-red-600 hover:bg-red-700 text-white font-medium"
        >
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
