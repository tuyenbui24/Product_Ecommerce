import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { verifyVnpayReturn } from "@/api/orderApi";

function Row({ label, value }) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <div className="min-w-40 text-gray-500">{label}</div>
      <div className="font-medium break-all">{value ?? "-"}</div>
    </div>
  );
}

export default function VnpayReturnPage() {
  const { search } = useLocation();
  const navigate = useNavigate();
  const [state, setState] = useState({ loading: true, valid: false, responseCode: "", params: {} });

  const qsObj = useMemo(() => Object.fromEntries(new URLSearchParams(search).entries()), [search]);

  useEffect(() => {
    if (!search || search.length <= 1) {
      navigate("/", { replace: true });
      return;
    }
    let mounted = true;
    verifyVnpayReturn(qsObj)
      .then(({ data }) => mounted && setState({ loading: false, ...data }))
      .catch(() => mounted && setState({ loading: false, error: true }));
    return () => { mounted = false; };
  }, [search, qsObj, navigate]);

  if (state.loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-3">Đang xác thực giao dịch…</h1>
        <p className="text-gray-600">Vui lòng chờ trong giây lát.</p>
      </div>
    );
  }

  const ok = state.valid && state.responseCode === "00";
  const p = state.params || {};
  const moneyVnd = (() => {
    const raw = Number(p.vnp_Amount || 0);
    return (raw / 100).toLocaleString("vi-VN") + " đ";
  })();

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className={`rounded-xl p-5 border ${ok ? "border-emerald-300 bg-emerald-50" : "border-rose-300 bg-rose-50"}`}>
        <h1 className="text-2xl font-bold mb-2">
          {ok ? "Thanh toán thành công" : "Thanh toán thất bại / chưa xác nhận"}
        </h1>
        <p className="text-gray-700 mb-4">
          {ok
            ? "Hệ thống sẽ/đã cập nhật trạng thái đơn hàng khi nhận IPN từ VNPAY."
            : "Nếu bạn đã thanh toán thành công, vui lòng đợi IPN hoặc thử thanh toán lại từ trang đơn hàng."}
        </p>

        <div className="rounded-lg bg-white border p-4 space-y-2">
          <Row label="Mã đơn hàng (vnp_TxnRef)" value={p.vnp_TxnRef} />
          <Row label="Số tiền" value={moneyVnd} />
          <Row label="Mã phản hồi (vnp_ResponseCode)" value={p.vnp_ResponseCode} />
          <Row label="Ngân hàng (vnp_BankCode)" value={p.vnp_BankCode} />
          <Row label="Mã giao dịch (vnp_TransactionNo)" value={p.vnp_TransactionNo} />
          <Row label="Ngày thanh toán (vnp_PayDate)" value={p.vnp_PayDate} />
          <Row label="Chữ ký hợp lệ" value={String(state.valid)} />
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link to="/orders" className="h-10 px-4 rounded bg-amber-500 text-white grid place-items-center hover:opacity-90">
            Xem đơn hàng của tôi
          </Link>
          <Link to="/" className="h-10 px-4 rounded border grid place-items-center hover:bg-gray-50">
            Về trang chủ
          </Link>
        </div>
      </div>

      {!ok && (
        <div className="mt-4 text-sm text-gray-600">
          <div className="font-semibold mb-1">Gợi ý xử lý khi không thành công:</div>
          <ul className="list-disc pl-5 space-y-1">
            <li>Đảm bảo IPN đến được server (URL public/tunnel đúng và đang chạy).</li>
            <li>Kiểm tra lại trạng thái đơn ở mục “Đơn hàng của tôi” (IPN có thể đến trễ vài giây).</li>
            <li>Nếu đơn vẫn <b>PENDING</b>, dùng nút “Thanh toán lại” ở chi tiết đơn.</li>
          </ul>
        </div>
      )}
    </div>
  );
}
