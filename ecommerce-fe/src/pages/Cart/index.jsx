import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  getMyCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  changeCartItemSize,
} from "@/api/cartApi";
import { getProductSizes } from "@/api/adminApi";
import { createOrder, createVnpayPayment } from "@/api/orderApi";
import { toast } from "react-toastify";

function fmtPrice(v, unitIsThousand = true) {
  let amount = Number(v || 0);
  if (unitIsThousand) amount *= 1000;
  return amount.toLocaleString("vi-VN");
}
const imgUrl = (it) =>
  it?.image
    ? `/product-image/${it.productId}/${encodeURIComponent(it.image)}`
    : "";

const sizesCache = new Map();

function SizePicker({ productId, current, onChange }) {
  const [sizes, setSizes] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (sizesCache.has(productId)) {
        setSizes(sizesCache.get(productId));
        return;
      }
      try {
        const { data } = await getProductSizes(productId);
        const rows = (data || []).map((r) => ({
          id: r.id,
          label: String(r.size).toUpperCase(),
          quantity: Number(r.quantity) || 0,
        }));
        sizesCache.set(productId, rows);
        setSizes(rows);
      } catch {
        setSizes([]);
      }
    };
    if (open && sizes.length === 0) load();
  }, [open, productId, sizes.length]);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        className="px-2 h-8 rounded border text-sm hover:bg-gray-50"
        onClick={() => setOpen((v) => !v)}
        title="Đổi size"
      >
        Size: <b>{current}</b>
      </button>

      {open && (
        <div className="absolute z-10 mt-2 w-44 rounded border bg-white shadow-md p-2">
          <div className="text-xs text-gray-500 px-1 pb-1">Chọn size</div>
          <div className="flex flex-wrap gap-1">
            {sizes.map((s) => {
              const disabled = s.quantity <= 0;
              const active = s.label === current;
              return (
                <button
                  key={s.id}
                  disabled={disabled}
                  onClick={() => {
                    onChange(s.label);
                    setOpen(false);
                  }}
                  className={[
                    "h-8 px-3 rounded-full border text-sm",
                    active
                      ? "border-amber-500 bg-amber-50 text-amber-700"
                      : "hover:bg-gray-50",
                    disabled ? "opacity-50 cursor-not-allowed" : "",
                  ].join(" ")}
                  title={`Còn ${s.quantity}`}
                >
                  {s.label}
                  <span className="text-gray-400">({s.quantity})</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CartPage() {
  const navigate = useNavigate();

  const [cart, setCart] = useState({ items: [], totalPrice: 0, finalPrice: 0 });
  const [loading, setLoading] = useState(false);

  const [shippingAddress, setShippingAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getMyCart();
      const items = (data?.items || []).slice().sort((a, b) => {
        if (a.createdAt && b.createdAt)
          return new Date(a.createdAt) - new Date(b.createdAt);
        return Number(a.id) - Number(b.id);
      });
      setCart({
        items,
        totalPrice: Number(data?.totalPrice || 0),
        finalPrice: Number(data?.finalPrice || 0),
      });
    } catch {
      toast.error("Không tải được giỏ hàng");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);

  const totalText = useMemo(
    () => fmtPrice(cart.totalPrice, true) + " đ",
    [cart.totalPrice]
  );
  const finalText = useMemo(
    () => fmtPrice(cart.finalPrice, true) + " đ",
    [cart.finalPrice]
  );

  const onChangeSize = async (itemId, newSize) => {
    try {
      await changeCartItemSize(itemId, newSize);
      await load();
      toast.success("Đã đổi size");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Đổi size thất bại");
    }
  };

  const onUpdateQty = async (itemId, q) => {
    try {
      await updateCartItem(itemId, q);
      await load();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Cập nhật số lượng thất bại");
    }
  };

  const validateCommon = () => {
    if (cart.items.length === 0) {
      toast.info("Giỏ hàng trống.");
      return false;
    }
    if (!shippingAddress.trim()) {
      toast.error("Vui lòng nhập địa chỉ giao hàng.");
      return false;
    }
    const phone = phoneNumber.trim();
    if (!phone) {
      toast.error("Vui lòng nhập số điện thoại.");
      return false;
    }
    if (!/^0\d{9,10}$/.test(phone)) {
      toast.error("Số điện thoại không hợp lệ (10–11 số, bắt đầu bằng 0).");
      return false;
    }
    return true;
  };

  const placeOrder = async (e) => {
    e?.preventDefault?.();
    if (!validateCommon()) return;

    try {
      setSubmitting(true);

      if (paymentMethod === "COD") {
        await createOrder({
          shippingAddress,
          note,
          phoneNumber: phoneNumber.trim(),
          paymentMethod: "COD",
        });
        toast.success("Đặt hàng thành công (COD)!");
        await clearCart();
        navigate("/orders");
        return;
      }

      if (paymentMethod === "VNPAY") {
        const { data: order } = await createOrder({
          shippingAddress,
          note,
          phoneNumber: phoneNumber.trim(),
          paymentMethod: "VNPAY",
        });

        const payUrl = await createVnpayPayment({ orderId: order.id });
        window.location.href = payUrl;
        return;
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Đặt hàng thất bại.";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto w-full p-4 md:p-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-4 text-center md:text-left">
        Giỏ hàng
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] gap-6">
        {/* DANH SÁCH SẢN PHẨM */}
        <div className="space-y-4">
          {cart.items.map((it) => {
            const price = Number(it.productPrice || 0);
            const line = price * it.quantity;
            return (
              <div
                key={it.id}
                className="border rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row gap-4"
              >
                <div className="w-full sm:w-24 h-40 sm:h-24 rounded bg-gray-50 overflow-hidden border">
                  {imgUrl(it) ? (
                    <img
                      src={imgUrl(it)}
                      alt={it.productName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full grid place-items-center text-gray-400 text-xs">
                      No image
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate text-sm sm:text-base">
                    <Link
                      to={`/products/detail/${it.productId}`}
                      className="hover:underline"
                    >
                      {it.productName}
                    </Link>
                  </div>

                  <div className="mt-2">
                    <SizePicker
                      productId={it.productId}
                      current={it.size}
                      onChange={(sz) => onChangeSize(it.id, sz)}
                    />
                  </div>

                  <div className="mt-2 text-rose-600 font-semibold text-sm sm:text-base">
                    {fmtPrice(price, true)} đ
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <button
                      className="h-8 w-8 rounded border hover:bg-gray-50"
                      onClick={() =>
                        onUpdateQty(it.id, Math.max(1, it.quantity - 1))
                      }
                    >
                      –
                    </button>
                    <input
                      type="number"
                      min={1}
                      value={it.quantity}
                      onChange={(e) =>
                        onUpdateQty(
                          it.id,
                          Math.max(1, Number(e.target.value) || 1)
                        )
                      }
                      className="h-8 w-14 rounded border text-center text-sm"
                    />
                    <button
                      className="h-8 w-8 rounded border hover:bg-gray-50"
                      onClick={() => onUpdateQty(it.id, it.quantity + 1)}
                    >
                      +
                    </button>

                    <button
                      className="ml-auto sm:ml-3 h-8 sm:h-9 px-3 sm:px-4 rounded bg-red-500 text-white text-sm hover:opacity-90"
                      onClick={() => removeCartItem(it.id).then(load)}
                    >
                      Xoá
                    </button>
                  </div>
                </div>

                <div className="text-right sm:min-w-[90px]">
                  <div className="text-xs sm:text-sm text-gray-500">
                    Thành tiền
                  </div>
                  <div className="font-semibold text-green-600 text-sm sm:text-base">
                    {fmtPrice(line, true)} đ
                  </div>
                </div>
              </div>
            );
          })}

          {cart.items.length > 0 && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
              <button
                onClick={() => clearCart().then(load)}
                className="h-10 px-4 rounded border hover:bg-gray-50"
              >
                Xoá tất cả
              </button>
              <Link
                to="/"
                className="h-10 px-4 rounded border hover:bg-gray-50 text-center"
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          )}
        </div>

        {/* FORM ĐẶT HÀNG */}
        <aside className="border rounded-lg p-4 h-fit bg-white sticky md:top-20">
          <div className="text-lg font-semibold mb-3 text-center md:text-left">
            Chi tiết đơn hàng
          </div>

          <div className="flex items-center justify-between py-2 border-b text-sm sm:text-base">
            <span>Tổng tiền:</span>
            <b>{totalText}</b>
          </div>
          <div className="flex items-center justify-between py-3 text-sm sm:text-base">
            <span>Thành tiền:</span>
            <b className="text-green-600">{finalText}</b>
          </div>

          <form onSubmit={placeOrder} className="space-y-3 text-sm sm:text-base">
            <div>
              <label className="text-sm font-medium">Địa chỉ *</label>
              <input
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                className="mt-1 w-full h-10 px-3 rounded border outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Số nhà, đường, quận/huyện, TP..."
              />
            </div>

            <div>
              <label className="text-sm font-medium">Số điện thoại *</label>
              <input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="mt-1 w-full h-10 px-3 rounded border outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="VD: 0912345678"
                inputMode="numeric"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Ghi chú</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="mt-1 w-full min-h-[70px] px-3 py-2 rounded border outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ghi chú cho người giao hàng (không bắt buộc)"
              />
            </div>

            <div>
              <label className="text-sm font-medium">
                Phương thức thanh toán
              </label>
              <div className="mt-2 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={() => setPaymentMethod("COD")}
                  />
                  <span>Thanh toán khi nhận hàng (COD)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="VNPAY"
                    checked={paymentMethod === "VNPAY"}
                    onChange={() => setPaymentMethod("VNPAY")}
                  />
                  <span>Thanh toán qua VNPAY</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || cart.items.length === 0}
              className="w-full h-11 rounded bg-amber-500 text-white font-semibold hover:bg-amber-600 disabled:opacity-60"
            >
              {submitting
                ? paymentMethod === "VNPAY"
                  ? "Đang chuyển sang VNPAY..."
                  : "Đang đặt hàng..."
                : paymentMethod === "VNPAY"
                ? "Thanh toán qua VNPAY"
                : "Đặt hàng (COD)"}
            </button>
          </form>

          <Link
            to="/orders"
            className="mt-3 w-full h-11 rounded border grid place-items-center text-sm hover:bg-gray-50"
          >
            Lịch sử đơn hàng
          </Link>
        </aside>
      </div>
    </div>
  );
}
