import PropTypes from "prop-types";
import { fmtPrice } from "@/utils/formatCurrency";
import { payAgainVnpay } from "@/api/orderApi";
import { toast } from "react-toastify";
import { useState } from "react";

export default function OrderDetailModal({ open, onClose, data, isAdmin = false }) {
  const [paying, setPaying] = useState(false);
  if (!open) return null;

  const items = data?.items || [];

  const canPayAgain =
    !isAdmin &&
    ["PENDING", "FAILED"].includes(String(data?.status).toUpperCase()) &&
    String(data?.paymentMethod).toUpperCase() === "VNPAY";

  const onPayAgain = async () => {
    try {
      setPaying(true);
      const url = await payAgainVnpay(data.id);
      window.location.href = url;
    } catch (e) {
      toast.error(e?.response?.data?.message || "Không tạo được link thanh toán lại.");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40">
      <div className="w-[min(900px,92vw)] bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-5 py-3 border-b flex items-center justify-between">
          <div className="font-semibold">Đơn #{data?.id || "-"}</div>

          <div className="flex items-center gap-2">
            {canPayAgain && (
              <button
                onClick={onPayAgain}
                disabled={paying}
                className="h-9 px-3 rounded bg-amber-500 text-white hover:opacity-90 disabled:opacity-60"
                title="Thanh toán lại qua VNPAY"
              >
                {paying ? "Đang tạo link..." : "Thanh toán lại"}
              </button>
            )}
            <button onClick={onClose} className="h-9 px-3 rounded border hover:bg-gray-50">
              Đóng
            </button>
          </div>
        </div>

        <div className="p-5 grid md:grid-cols-2 gap-6">
          <div className="space-y-1 text-sm">
            <div className="font-semibold mb-1">Khách hàng</div>
            <div>Tên: {data?.userFullName || "-"}</div>
            <div>Địa chỉ: {data?.shippingAddress?.trim() || "-"}</div>
            <div>Số điện thoại: {data?.phoneNumber?.trim() || "-"}</div>
            <div>Ghi chú: {data?.note?.trim() || "-"}</div>
          </div>

          <div className="space-y-1 text-sm">
            <div className="font-semibold mb-1">Thông tin đơn</div>
            <div>Trạng thái: {data?.statusLabel || data?.status}</div>
            <div>Loại thanh toán: {data?.paymentMethod}</div>
            <div>
              Tổng tiền:{" "}
              <b className="text-rose-600">{fmtPrice(data?.totalPrice, true)} đ</b>
            </div>
            <div>
              Ngày đặt: {data?.orderTime ? data.orderTime.replace("T", " ") : "-"}
            </div>
          </div>

          <div className="md:col-span-2">
            <div className="rounded border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr className="text-left">
                    <th className="px-3 py-2">Sản phẩm</th>
                    <th className="px-3 py-2">Size</th>
                    <th className="px-3 py-2">SL</th>
                    <th className="px-3 py-2">Giá</th>
                    <th className="px-3 py-2">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-3 py-6 text-center text-gray-500">
                        Không có sản phẩm
                      </td>
                    </tr>
                  )}
                  {items.map((it, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="px-3 py-2">{it.productName}</td>
                      <td className="px-3 py-2">{it.size || "-"}</td>
                      <td className="px-3 py-2">{it.quantity}</td>
                      <td className="px-3 py-2">{fmtPrice(it.price, true)} đ</td>
                      <td className="px-3 py-2 font-medium text-emerald-700">
                        {fmtPrice(Number(it.price || 0) * it.quantity, true)} đ
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

OrderDetailModal.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func,
  data: PropTypes.object,
  isAdmin: PropTypes.bool,
};
