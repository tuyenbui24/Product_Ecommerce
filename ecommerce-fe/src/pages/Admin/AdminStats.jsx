import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  adminStatsSummary,
  adminStatsSalesTrend,
  adminStatsTopProducts,
  adminListOrders,
  exportStatsSummary,
  exportStatsSalesTrend,
  exportStatsTopProducts,
} from "@/api/adminApi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { fmtPrice } from "@/utils/formatCurrency";

function toIsoOrNull(v) {
  return v ? new Date(v).toISOString() : null;
}

function fmtDate(v) {
  if (!v) return "-";
  const d = new Date(v);
  return isNaN(d) ? "-" : d.toLocaleString("vi-VN");
}

function fmtWeekBucket(bucket) {
  const match = bucket.match(/^(\d{4})-W(\d{1,2})$/);
  if (!match) return bucket;
  const [_, year, week] = match;
  const w = parseInt(week);
  const firstDay = new Date(year, 0, 1 + (w - 1) * 7);
  const month = firstDay.getMonth() + 1;
  const monthStr = String(month).padStart(2, "0");
  const weekInMonth = Math.ceil(firstDay.getDate() / 7);
  return `${monthStr}/${year} - Tuần ${weekInMonth}`;
}

function getDefaultFrom() {
  const d = new Date();
  d.setDate(d.getDate() - 30); // lùi 30 ngày
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

function getDefaultTo() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

const SHOW_LIMIT = 12;

export default function AdminStats() {
  const [from, setFrom] = useState(() => getDefaultFrom());
  const [to, setTo] = useState(() => getDefaultTo());
  const [granularity, setGranularity] = useState("daily");

  const [summary, setSummary] = useState(null);
  const [trend, setTrend] = useState([]);
  const [top, setTop] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showDetail, setShowDetail] = useState(false);
  const [detailTitle, setDetailTitle] = useState("");
  const [detailOrders, setDetailOrders] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [showAllTrend, setShowAllTrend] = useState(false);

  const params = useMemo(
    () => ({
      from: toIsoOrNull(from),
      to: toIsoOrNull(to),
    }),
    [from, to]
  );

  const onExportSummary = async () => {
    try {
      await exportStatsSummary(params);
    } catch {
      toast.error("Xuất thống kê tổng quan thất bại");
    }
  };

  const onExportTrend = async () => {
    try {
      await exportStatsSalesTrend({ ...params, granularity });
    } catch {
      toast.error("Xuất doanh thu theo thời gian thất bại");
    }
  };

  const onExportTop = async () => {
    try {
      await exportStatsTopProducts({ ...params, limit: 10 });
    } catch {
      toast.error("Xuất top sản phẩm thất bại");
    }
  };

  const load = async () => {
    try {
      setLoading(true);
      setShowAllTrend(false);
      const [s, t, p] = await Promise.all([
        adminStatsSummary(params),
        adminStatsSalesTrend({ ...params, granularity }),
        adminStatsTopProducts({ ...params, limit: 10 }),
      ]);
      setSummary(s.data);
      const sorted = (t.data ?? []).sort(
        (a, b) => new Date(b.bucket) - new Date(a.bucket)
      );
      setTrend(sorted);
      setTop(p.data ?? []);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Không tải được thống kê");
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setFrom(getDefaultFrom());
    setTo(getDefaultTo());
    setGranularity("daily");
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to, granularity]);

  const openDetail = async (bucket) => {
    setShowDetail(true);
    setDetailTitle(bucket);
    setDetailOrders([]);
    setLoadingDetail(true);
    try {
      const fromDate = new Date(bucket);
      let toDate = new Date(bucket);
      if (granularity === "daily") {
        toDate.setDate(fromDate.getDate() + 1);
      } else if (granularity === "weekly") {
        toDate.setDate(fromDate.getDate() + 7);
      } else if (granularity === "monthly") {
        toDate.setMonth(fromDate.getMonth() + 1);
      }

      const { data } = await adminListOrders(1, 1000, {
        from: fromDate.toISOString(),
        to: toDate.toISOString(),
      });
      setDetailOrders(data?.content ?? []);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Không tải được chi tiết đơn");
    } finally {
      setLoadingDetail(false);
    }
  };

  const visibleTrend = showAllTrend ? trend : trend.slice(0, SHOW_LIMIT);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Thống kê</h1>

      {/* THANH FILTER + NÚT HÀNH ĐỘNG */}
      <div className="bg-white rounded-lg shadow p-3 space-y-3">
        {/* Hàng filter */}
        <div className="grid md:grid-cols-4 lg:grid-cols-5 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Từ</label>
            <input
              type="datetime-local"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="h-10 rounded border px-3 w-full text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Đến</label>
            <input
              type="datetime-local"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="h-10 rounded border px-3 w-full text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Phân loại</label>
            <select
              value={granularity}
              onChange={(e) => setGranularity(e.target.value)}
              className="h-10 rounded border px-3 w-full text-sm"
            >
              <option value="daily">Theo ngày</option>
              <option value="weekly">Theo tuần</option>
              <option value="monthly">Theo tháng</option>
            </select>
          </div>

          {/* Nút reset / load */}
          <div className="md:col-span-1 lg:col-span-2 flex items-end justify-end gap-2">
            <button
              onClick={resetFilters}
              className="h-10 px-4 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 text-sm whitespace-nowrap"
            >
              Xoá lọc
            </button>
            <button
              onClick={load}
              className="h-10 px-4 rounded bg-blue-600 text-white text-sm whitespace-nowrap"
            >
              Làm mới
            </button>
          </div>
        </div>

        {/* Hàng nút export (có flex-wrap, tự xuống dòng nếu chật) */}
        <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onExportSummary}
            className="h-9 px-3 rounded border bg-white text-sm whitespace-nowrap hover:bg-gray-100"
          >
            Xuất tổng quan
          </button>

          <button
            type="button"
            onClick={onExportTrend}
            className="h-9 px-3 rounded border bg-white text-sm whitespace-nowrap hover:bg-gray-100"
          >
            Xuất doanh thu
          </button>

          <button
            type="button"
            onClick={onExportTop}
            className="h-9 px-3 rounded border bg-white text-sm whitespace-nowrap hover:bg-gray-100"
          >
            Xuất top sản phẩm
          </button>
        </div>
      </div>

      {/* KPI */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KPI title="Doanh thu" value={`${fmtPrice(summary?.revenue)} đ`} />
        <KPI title="Số đơn" value={summary?.orderCount ?? 0} />
        <KPI title="Sản phẩm đã bán" value={summary?.itemsSold ?? 0} />
        <KPI
          title="Giá trị đơn trung bình (AOV)"
          value={`${fmtPrice(summary?.aov)} đ`}
        />
      </div>

      {/* BIỂU ĐỒ */}
      <div className="bg-white rounded-lg shadow p-3">
        <div className="font-semibold mb-3">
          Biểu đồ doanh thu theo{" "}
          {granularity === "daily"
            ? "ngày"
            : granularity === "weekly"
            ? "tuần"
            : "tháng"}
        </div>
        {trend.length === 0 ? (
          <div className="text-center text-gray-500 py-6">Không có dữ liệu</div>
        ) : (
          <div className="w-full h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[...trend].reverse()}
                margin={{ top: 10, right: 20, left: 0, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="bucket"
                  angle={-25}
                  textAnchor="end"
                  interval={0}
                  tickFormatter={(v) =>
                    granularity === "weekly" ? fmtWeekBucket(v) : v
                  }
                />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`${fmtPrice(value)} đ`, "Doanh thu"]}
                  labelFormatter={(label) =>
                    granularity === "weekly" ? fmtWeekBucket(label) : label
                  }
                />
                <Bar dataKey="revenue" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* BẢNG TREND */}
      <div className="bg-white rounded-lg shadow p-3">
        <div className="font-semibold mb-2">
          Doanh thu theo{" "}
          {granularity === "daily"
            ? "ngày"
            : granularity === "weekly"
            ? "tuần"
            : "tháng"}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="px-3 py-2">Mốc</th>
                <th className="px-3 py-2">Số đơn</th>
                <th className="px-3 py-2">Sản phẩm đã bán</th>
                <th className="px-3 py-2">Doanh thu</th>
                <th className="px-3 py-2">Chi tiết đơn</th>
              </tr>
            </thead>
            <tbody>
              {trend.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-3 py-6 text-center text-gray-500"
                  >
                    Không có dữ liệu
                  </td>
                </tr>
              )}
              {visibleTrend.map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="px-3 py-2">
                    {granularity === "weekly" ? fmtWeekBucket(r.bucket) : r.bucket}
                  </td>
                  <td className="px-3 py-2">{r.orders}</td>
                  <td className="px-3 py-2">{r.itemsSold ?? 0}</td>
                  <td className="px-3 py-2">{fmtPrice(r.revenue)} đ</td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => openDetail(r.bucket)}
                      className="h-8 px-3 rounded border bg-white hover:bg-gray-100 text-sm"
                    >
                      Xem chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {trend.length > SHOW_LIMIT && (
            <div className="text-center mt-3">
              <button
                onClick={() => setShowAllTrend((v) => !v)}
                className="text-blue-600 hover:underline text-sm"
              >
                {showAllTrend ? "Thu gọn ▲" : "Xem thêm ▼"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* BẢNG TOP PRODUCT */}
      <div className="bg-white rounded-lg shadow p-3">
        <div className="font-semibold mb-2">Top sản phẩm bán chạy</div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="px-3 py-2">Sản phẩm</th>
                <th className="px-3 py-2">Số lượng</th>
                <th className="px-3 py-2">Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              {top.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-3 py-6 text-center text-gray-500"
                  >
                    Không có dữ liệu
                  </td>
                </tr>
              )}
              {top.map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="px-3 py-2">{r.name}</td>
                  <td className="px-3 py-2">{r.quantity}</td>
                  <td className="px-3 py-2">{fmtPrice(r.revenue)} đ</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {loading && (
        <div className="text-center text-sm text-gray-500">Đang tải…</div>
      )}

      {/* MODAL CHI TIẾT ĐƠN */}
      {showDetail && (
        <div className="fixed inset-0 bg-black/30 grid place-items-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg p-5 w-[800px] max-w-[95vw] max-h-[85vh] overflow-auto">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold">
                Chi tiết đơn trong khoảng {detailTitle}
              </h2>
              <button
                onClick={() => setShowDetail(false)}
                className="h-9 px-4 rounded border hover:bg-gray-100 text-sm"
              >
                Đóng
              </button>
            </div>

            {loadingDetail ? (
              <div className="text-center text-gray-500 py-6">
                Đang tải chi tiết đơn hàng...
              </div>
            ) : detailOrders.length === 0 ? (
              <div className="text-center text-gray-500 py-6">
                Không có đơn hàng nào
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr className="text-left">
                      <th className="px-3 py-2">ID</th>
                      <th className="px-3 py-2">Khách hàng</th>
                      <th className="px-3 py-2">SĐT</th>
                      <th className="px-3 py-2">Tổng tiền</th>
                      <th className="px-3 py-2">Trạng thái</th>
                      <th className="px-3 py-2">Ngày đặt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailOrders.map((o) => (
                      <tr key={o.id} className="border-t">
                        <td className="px-3 py-2">{o.id}</td>
                        <td className="px-3 py-2">{o.userFullName ?? "-"}</td>
                        <td className="px-3 py-2">{o.phoneNumber ?? "-"}</td>
                        <td className="px-3 py-2">
                          {fmtPrice(o.totalPrice)} đ
                        </td>
                        <td className="px-3 py-2">
                          {o.statusLabel ?? o.status}
                        </td>
                        <td className="px-3 py-2">{fmtDate(o.orderTime)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function KPI({ title, value }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="text-gray-600 text-sm">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value ?? "-"}</div>
    </div>
  );
}
