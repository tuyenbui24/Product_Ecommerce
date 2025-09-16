import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  getMyCart,
  updateCartItem,
  removeCartItem,
  clearCart,
  changeCartItemSize,
} from "@/api/cartApi";
import { getProductSizes } from "@/api/adminApi";
import { toast } from "react-toastify";

function fmtPrice(v, unitIsThousand = true) {
  let amount = Number(v || 0);
  if (unitIsThousand) amount *= 1000;
  return amount.toLocaleString("vi-VN");
}
const imgUrl = (it) =>
  it?.image ? `/product-image/${it.productId}/${encodeURIComponent(it.image)}` : "";


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
        const rows = (data || []).map(r => ({
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
        onClick={() => setOpen(v => !v)}
        title="Đổi size">
        Size: <b>{current}</b>
      </button>

      {open && (
        <div className="absolute z-10 mt-2 w-44 rounded border bg-white shadow-md p-2">
          <div className="text-xs text-gray-500 px-1 pb-1">Chọn size</div>
          <div className="flex flex-wrap gap-1">
            {sizes.map(s => {
              const disabled = s.quantity <= 0;
              const active = s.label === current;
              return (
                <button
                  key={s.id}
                  disabled={disabled}
                  onClick={() => { onChange(s.label); setOpen(false); }}
                  className={[
                    "h-8 px-3 rounded-full border text-sm",
                    active ? "border-amber-500 bg-amber-50 text-amber-700" : "hover:bg-gray-50",
                    disabled ? "opacity-50 cursor-not-allowed" : ""
                  ].join(" ")}
                  title={`Còn ${s.quantity}`}>
                  {s.label} <span className="text-gray-400">({s.quantity})</span>
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
  const [cart, setCart] = useState({ items: [], totalPrice: 0, finalPrice: 0 });
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getMyCart();
      setCart({
        items: data?.items || [],
        totalPrice: Number(data?.totalPrice || 0),
        finalPrice: Number(data?.finalPrice || 0),
      });
    } catch {
      toast.error("Không tải được giỏ hàng");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  const totalText = useMemo(() => fmtPrice(cart.totalPrice, true) + " đ", [cart.totalPrice]);
  const finalText = useMemo(() => fmtPrice(cart.finalPrice, true) + " đ", [cart.finalPrice]);

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

  return (
    <div className="max-w-6xl mx-auto w-full p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-4">Giỏ hàng</h1>

      <div className="grid md:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-4">
          {cart.items.map(it => {
            const price = Number(it.productPrice || 0);
            const line = price * it.quantity;
            return (
              <div key={it.id} className="border rounded-lg p-4 flex gap-4 items-start">
                <div className="w-24 h-24 rounded bg-gray-50 overflow-hidden border">
                  {imgUrl(it)
                    ? <img src={imgUrl(it)} alt={it.productName} className="w-full h-full object-cover" />
                    : <div className="w-full h-full grid place-items-center text-gray-400 text-xs">No image</div>}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    <Link to={`/products/detail/${it.productId}`} className="hover:underline">
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

                  <div className="mt-2 text-rose-600 font-semibold">
                    {fmtPrice(price, true)} đ
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <button className="h-9 w-9 rounded border hover:bg-gray-50"
                            onClick={() => onUpdateQty(it.id, Math.max(1, it.quantity - 1))}>–</button>
                    <input
                      type="number"
                      min={1}
                      value={it.quantity}
                      onChange={(e) => onUpdateQty(it.id, Math.max(1, Number(e.target.value) || 1))}
                      className="h-9 w-16 rounded border text-center"
                    />
                    <button className="h-9 w-9 rounded border hover:bg-gray-50"
                            onClick={() => onUpdateQty(it.id, it.quantity + 1)}>+</button>

                    <button className="ml-3 h-9 px-4 rounded bg-red-500 text-white hover:opacity-90"
                            onClick={() => removeCartItem(it.id).then(load)}>Xoá</button>
                  </div>
                </div>

                <div className="text-right min-w-[90px]">
                  <div className="text-sm text-gray-500">Thành tiền</div>
                  <div className="font-semibold text-green-600">
                    {fmtPrice(line, true)} đ
                  </div>
                </div>
              </div>
            );
          })}

          {cart.items.length > 0 && (
            <div className="flex items-center justify-between pt-2">
              <button onClick={() => clearCart().then(load)} className="h-10 px-4 rounded border hover:bg-gray-50">
                Xoá tất cả
              </button>
              <Link to="/" className="h-10 px-4 rounded border hover:bg-gray-50">Tiếp tục mua sắm</Link>
            </div>
          )}
        </div>

        <aside className="border rounded-lg p-4 h-fit sticky top-20 bg-white">
          <div className="text-lg font-semibold mb-3">Chi tiết đơn hàng</div>
          <div className="flex items-center justify-between py-2 border-b">
            <span>Tổng tiền:</span><b>{totalText}</b>
          </div>
          <div className="flex items-center justify-between py-3">
            <span>Thành tiền:</span><b className="text-green-600">{finalText}</b>
          </div>
          <Link to="/checkout" className="w-full inline-grid place-items-center h-11 rounded bg-amber-500 text-white font-semibold hover:bg-amber-600">
            Thanh toán
          </Link>
          <Link to="/orders" className="mt-3 w-full h-11 rounded border grid place-items-center text-sm hover:bg-gray-50">
            Lịch sử đơn hàng
          </Link>
        </aside>
      </div>
    </div>
  );
}
