import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createOrderCOD } from "@/api/orderApi";
import { toast } from "react-toastify";
// import { useSelector } from "react-redux";

export default function CheckoutPage() {
  const navigate = useNavigate();
  // const { items, totalPrice } = useSelector((s) => s.cart);
  const [shippingAddress, setShippingAddress] = useState("");
  const [note, setNote] = useState("");
  const [method, setMethod] = useState("COD"); // "COD" | "VNPAY"
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!shippingAddress.trim()) {
      toast.error("Vui lòng nhập địa chỉ giao hàng.");
      return;
    }
    if (method !== "COD") {
      toast.info("Thanh toán VNPAY sẽ làm sau. Vui lòng chọn COD.");
      return;
    }
    try {
      setSubmitting(true);
      const res = await createOrderCOD({ shippingAddress, note });
      toast.success("Đặt hàng thành công (COD)!");
      // Điều hướng về danh sách đơn hoặc trang chi tiết đơn
      navigate("/orders"); // hoặc `/orders/${res.data.id}`
    } catch (err) {
      const msg = err?.response?.data?.message || "Đặt hàng thất bại.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl p-4 md:p-6">
      <h1 className="text-2xl font-semibold mb-4">Thanh toán</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <form onSubmit={handleSubmit} className="md:col-span-2 space-y-6">
          <div className="rounded-2xl shadow p-4 md:p-6 bg-white">
            <h2 className="text-lg font-semibold mb-4">Thông tin giao hàng</h2>
            <label className="block text-sm font-medium mb-1">Địa chỉ *</label>
            <input
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ví dụ: Số 123, Đường ABC, Quận XYZ, TP. HCM"
            />

            <label className="block text-sm font-medium mt-4 mb-1">Ghi chú</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-xl border px-3 py-2 min-h-[90px] outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ghi chú cho người giao hàng (không bắt buộc)"
            />
          </div>

          <div className="rounded-2xl shadow p-4 md:p-6 bg-white">
            <h2 className="text-lg font-semibold mb-4">Phương thức thanh toán</h2>

            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="method"
                  value="COD"
                  checked={method === "COD"}
                  onChange={() => setMethod("COD")}
                />
                <div>
                  <div className="font-medium">Thanh toán khi nhận hàng (COD)</div>
                  <div className="text-sm text-gray-500">
                    Bạn sẽ trả tiền mặt khi nhận hàng.
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-xl border opacity-60 cursor-not-allowed">
                <input type="radio" name="method" value="VNPAY" disabled />
                <div>
                  <div className="font-medium">Thanh toán qua VNPAY</div>
                  <div className="text-sm text-gray-500">Sắp có</div>
                </div>
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 w-full md:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {submitting ? "Đang đặt hàng..." : "Đặt hàng (COD)"}
            </button>
          </div>
        </form>

        <aside className="md:col-span-1">
          <div className="rounded-2xl shadow p-4 md:p-6 bg-white">
            <h3 className="text-lg font-semibold mb-4">Tóm tắt đơn hàng</h3>

            {/* Nếu có cartSlice: render danh sách items + tổng */}
            {/* <ul className="space-y-2">
              {items.map(it => (
                <li key={it.productId} className="flex justify-between text-sm">
                  <span>{it.productName} x{it.quantity}</span>
                  <span>{it.price.toLocaleString("vi-VN")}₫</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 border-t pt-3 flex justify-between font-semibold">
              <span>Tổng cộng</span>
              <span>{Number(totalPrice||0).toLocaleString("vi-VN")}₫</span>
            </div> */}

            {/* Nếu chưa có cartSlice, tạm thời để note: */}
            <p className="text-sm text-gray-500">
              (Gắn dữ liệu giỏ hàng thật từ Redux sau—danh sách món + tổng tiền)
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
