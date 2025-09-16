import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { loginUserThunk } from "@store/slices/authSlice";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const dest = location.state?.from?.pathname || "/";
  const { loading, error } = useSelector((s) => s.auth || {});
  const [showPwd, setShowPwd] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const onChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
  const onSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(loginUserThunk(form));
    if (!res.error) navigate(dest, { replace: true });
  };

  return (
    <div className="min-h-[calc(100vh-64px)] grid place-items-center px-4 py-6">
      <div className="w-[640px] max-w-[95vw] bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-amber-500 mb-6">Đăng nhập</h1>

        {error && <div className="mb-4 rounded bg-red-50 text-red-700 px-3 py-2 text-sm">
          {error.message || "Đăng nhập thất bại"}
        </div>}

        <form onSubmit={onSubmit} className="grid gap-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input name="email" type="email" value={form.email} onChange={onChange}
              className="w-full h-11 rounded-lg border px-3 focus:outline-none focus:ring-2 focus:ring-blue-500/40" required/>
          </div>
          <div>
            <label className="block text-sm mb-1">Mật khẩu</label>
            <div className="relative">
              <input name="password" type={showPwd ? "text" : "password"} value={form.password} onChange={onChange}
                className="w-full h-11 rounded-lg border px-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500/40" required/>
              <button type="button" onClick={() => setShowPwd(v=>!v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-10 grid place-items-center rounded-md border bg-gray-50 hover:bg-gray-100">
                {showPwd ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="mt-2 h-11 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium">
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <p className="text-center text-sm mt-4">
          Bạn là nhân viên?
          <Link to="/admin/login" className="text-blue-600 font-semibold hover:underline">Đăng nhập Admin</Link>
        </p>
        <p className="text-center text-sm mt-2">
          Chưa có tài khoản? <Link to="/register" className="text-blue-600 font-semibold hover:underline">Đăng ký</Link>
        </p>
      </div>
    </div>
  );
}
