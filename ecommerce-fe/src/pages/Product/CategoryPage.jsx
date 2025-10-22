import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { listProducts } from "@/api/productApi";
import ProductCard from "@/components/product/ProductCard";

export default function CategoryPage() {
  const { id } = useParams();
  const [sp, setSp] = useSearchParams();

  const page = Number(sp.get("page") || 1);
  const sizeQ = Number(sp.get("size") || 12);

  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [size, setSize] = useState(sizeQ);
  const [loading, setLoading] = useState(false);

  const load = async (_page = page, _size = size) => {
    setLoading(true);
    try {
      const { data } = await listProducts({
        page: _page,
        size: _size,
        categoryId: Number(id),
      });
      setItems(data?.content ?? []);
      setTotal(data?.totalElements ?? 0);
      setSize(data?.size ?? _size);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(page, size); /* eslint-disable-line */ }, [id, page, size]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil((total || 0) / (size || 12))),
    [total, size]
  );

  const goPage = (p) => setSp({ page: p, size });
  const changeSize = (s) => setSp({ page: 1, size: s });

  return (
    <div className="max-w-6xl mx-auto px-3 py-4">
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-xl font-semibold">Sản phẩm theo danh mục</h1>
        <select
          value={size}
          onChange={(e) => changeSize(Number(e.target.value))}
          className="h-9 rounded border px-2 text-sm"
        >
          {[8, 12, 16, 20].map((n) => (
            <option key={n} value={n}>{n}/trang</option>
          ))}
        </select>
      </div>

      {loading && <div className="py-10 text-center text-gray-500">Đang tải...</div>}
      {!loading && items.length === 0 && (
        <div className="py-10 text-center text-gray-500">Chưa có sản phẩm</div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {items.map((p) => (
          <ProductCard key={p.id} p={p} showAddButton />
        ))}
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          disabled={page <= 1}
          onClick={() => goPage(page - 1)}
          className="h-9 px-3 rounded border disabled:opacity-60"
        >
          Trước
        </button>
        <div className="text-sm">Trang {page}/{totalPages}</div>
        <button
          disabled={page >= totalPages}
          onClick={() => goPage(page + 1)}
          className="h-9 px-3 rounded border disabled:opacity-60"
        >
          Sau
        </button>
      </div>
    </div>
  );
}
