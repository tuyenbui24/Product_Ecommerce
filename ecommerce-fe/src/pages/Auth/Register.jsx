import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { registerUser } from "@/api/authApi";
import { toast } from "react-toastify";

const GMAIL_REGEX = /^[A-Za-z0-9._%+-]+@gmail\.com$/;

export default function Register() {
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const onChange = (e) =>
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));

  const onInvalid = (e) => {
    const el = e.target;
    el.setCustomValidity("");

    if (el.validity.valueMissing) {
      el.setCustomValidity("Vui lòng điền thông tin này.");
    } else if (el.name === "email") {
      if (el.validity.typeMismatch) {
        el.setCustomValidity("Email không hợp lệ.");
      } else if (el.validity.patternMismatch) {
        el.setCustomValidity("Email phải kết thúc bằng @gmail.com.");
      }
    } else if (el.name === "password" && el.validity.tooShort) {
      el.setCustomValidity("Mật khẩu tối thiểu 6 ký tự.");
    }
  };

  const onInput = (e) => e.target.setCustomValidity("");

  
  function parseError(error) {
    const data = error?.response?.data;

    
    if (typeof data === "string") return data;

    
    if (data && typeof data === "object") {
      if (data.errors && data.errors.email) return data.errors.email;
      if (data.email) return data.email; 
      if (data.message) return data.message;
    }

    
    if (error?.response?.status === 400) return "Email không hợp lệ.";

    
    return "Có lỗi xảy ra. Vui lòng thử lại.";
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    
    const payload = {
      ...form,
      email: (form.email || "").trim().toLowerCase(),
      firstName: (form.firstName || "").trim(),
      lastName: (form.lastName || "").trim(),
    };

    if (!GMAIL_REGEX.test(payload.email)) {
      setErr("Email không hợp lệ (phải kết thúc bằng @gmail.com).");
      return;
    }

    if (!payload.firstName || !payload.lastName) {
      setErr("Vui lòng nhập đầy đủ Họ và Tên.");
      return;
    }

    setLoading(true);
    try {
      await registerUser(payload);
      toast.success("Đăng ký thành công!");
      setTimeout(() => navigate("/login"), 1000);
    } catch (error) {
      setErr(parseError(error));
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
              onInvalid={onInvalid}
              onInput={onInput}
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
              onInvalid={onInvalid}
              onInput={onInput}
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
              onBlur={(e) => {
                e.target.value = e.target.value.trim().toLowerCase();
                setForm((s) => ({ ...s, email: e.target.value }));
              }}
              pattern="^[A-Za-z0-9._%+-]+@gmail\.com$"
              onInvalid={onInvalid}
              onInput={onInput}
              placeholder="you@gmail.com"
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
                onInvalid={onInvalid}
                onInput={onInput}
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
          Bạn đã có tài khoản?{" "}
          <Link to="/login" className="text-blue-600 font-semibold hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
