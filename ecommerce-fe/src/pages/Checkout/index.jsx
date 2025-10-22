import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { payAgainVnpay } from "@/api/orderApi";
import { toast } from "react-toastify";

export default function VnpayReturnPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const qs = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const rsp = qs.get("vnp_ResponseCode");
  const orderId = qs.get("vnp_TxnRef");
  const txnNo = qs.get("vnp_TransactionNo");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // có thể gọi BE /payments/vnpay/return (GET) để verify chữ ký nếu muốn hiển thị thêm
  }, []);

  const payAgain = async () => {
    try {
      setLoading(true);
      const url = await payAgainVnpay(orderId);
      window.location.href = url;
    } catch (e) {
      toast.error(e?.response?.data?.message || "Không tạo được URL thanh toán.");
    } finally {
      setLoading(false);
    }
  };

  const isSuccess = rsp === "00";

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-3">Kết quả thanh toán VNPAY</h1>

      {isSuccess ? (
        <div className="rounded border p-4 bg-green-50">
          <div className="font-semibold text-green-700">Thanh toán thành công!</div>
          <div className="mt-2 text-sm">
            Mã đơn hàng: <b>#{orderId}</b><br/>
            Mã giao dịch cổng: <b>{txnNo || "-"}</b>
          </div>
          <button
            className="mt-4 h-10 px-4 rounded bg-indigo-600 text-white"
            onClick={() => navigate("/orders")}
          >
            Xem đơn hàng
          </button>
        </div>
      ) : (
        <div className="rounded border p-4 bg-amber-50">
          <div className="font-semibold text-amber-700">Thanh toán chưa thành công.</div>
          <div className="mt-2 text-sm">
            Mã phản hồi: <b>{rsp || "-"}</b> &nbsp;|&nbsp; Đơn hàng: <b>#{orderId}</b>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              className="h-10 px-4 rounded bg-amber-500 text-white disabled:opacity-60"
              disabled={loading}
              onClick={payAgain}
            >
              {loading ? "Đang tạo lại link..." : "Thanh toán lại qua VNPAY"}
            </button>
            <button
              className="h-10 px-4 rounded border"
              onClick={() => navigate("/orders")}
            >
              Về danh sách đơn hàng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
