import { useEffect, useMemo, useState } from "react";
import { getMyOrdersPaged, getMyOrderById } from "@/api/orderApi";
import { toast } from "react-toastify";
import OrderDetailModal from "@pages/Order/OrderDetail";
import { fmtPrice } from "@/utils/formatCurrency";

const statusMap = {
   PENDING:    { label: "Chờ xử lý",  cls: "bg-yellow-100 text-yellow-800" },
   CONFIRMED:  { label: "Đã xác nhận",cls: "bg-blue-100 text-blue-800" },
   PAID:       { label: "Đã thanh toán", cls: "bg-sky-100 text-sky-800" },
   PROCESSING: { label: "Đang xử lý", cls: "bg-purple-100 text-purple-800" },
   SHIPPED:    { label: "Đang giao",  cls: "bg-indigo-100 text-indigo-800" },
   COMPLETED:  { label: "Hoàn tất",   cls: "bg-green-100 text-green-700" },
   FAILED:     { label: "Thất bại",   cls: "bg-gray-200 text-gray-700" },
   CANCELED:   { label: "Đã hủy",     cls: "bg-red-100 text-red-700" },
};

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [openId, setOpenId] = useState(null);
  const [detail, setDetail] = useState(null);

  const load = async (_page = page, _size = size) => {
    try {
      setLoading(true);
      const { data } = await getMyOrdersPaged(_page, _size);
      setOrders(data?.content ?? []);
      setTotal(data?.totalElements ?? 0);
      setSize(data?.size ?? _size);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Không tải được đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1, size); }, []);
  useEffect(() => { load(page, size);}, [page, size]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((total || 0) / (size || 10))),
    [total, size]
  );

  const onOpen = async (id) => {
    try {
      setOpenId(id);
      const { data } = await getMyOrderById(id);
      setDetail(data);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Không tải được chi tiết đơn");
    }
  };
  const onClose = () => { setOpenId(null); setDetail(null); };

  return (
    <div className="max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Đơn hàng của tôi</h1>
        <select
          value={size}
          onChange={(e) => { setPage(1); setSize(Number(e.target.value) || 10); }}
          className="h-9 rounded border px-2 text-sm"
          title="Số dòng mỗi trang"
        >
          {[5,10,15,20].map(n => <option key={n} value={n}>{n}/trang</option>)}
        </select>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Ngày đặt</th>
                <th className="px-4 py-3">Tổng tiền</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 w-24">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Đang tải...</td></tr>
              )}
              {!loading && orders.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">Chưa có đơn nào</td></tr>
              )}
              {!loading && orders.map((o) => {
                const st = statusMap[o.status] || { label: (o.statusLabel || o.status), cls: "bg-gray-100 text-gray-700" };
                return (
                  <tr key={o.id} className="border-t">
                    <td className="px-4 py-3">#{o.id}</td>
                    <td className="px-4 py-3">{o.orderTime ? o.orderTime.replace("T", " ") : "-"}</td>
                    <td className="px-4 py-3 font-medium text-rose-600">{fmtPrice(o.totalPrice)} đ</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${st.cls}`}>{st.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => onOpen(o.id)} className="h-9 px-3 rounded border hover:bg-gray-50">
                        Xem
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3">
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
          className="h-9 px-3 rounded border disabled:opacity-60"
        >
          Trước
        </button>
        <div className="text-sm">Trang {page}/{totalPages}</div>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="h-9 px-3 rounded border disabled:opacity-60"
        >
          Sau
        </button>
      </div>

      {openId && <OrderDetailModal open onClose={onClose} data={detail} />}
    </div>
  );
}
