import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { ShoppingCart } from "lucide-react";

import { addToCart } from "@/api/cartApi";
import {
  getProduct as getProductDetail,
  getProductSizes,
} from "@/api/adminApi";
import { getToken } from "@/utils/storage";
import SizeGuideModal from "@/components/product/SizeGuideModal";

function fmtPrice(v, unitIsThousand = true) {
  let amount = Number(v || 0);
  if (unitIsThousand) amount *= 1000;
  return amount.toLocaleString("vi-VN");
}

const buildImageUrl = (p) =>
  p?.image ? `/product-image/${p.id}/${encodeURIComponent(p.image)}` : "";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [p, setP] = useState(null);
  const [sizes, setSizes] = useState([]);
  const [selectedSize, setSelectedSize] = useState("");
  const [qty, setQty] = useState(1);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getProductDetail(id);
        setP(data);
      } catch {
        toast.error("Không tải được sản phẩm");
      }
    })();
  }, [id]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getProductSizes(id);
        setSizes(data ?? []);
        if ((data ?? []).length) setSelectedSize((data ?? [])[0].size);
      } catch {
        setSizes([]);
      }
    })();
  }, [id]);

  const img = useMemo(() => buildImageUrl(p), [p]);
  const stockOfSelected = useMemo(() => {
    const row = sizes.find((s) => s.size === selectedSize);
    return row ? Number(row.quantity) || 0 : 0;
  }, [sizes, selectedSize]);

  const inc = () => setQty((n) => Math.min(stockOfSelected || 1, n + 1));
  const dec = () => setQty((n) => Math.max(1, n - 1));

  const handleAddToCart = async () => {
    if (sizes.length && !selectedSize) return toast.error("Vui lòng chọn size");
    if (sizes.length && stockOfSelected <= 0)
      return toast.error("Size đã hết hàng");

    if (!getToken()) {
      navigate("/login", { state: { redirectTo: location.pathname } });
      return;
    }
    try {
      await addToCart(p.id, selectedSize, qty);
      toast.success("Đã thêm vào giỏ");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Thêm giỏ hàng thất bại");
    }
  };

  if (!p)
    return <div className="p-6 text-center text-gray-500">Đang tải...</div>;

  return (
    <div className="max-w-6xl mx-auto w-full p-4 md:p-6">
      <div className="grid md:grid-cols-2 gap-6 bg-white rounded-xl p-4 md:p-6">
        {/* Hình ảnh */}
        <div className="aspect-[4/5] bg-gray-50 rounded-lg overflow-hidden border border-gray-200/60 shadow-sm">
          {p.image ? (
            <img
              src={img}
              alt={p.name}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            />
          ) : (
            <div className="w-full h-full grid place-items-center text-gray-400">
              No image
            </div>
          )}
        </div>

        {/* Thông tin sản phẩm */}
        <div className="space-y-4">
          <h1 className="text-2xl md:text-3xl font-semibold leading-tight">
            {p.name}
          </h1>
          <div className="text-rose-600 text-2xl font-semibold">
            {fmtPrice(p.price, true)} đ
          </div>

          {!!sizes.length && (
            <div className="space-y-2">
              {/* tiêu đề + nút hướng dẫn */}
              <div className="flex items-center justify-between">
                <span className="font-medium">Chọn size</span>
                <button
                  type="button"
                  onClick={() => setShowGuide(true)}
                  className="text-sm text-amber-600 hover:underline"
                >
                  Hướng dẫn chọn size
                </button>
              </div>

              {/* danh sách size */}
              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => {
                  const active = selectedSize === s.size;
                  const out = Number(s.quantity) <= 0;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => !out && setSelectedSize(s.size)}
                      className={[
                        "h-9 px-3 rounded-full border text-sm transition-colors",
                        active
                          ? "border-amber-500 bg-amber-50 text-amber-700"
                          : "border-gray-300 hover:bg-gray-50",
                        out ? "opacity-50 cursor-not-allowed" : "",
                      ].join(" ")}
                      title={`Còn ${s.quantity}`}
                      disabled={out}
                    >
                      {s.size}{" "}
                      <span className="text-gray-400">({s.quantity})</span>
                    </button>
                  );
                })}
              </div>

              {/* modal hướng dẫn chọn size */}
              <SizeGuideModal
                open={showGuide}
                onClose={() => setShowGuide(false)}
              />
            </div>
          )}

          {/* số lượng */}
          <div className="space-y-2">
            <div className="font-medium">Số lượng</div>
            <div className="flex items-center gap-2">
              <button
                onClick={dec}
                className="h-9 w-9 rounded border hover:bg-gray-50"
                aria-label="Giảm"
              >
                –
              </button>
              <input
                type="number"
                min={1}
                value={qty}
                onChange={(e) => {
                  const cap = stockOfSelected > 0 ? stockOfSelected : 1;
                  const v = Math.max(
                    1,
                    Math.min(Number(e.target.value) || 1, cap)
                  );
                  setQty(v);
                }}
                className="h-9 w-16 rounded border text-center"
              />
              <button
                onClick={inc}
                className="h-9 w-9 rounded border hover:bg-gray-50"
                aria-label="Tăng"
              >
                +
              </button>
              {sizes.length > 0 && (
                <span className="text-sm text-gray-500">
                  Kho còn: {stockOfSelected}
                </span>
              )}
            </div>
          </div>

          {/* nút thêm giỏ */}
          <button
            onClick={handleAddToCart}
            disabled={
              sizes.length > 0 && (!selectedSize || stockOfSelected <= 0)
            }
            className="mt-2 w-full h-10 rounded-md border-2 border-amber-500 text-amber-700 
            font-medium transition-colors hover:bg-amber-50 inline-flex items-center justify-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            Thêm vào giỏ hàng
          </button>

          {/* mô tả sản phẩm */}
          {p.description && (
            <div className="pt-2">
              <h3 className="text-lg font-semibold mb-2">Chi tiết sản phẩm</h3>
              <div className="rounded-lg border bg-white/70 shadow-sm p-4 max-w-full max-h-[380px] overflow-y-auto whitespace-pre-line leading-relaxed">
                {p.description}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
