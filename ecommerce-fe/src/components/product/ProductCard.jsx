import PropTypes from "prop-types";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { addToCart } from "@/api/cartApi";
import { getProductSizes } from "@/api/adminApi";
import { getToken } from "@/utils/storage";
import { toast } from "react-toastify";
import { fmtVND } from "@/utils/formatCurrency";

export default function ProductCard({ p, showAddButton = true }) {
  const navigate = useNavigate();
  const location = useLocation();

  const img = p?.image
    ? `/product-image/${p.id}/${encodeURIComponent(p.image)}`
    : "";

  const onAdd = async () => {
    if (!getToken()) {
      navigate("/login", { replace: true, state: { from: location } });
      return;
    }

    try {
      let sizeName = "";

      if (Array.isArray(p?.sizes) && p.sizes.length > 0) {
        const firstAvailable = p.sizes.find(s => Number(s.quantity) > 0);
        sizeName = (firstAvailable?.size ?? p.sizes[0].size) || "";
      } else {
        const { data } = await getProductSizes(p.id);
        const sizes = Array.isArray(data) ? data : [];

        if (sizes.length > 0) {
          const firstAvailable = sizes.find(s => Number(s.quantity) > 0);
          sizeName = (firstAvailable?.size ?? sizes[0].size) || "";
        } else {
          sizeName = "";
        }
      }

      await addToCart(p.id, sizeName, 1);
      toast.success("Đã thêm vào giỏ hàng");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Thêm giỏ hàng thất bại");
    }
  };

  return (
    <div className="rounded-lg border border-gray-100 bg-white overflow-hidden flex flex-col w-full max-w-[200px] mx-auto text-[15px] shadow">
      <Link
        to={`/products/detail/${p.id}`}
        className="block overflow-hidden bg-white"
      >
        <div className="relative aspect-[4/4.5] w-full">
          {p.image ? (
            <img
              src={img}
              alt={p.name}
              className="absolute inset-0 w-full h-full object-cover scale-100 hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 w-full h-full bg-gray-100" />
          )}
        </div>
      </Link>

      <div className="p-3 flex flex-col gap-2 flex-1">
        <Link
          to={`/products/detail/${p.id}`}
          className="line-clamp-2 min-h-[3rem] font-medium"
          title={p.name}
        >
          {p.name}
        </Link>

        <div className="text-rose-600 font-semibold tabular-nums">
          {fmtVND(p.price)}
        </div>

        {showAddButton && (
          <div className="mt-auto">
            <button
              type="button"
              onClick={onAdd}
              className="mt-2 w-full h-10 rounded-md border-2 border-amber-500 text-amber-700 
              font-medium transition-colors hover:bg-amber-50 inline-flex items-center justify-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Thêm vào giỏ</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

ProductCard.propTypes = {
  p: PropTypes.object.isRequired,
  showAddButton: PropTypes.bool,
};
