import { useEffect, useMemo, useState } from "react";
import {
  adminListOrders,
  adminGetOrder,
  adminUpdateOrderStatus,
} from "@/api/adminApi";
import { toast } from "react-toastify";
import { fmtPrice, fmtVND } from "@/utils/formatCurrency";

const STATUSES = ["PENDING", "PROCESSING", "SHIPPED", "COMPLETED", "CANCELED"];

function fmtDate(v) {
  if (!v) return "-";
  const d = new Date(v);
  return isNaN(d) ? "-" : d.toLocaleString("vi-VN");
}

export default function AdminOrders() {
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [size, setSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // Modal
  const [open, setOpen] = useState(false);
  const [order, setOrder] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(false);

  const load = async (_page = page) => {
    setLoading(true);
    try {
      const { data } = await adminListOrders(_page); // GET /api/admin/orders?page=
      const list = data?.content ?? [];
      setRows(list);
      setSize(data?.size ?? 10);
      setTotal(data?.totalElements ?? list.length);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Tải danh sách đơn hàng thất bại");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(1); }, []);
  useEffect(() => { load(page); /* eslint-disable-next-line */ }, [page]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((total || 0) / (size || 10))),
    [total, size]
  );

  const openDetail = async (id) => {
    setOpen(true);
    setOrder(null);
    setLoadingOrder(true);
    try {
      const { data } = await adminGetOrder(id); // GET /api/admin/orders/{id}
      setOrder(data);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Tải chi tiết đơn thất bại");
      setOpen(false);
    } finally {
      setLoadingOrder(false);
    }
  };

  const onChangeStatusRow = async (row, newStatus) => {
    try {
      await adminUpdateOrderStatus(row.id, newStatus);
      toast.success("Đã cập nhật trạng thái");
      load(page);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Cập nhật trạng thái thất bại");
    }
  };

  const onChangeStatusInModal = async (newStatus) => {
    if (!order) return;
    try {
      await adminUpdateOrderStatus(order.id, newStatus);
      toast.success("Đã cập nhật trạng thái");
      // reload modal + list
      const { data } = await adminGetOrder(order.id);
      setOrder(data);
      load(page);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Cập nhật trạng thái thất bại");
    }
  };

  const computedTotal =
    order?.items?.reduce(
      (s, it) => s + Number(it.price || 0) * Number(it.quantity || 0),
      0
    ) ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý đơn hàng</h1>
        <div className="text-sm text-gray-600">Tổng: {total} đơn</div>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead className="bg-gray-50 text-sm">
            <tr className="text-left">
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">Ngày đặt</th>
              <th className="px-3 py-2">Người đặt</th>
              <th className="px-3 py-2">Địa chỉ</th>
              <th className="px-3 py-2">Ghi chú</th>
              <th className="px-3 py-2">Tổng tiền</th>
              <th className="px-3 py-2">Trạng thái</th>
              <th className="px-3 py-2">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {!loading && rows?.length === 0 && (
              <tr><td colSpan={8} className="px-3 py-4 text-center text-gray-500">Không có dữ liệu</td></tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-3 py-2">{r.id}</td>
                <td className="px-3 py-2">{fmtDate(r.orderTime)}</td>
                <td className="px-3 py-2">{r.userFullName || "-"}</td>
                <td className="px-3 py-2">{r.shippingAddress || "-"}</td>
                <td className="px-3 py-2">{r.note || "-"}</td>
                <td className="px-3 py-2">{fmtPrice(r.totalPrice)} đ</td>
                <td className="px-3 py-2">
                  <select
                    value={r.status}
                    onChange={(e) => onChangeStatusRow(r, e.target.value)}
                    className="h-9 rounded border px-2"
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <button
                    onClick={() => openDetail(r.id)}
                    className="h-9 px-3 rounded border"
                  >
                    Xem
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <div className="p-4 text-center text-gray-500">Đang tải...</div>}
      </div>

      <div className="flex items-center gap-2">
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

      {/* MODAL chi tiết đơn hàng (kèm ảnh sản phẩm) */}
      {open && (
        <div className="fixed inset-0 bg-black/30 grid place-items-center p-4 z-50">
          <div className="bg-white w-[960px] max-w-[95vw] rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Đơn #{order?.id}</h2>
              <button onClick={() => setOpen(false)} className="h-9 px-3 rounded border">Đóng</button>
            </div>

            {loadingOrder && <div className="p-3 text-gray-500">Đang tải chi tiết...</div>}

            {!loadingOrder && order && (
              <>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded p-3 space-y-1">
                    <div className="font-semibold">Khách hàng</div>
                    <div>Tên: {order.userFullName || "-"}</div>
                    <div>Email: -</div>
                    <div>Địa chỉ: {order.shippingAddress || "-"}</div>
                    <div>Điện thoại: -</div>
                  </div>
                  <div className="bg-gray-50 rounded p-3 space-y-1">
                    <div className="font-semibold">Thông tin đơn</div>
                    <div>Trạng thái: <b>{order.status}</b></div>
                    <div>Tổng tiền: {fmtPrice(order.totalPrice ?? computedTotal)} đ</div>
                    <div>Ngày đặt: {fmtDate(order.orderTime)}</div>
                  </div>
                </div>

                <div className="overflow-x-auto border rounded mt-4">
                  <table className="min-w-full">
                    <thead className="bg-gray-50 text-sm">
                      <tr className="text-left">
                        <th className="px-3 py-2">Sản phẩm</th>
                        <th className="px-3 py-2">SL</th>
                        <th className="px-3 py-2">Giá</th>
                        <th className="px-3 py-2">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(order.items ?? []).map((it, idx) => (
                        <tr key={idx} className="border-t">
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded bg-gray-50 border overflow-hidden shrink-0">
                                {it.image && (
                                  <img
                                    src={`/product-image/${it.productId}/${encodeURIComponent(it.image)}`}
                                    alt=""
                                    className="w-full h-full object-cover"
                                    onError={(e) => (e.currentTarget.style.display = "none")}
                                  />
                                )}
                              </div>
                              <div className="font-medium">{it.productName}</div>
                            </div>
                          </td>
                          <td className="px-3 py-2">{it.quantity}</td>
                          <td className="px-3 py-2">{fmtPrice(it.price)} đ</td>
                          <td className="px-3 py-2">
                            {fmtPrice(Number(it.price || 0) * Number(it.quantity || 0))} đ
                          </td>
                        </tr>
                      ))}
                      {(!order.items || order.items.length === 0) && (
                        <tr>
                          <td colSpan={4} className="px-3 py-4 text-center text-gray-500">
                            Không có sản phẩm
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="mt-3 flex items-center justify-end gap-2">
                  <div>Đổi trạng thái:&nbsp;</div>
                  <select
                    value={order.status}
                    onChange={(e) => onChangeStatusInModal(e.target.value)}
                    className="h-9 rounded border px-2"
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
