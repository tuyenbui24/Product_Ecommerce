import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { registerUser } from "@/api/authApi";
import { toast } from "react-toastify";

export default function Register() {
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [okMsg, setOkMsg] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const onChange = (e) => setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await registerUser(form);
      toast.success("Đăng ký thành công!");
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      setErr(error.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] grid place-items-center px-4 py-6">
      <div className="w-[500px] max-w-[95vw] bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-center text-amber-500 mb-6">
          Đăng ký
        </h1>

        {err && (
          <div className="mb-4 rounded bg-red-50 text-red-700 px-3 py-2 text-sm">
            {err}
          </div>
        )}

        <form onSubmit={onSubmit} className="grid gap-4">
          <div>
            <label className="block text-sm mb-1">Họ</label>
            <input
              name="lastName"
              value={form.lastName}
              onChange={onChange}
              placeholder="Họ"
              className="w-full h-11 rounded-lg border px-3 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Tên</label>
            <input
              name="firstName"
              value={form.firstName}
              onChange={onChange}
              placeholder="Tên"
              className="w-full h-11 rounded-lg border px-3 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              placeholder="you@example.com"
              className="w-full h-11 rounded-lg border px-3 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Mật khẩu</label>
            <div className="relative">
              <input
                type={showPwd ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={onChange}
                placeholder="••••••••"
                className="w-full h-11 rounded-lg border px-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-10 grid place-items-center rounded-md border bg-gray-50 hover:bg-gray-100 cursor-pointer"
                aria-label={showPwd ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 h-11 rounded-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium"
          >
            {loading ? "Đang đăng ký..." : "Đăng ký"}
          </button>
        </form>

        <p className="text-center text-sm mt-4">
          Bạn đã có tài khoản?
          <Link to="/login" className="text-blue-600 font-semibold hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
