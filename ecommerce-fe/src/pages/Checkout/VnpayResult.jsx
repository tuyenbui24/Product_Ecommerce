import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function VnpayResultPage() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const qs = useMemo(() => new URLSearchParams(search), [search]);

  const status = qs.get("status"); 
  const orderId = qs.get("orderId"); 

  const ok = status === "success";

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-3">Kết quả thanh toán VNPAY</h1>

      {ok ? (
        <div className="rounded border p-4 bg-green-50">
          <div className="font-semibold text-green-700">Thanh toán thành công!</div>
          <div className="mt-2 text-sm">Mã đơn hàng: <b>#{orderId}</b></div>
          <button className="mt-4 h-10 px-4 rounded bg-indigo-600 text-white"
                  onClick={() => navigate("/orders")}>
            Xem đơn hàng
          </button>
        </div>
      ) : (
        <div className="rounded border p-4 bg-amber-50">
          <div className="font-semibold text-amber-700">Thanh toán chưa thành công.</div>
          <div className="mt-2 text-sm">Mã đơn hàng: <b>#{orderId || "-"}</b></div>
          <div className="mt-4 flex gap-2">
            <button className="h-10 px-4 rounded border" onClick={() => navigate("/orders")}>
              Về danh sách đơn hàng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
