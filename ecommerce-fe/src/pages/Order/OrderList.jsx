import { useEffect, useMemo, useState } from "react";
import { getMyOrders, getMyOrdersPaged, getMyOrderById } from "@/api/orderApi";
import { toast } from "react-toastify";
import OrderDetailModal from "@pages/Order/OrderDetail";

function fmtPrice(v, unitIsThousand = true) {
  let amount = Number(v || 0);
  if (unitIsThousand) amount *= 1000;
  return amount.toLocaleString("vi-VN");
}

const statusMap = {
  PENDING:    { label: "PENDING",    cls: "bg-yellow-100 text-yellow-800" },
  PROCESSING: { label: "PROCESSING", cls: "bg-blue-100 text-blue-800" },
  SHIPPED:    { label: "SHIPPED",    cls: "bg-indigo-100 text-indigo-800" },
  COMPLETED:  { label: "COMPLETED",  cls: "bg-green-100 text-green-700" },
  CANCELED:   { label: "CANCELED",   cls: "bg-red-100 text-red-700" },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      // const { data } = await getMyOrdersPaged(1); setOrders(data.content || []);
      const { data } = await getMyOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error("Không tải được đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onOpen = async (id) => {
    try {
      setOpenId(id);
      const { data } = await getMyOrderById(id);
      setDetail(data);
    } catch (e) {
      toast.error("Không tải được chi tiết đơn");
    }
  };

  const onClose = () => {
    setOpenId(null);
    setDetail(null);
  };

  return (
    <div className="max-w-6xl mx-auto w-full">
      <h1 className="text-2xl font-semibold mb-4">Đơn hàng của tôi</h1>

      <div className="bg-white rounded-lg border">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="px-4 py-3">#</th>
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
                const st = statusMap[o.status] || statusMap.PENDING;
                return (
                  <tr key={o.id} className="border-t">
                    <td className="px-4 py-3">#{o.id}</td>
                    <td className="px-4 py-3">{o.orderTime ? o.orderTime.replace("T"," ") : "-"}</td>
                    <td className="px-4 py-3 font-medium text-rose-600">{fmtPrice(o.totalPrice, true)} đ</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${st.cls}`}>{st.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onOpen(o.id)}
                        className="h-9 px-3 rounded border hover:bg-gray-50"
                      >
                        Xem
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {openId && (
        <OrderDetailModal open onClose={onClose} data={detail} />
      )}
    </div>
  );
}
