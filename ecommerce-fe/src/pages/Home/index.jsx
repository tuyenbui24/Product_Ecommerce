import { useEffect, useState } from "react";
import { addToCart } from "@/api/cartApi";
import { listHomeProducts } from "@/api/productApi";
import { getToken } from "@/utils/storage";
import { fmtVND } from "@/utils/formatCurrency";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";


const Card = ({ p, canAdd }) => {
  const img = p?.image ? `/product-image/${p.id}/${encodeURIComponent(p.image)}` : "";
  const onAdd = async () => {
    try { await addToCart(p.id, 1); toast.success("Đã thêm vào giỏ"); }
    catch (e) { toast.error(e?.response?.data?.message || "Thêm giỏ hàng thất bại"); }
  };
  return (
    <div className="rounded-lg border bg-white overflow-hidden">
      <Link to={`/products/detail/${p.id}`} className="block aspect-[4/3] bg-gray-50">
        {p.image && <img src={img} alt={p.name} className="w-full h-full object-cover" />}
      </Link>
      <div className="p-3 space-y-1">
        <Link to={`/products/detail/${p.id}`} className="line-clamp-2 font-medium hover:underline">
          {p.name}
        </Link>
        <div className="text-rose-600 font-semibold">{fmtVND(p.price)}</div>
        {canAdd && (
          <button onClick={onAdd} className="mt-2 w-full h-10 rounded border hover:bg-gray-50">
            Thêm vào giỏ
          </button>
        )}
      </div>
    </div>
  );
};

export default function Home() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const token = getToken();

  useEffect(() => {
    (async () => {
      try {
        const res = await listHomeProducts(10);
        setData(res.data || {});
      } finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div className="p-6 text-center text-gray-500">Đang tải...</div>;

  const cats = Object.keys(data);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-10">
      <div className="bg-amber-400 text-white text-2xl md:text-3xl font-bold text-center py-3 rounded">
        Sản phẩm nổi bật
      </div>

      {cats.map((cat) => (
        <section key={cat} className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">{cat}</h2>
            {/* Có thể thêm “Xem thêm >” nếu cần */}
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {(data[cat] || []).map((p) => (
              <Card key={p.id} p={p} canAdd={!!token}/>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
