import { useEffect, useMemo, useState } from "react";
import {
  adminListOrders,
  adminGetOrder,
  adminUpdateOrderStatus,
  adminDeleteOrder,
} from "@/api/adminApi";
import { toast } from "react-toastify";
import { fmtPrice } from "@/utils/formatCurrency";
import OrderDetailModal from "@pages/Order/OrderDetail";

const STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "COMPLETED",
  "FAILED",
  "CANCELED",
];

function fmtDate(v) {
  if (!v) return "-";
  const d = new Date(v);
  return isNaN(d) ? "-" : d.toLocaleString("vi-VN");
}

export default function AdminOrders() {
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    statusText: "",
    keyword: "",
  });

  const [open, setOpen] = useState(false);
  const [order, setOrder] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(false);

  const load = async (_page = page, _size = size, _filters = filters) => {
    setLoading(true);
    try {
      const params = {};
      if (_filters.from) params.from = new Date(_filters.from).toISOString();
      if (_filters.to) params.to = new Date(_filters.to).toISOString();
      if (_filters.statusText?.trim())
        params.statusText = _filters.statusText.trim();
      if (_filters.keyword?.trim()) params.keyword = _filters.keyword.trim();

      const { data } = await adminListOrders(_page, _size, params);
      const list = data?.content ?? [];
      setRows(list);
      setSize(data?.size ?? _size);
      setTotal(data?.totalElements ?? 0);
    } catch (e) {
      toast.error(
        e?.response?.data?.message || "Tải danh sách đơn hàng thất bại"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1, size);
  }, []);
  useEffect(() => {
    load(page, size);
  }, [page, size]);

  const onSubmitFilter = (e) => {
    e.preventDefault();
    setPage(1);
    load(1, size, filters);
  };

  const onClearFilter = () => {
    const empty = { from: "", to: "", statusText: "", keyword: "" };
    setFilters(empty);
    setPage(1);
    load(1, size, empty);
  };

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((total || 0) / (size || 10))),
    [total, size]
  );

  const openDetail = async (id) => {
    setOrder(null);
    setLoadingOrder(true);
    try {
      const { data } = await adminGetOrder(id);
      setOrder(data);
      setOpen(true);
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
      load(page, size);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Cập nhật trạng thái thất bại");
    }
  };

  const onChangeStatusInModal = async (newStatus) => {
    if (!order) return;
    try {
      await adminUpdateOrderStatus(order.id, newStatus);
      toast.success("Đã cập nhật trạng thái");
      const { data } = await adminGetOrder(order.id);
      setOrder(data);
      load(page, size);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Cập nhật trạng thái thất bại");
    }
  };

  const onDeleteRow = async (row) => {
    if (!confirm(`Xoá đơn #${row.id}?`)) return;
    try {
      await adminDeleteOrder(row.id);
      toast.success("Đã xoá đơn hàng");
      if (rows.length === 1 && page > 1) setPage((p) => p - 1);
      else load(page, size, filters);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Xoá đơn thất bại");
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
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <span>Tổng: {total} đơn</span>
          <select
            value={size}
            onChange={(e) => {
              setPage(1);
              setSize(Number(e.target.value) || 10);
            }}
            className="h-9 rounded border px-2"
            title="Số dòng mỗi trang"
          >
            {[5, 10, 15, 20].map((n) => (
              <option key={n} value={n}>
                {n}/trang
              </option>
            ))}
          </select>
        </div>
      </div>

      <form
        onSubmit={onSubmitFilter}
        className="bg-white rounded-lg shadow p-3 grid gap-3 md:grid-cols-5"
      >
        <div>
          <label className="block text-xs text-gray-600 mb-1">Từ ngày</label>
          <input
            type="datetime-local"
            value={filters.from}
            onChange={(e) =>
              setFilters((f) => ({ ...f, from: e.target.value }))
            }
            className="h-10 rounded border px-3 w-full"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">Đến ngày</label>
          <input
            type="datetime-local"
            value={filters.to}
            onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))}
            className="h-10 rounded border px-3 w-full"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-600 mb-1">
            Trạng thái (VN hoặc EN)
          </label>
          <input
            value={filters.statusText}
            onChange={(e) =>
              setFilters((f) => ({ ...f, statusText: e.target.value }))
            }
            placeholder="vd: Đang xử lý / Đã hủy / PAID"
            className="h-10 rounded border px-3 w-full"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs text-gray-600 mb-1">Từ khóa</label>
          <input
            value={filters.keyword}
            onChange={(e) =>
              setFilters((f) => ({ ...f, keyword: e.target.value }))
            }
            placeholder="Tên KH, SĐT, địa chỉ, ghi chú, (gõ số = tìm ID)"
            className="h-10 rounded border px-3 w-full"
          />
        </div>
        <div className="md:col-span-5 flex items-center gap-2">
          <button className="h-10 px-4 rounded bg-blue-600 text-white">
            Tìm kiếm
          </button>
          <button
            type="button"
            onClick={onClearFilter}
            className="h-10 px-4 rounded border"
          >
            XOÁ
          </button>
        </div>
      </form>

      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead className="bg-gray-50 text-sm">
            <tr className="text-left">
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">Ngày đặt</th>
              <th className="px-3 py-2">Người đặt</th>
              <th className="px-3 py-2">Số điện thoại</th>
              <th className="px-3 py-2">Địa chỉ</th>
              <th className="px-3 py-2">Ghi chú</th>
              <th className="px-3 py-2">Tổng tiền</th>
              <th className="px-3 py-2">Trạng thái</th>
              <th className="px-3 py-2">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {!loading && rows?.length === 0 && (
              <tr>
                <td colSpan={9} className="px-3 py-4 text-center text-gray-500">
                  Không có dữ liệu
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="px-3 py-2">{r.id}</td>
                <td className="px-3 py-2">{fmtDate(r.orderTime)}</td>
                <td className="px-3 py-2">{r.userFullName || "-"}</td>
                <td className="px-3 py-2">{r.phoneNumber || "-"}</td>
                <td className="px-3 py-2">{r.shippingAddress || "-"}</td>
                <td className="px-3 py-2">{r.note || "-"}</td>
                <td className="px-3 py-2">{fmtPrice(r.totalPrice)} đ</td>
                <td className="px-3 py-2">
                  <select
                    value={r.status}
                    onChange={(e) => onChangeStatusRow(r, e.target.value)}
                    className="h-9 rounded border px-2"
                    title={r.statusLabel || r.status}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {{
                          PENDING: "Chờ xử lý",
                          CONFIRMED: "Đã xác nhận",
                          PAID: "Đã thanh toán",
                          PROCESSING: "Đang xử lý",
                          SHIPPED: "Đang giao",
                          COMPLETED: "Hoàn tất",
                          FAILED: "Thất bại",
                          CANCELED: "Đã hủy",
                        }[s] || s}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openDetail(r.id)}
                      className="h-9 px-3 rounded border"
                    >
                      Xem
                    </button>
                    <button
                      onClick={() => onDeleteRow(r)}
                      className="h-9 px-3 rounded bg-red-600 text-white"
                      title="Xoá đơn hàng"
                      disabled={loading}
                    >
                      Xoá
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && (
          <div className="p-4 text-center text-gray-500">Đang tải...</div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
          className="h-9 px-3 rounded border disabled:opacity-60"
        >
          Trước
        </button>
        <div className="text-sm">
          Trang {page}/{totalPages}
        </div>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="h-9 px-3 rounded border disabled:opacity-60"
        >
          Sau
        </button>
      </div>

      <OrderDetailModal
        open={open}
        onClose={() => setOpen(false)}
        data={order}
        onChangeStatus={onChangeStatusInModal}
      />
    </div>
  );
}
