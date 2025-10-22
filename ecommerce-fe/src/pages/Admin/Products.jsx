import { useEffect, useMemo, useState, Fragment } from "react";
import {
  searchProducts,
  deleteProduct,
  createProduct,
  updateProduct,
  updateProductStatus,
  getProductCategories,
  uploadProductImage,
  getProductSizes,
  addProductSize,
  updateProductSize,
  deleteProductSize,
} from "@/api/adminApi";
import { toast } from "react-toastify";
import { fmtPrice } from "@/utils/formatCurrency";
import { Listbox, Transition } from "@headlessui/react";

function buildImageUrl(p) {
  if (!p?.id || !p?.image) return "";
  return `/product-image/${p.id}/${encodeURIComponent(p.image)}`;
}

export default function AdminProducts() {
  const [kw, setKw] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [size, setSize] = useState(10);
  const [loading, setLoading] = useState(false);

  const [cats, setCats] = useState([]);
  const [catFilter, setCatFilter] = useState("");

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    price: "",
    quantity: "",
    categoryId: "",
    description: "",
  });

  const [sizesMap, setSizesMap] = useState({});
  const [sizeOpen, setSizeOpen] = useState(false);
  const [sizeProduct, setSizeProduct] = useState(null);
  const [sizeForm, setSizeForm] = useState({ size: "", quantity: 0 });
  const [savingSize, setSavingSize] = useState(false);

  const [sizeFilter, setSizeFilter] = useState("");
  const [minStock, setMinStock] = useState("");
  const [maxStock, setMaxStock] = useState("");

  // ===== LOAD DATA =====
  const load = async (_page = page) => {
    setLoading(true);
    try {
      const { data } = await searchProducts({
        page: _page,
        keyword: kw,
        categoryId: catFilter || undefined,
        sizeFilter: sizeFilter || undefined,
        minStock: minStock || undefined,
        maxStock: maxStock || undefined,
      });
      const list = data?.content ?? data?.items ?? [];
      setRows(list);
      setTotal(data?.totalElements ?? data?.total ?? list.length);
      setSize(data?.size ?? data?.pageSize ?? 10);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Tải danh sách sản phẩm thất bại");
    } finally {
      setLoading(false);
    }
  };

  const loadCats = async () => {
    try {
      const { data } = await getProductCategories();
      setCats(data ?? []);
    } catch {
      setCats([]);
    }
  };

  const loadSizes = async (productId) => {
    try {
      const { data } = await getProductSizes(productId);
      setSizesMap((prev) => ({ ...prev, [productId]: data ?? [] }));
    } catch {
      setSizesMap((prev) => ({ ...prev, [productId]: [] }));
    }
  };

  useEffect(() => {
    loadCats();
  }, []);
  useEffect(() => {
    load(1);
  }, []);
  useEffect(() => {
    load(page);
  }, [page]);
  useEffect(() => {
    setPage(1);
    load(1);
  }, [catFilter]);

  useEffect(() => {
    if (!rows?.length) return;
    (async () => {
      const next = {};
      await Promise.all(
        rows.map(async (p) => {
          try {
            const { data } = await getProductSizes(p.id);
            next[p.id] = data ?? [];
          } catch {
            next[p.id] = [];
          }
        })
      );
      setSizesMap(next);
    })();
  }, [rows]);

  // ===== ACTIONS =====
  const onSearch = (e) => {
    e.preventDefault();
    setPage(1);
    load(1);
  };

  const onFilterStock = (e) => {
    e.preventDefault();
    setPage(1);
    load(1);
  };

  const onClearFilters = () => {
    setKw("");
    setCatFilter("");
    setSizeFilter("");
    setMinStock("");
    setMaxStock("");
    setPage(1);
    load(1);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      name: "",
      price: "",
      quantity: "",
      categoryId: catFilter || cats?.[0]?.id || "",
      description: "",
    });
    setOpen(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name ?? "",
      price: p.price ?? "",
      quantity: p.quantity ?? "",
      categoryId: p.category?.id ?? p.categoryId ?? "",
      description: p.description ?? "",
    });
    setOpen(true);
  };

  const onSave = async (e) => {
    e.preventDefault();
    if (!form.name?.trim()) return toast.error("Tên sản phẩm không được để trống");
    if (!form.price || Number(form.price) <= 0) return toast.error("Giá phải > 0");
    if (form.quantity === "" || Number.isNaN(Number(form.quantity)) || Number(form.quantity) < 0)
      return toast.error("Số lượng không hợp lệ");
    if (!form.categoryId) return toast.error("Vui lòng chọn danh mục");

    const payload = {
      name: form.name.trim(),
      price: Number(form.price),
      quantity: Number(form.quantity),
      description: form.description?.trim() || "",
      categoryId: Number(form.categoryId),
    };

    try {
      if (editing) {
        await updateProduct(editing.id, payload);
        toast.success("Đã cập nhật sản phẩm");
      } else {
        await createProduct(payload);
        toast.success("Đã tạo sản phẩm");
      }
      setOpen(false);
      if (!editing) {
        setPage(1);
        load(1);
      } else {
        load(page);
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || "Lưu sản phẩm thất bại");
    }
  };

  const onDelete = async (id) => {
    if (!confirm("Xoá sản phẩm này?")) return;
    try {
      await deleteProduct(id);
      toast.success("Đã xoá sản phẩm");
      if (rows.length === 1 && page > 1) setPage((p) => p - 1);
      else load(page);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Xoá thất bại");
    }
  };

  const toggleEnabled = async (p) => {
    try {
      await updateProductStatus(p.id, !p.enabled);
      toast.success("Đã cập nhật trạng thái");
      load(page);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Đổi trạng thái thất bại");
    }
  };

  const onPickImage = async (id, files) => {
    const f = files?.[0];
    if (!f) return;
    try {
      await uploadProductImage(id, f);
      toast.success("Đã cập nhật ảnh");
      load(page);
    } catch (e) {
      toast.error(e?.response?.data?.message || "Upload ảnh thất bại");
    }
  };

  const openSizeModal = async (p) => {
    setSizeProduct(p);
    setSizeOpen(true);
    setSizeForm({ size: "", quantity: 0 });
    await loadSizes(p.id);
  };

  const onAddSize = async (e) => {
    e.preventDefault();
    if (!sizeProduct) return;
    if (!sizeForm.size?.trim()) return toast.error("Vui lòng nhập size");
    if (Number(sizeForm.quantity) < 0) return toast.error("Số lượng không hợp lệ");
    try {
      setSavingSize(true);
      await addProductSize({
        productId: sizeProduct.id,
        size: sizeForm.size.trim(),
        quantity: Number(sizeForm.quantity),
      });
      await loadSizes(sizeProduct.id);
      setSizeForm({ size: "", quantity: 0 });
      toast.success("Đã thêm size");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Thêm size thất bại");
    } finally {
      setSavingSize(false);
    }
  };

  const onUpdateSizeRow = async (row) => {
    try {
      setSavingSize(true);
      await updateProductSize(row.id, {
        productId: sizeProduct.id,
        size: row.size,
        quantity: Number(row.quantity),
      });
      await loadSizes(sizeProduct.id);
      toast.success("Đã cập nhật size");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Cập nhật size thất bại");
    } finally {
      setSavingSize(false);
    }
  };

  const onDeleteSizeRow = async (row) => {
    if (!confirm(`Xoá size ${row.size}?`)) return;
    try {
      await deleteProductSize(row.id);
      await loadSizes(sizeProduct.id);
      toast.success("Đã xoá size");
    } catch (e) {
      toast.error(e?.response?.data?.message || "Xoá size thất bại");
    }
  };

  const totalPages = useMemo(() => Math.max(1, Math.ceil((total || 0) / (size || 10))), [total, size]);

  // ===== RENDER =====
  return (
    <div className="space-y-4">
      {/* HEADER + FILTER */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý Sản phẩm</h1>
        <div className="flex items-center gap-2">
          <Listbox value={catFilter} onChange={setCatFilter}>
            <div className="relative min-w-[220px]">
              <Listbox.Button className="h-10 w-full rounded border px-3 text-left bg-white">
                {cats.find((c) => String(c.id) === catFilter)?.name || "Tất cả danh mục"}
              </Listbox.Button>
              <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded border bg-white shadow-lg">
                  <Listbox.Option value="">
                    {({ selected }) => (
                      <li className={`cursor-pointer px-3 py-2 ${selected ? "bg-blue-100" : "hover:bg-gray-100"}`}>
                        Tất cả danh mục
                      </li>
                    )}
                  </Listbox.Option>
                  {cats.map((c) => (
                    <Listbox.Option key={c.id} value={String(c.id)}>
                      {({ selected }) => (
                        <li className={`cursor-pointer px-3 py-2 ${selected ? "bg-blue-100" : "hover:bg-gray-100"}`}>
                          {c.name}
                        </li>
                      )}
                    </Listbox.Option>
                  ))}
                </Listbox.Options>
              </Transition>
            </div>
          </Listbox>

          {catFilter && (
            <button onClick={() => setCatFilter("")} className="h-10 px-3 rounded border">
              Bỏ lọc
            </button>
          )}
          <button onClick={openCreate} className="h-10 px-4 rounded bg-emerald-600 text-white">
            Thêm sản phẩm
          </button>
        </div>
      </div>

      {/* SEARCH + STOCK FILTER */}
      <div className="flex flex-wrap items-center gap-2">
        <form onSubmit={onSearch} className="flex gap-2 items-center">
          <input value={kw} onChange={(e) => setKw(e.target.value)} placeholder="Tìm theo tên..." className="h-10 rounded border px-3" />
          <button type="submit" className="h-10 px-4 rounded bg-blue-600 text-white">
            Tìm kiếm
          </button>
        </form>

        <form onSubmit={onFilterStock} className="flex gap-2 items-center flex-wrap ml-auto">
          <input type="text" value={sizeFilter} onChange={(e) => setSizeFilter(e.target.value)} placeholder="Size (VD: S, M, L...)" className="h-10 rounded border px-3 w-28" />
          <input type="number" value={minStock} onChange={(e) => setMinStock(e.target.value)} placeholder="Tồn kho từ..." className="h-10 rounded border px-3 w-32" />
          <input type="number" value={maxStock} onChange={(e) => setMaxStock(e.target.value)} placeholder="đến..." className="h-10 rounded border px-3 w-32" />
          <button type="submit" className="h-10 px-4 rounded bg-indigo-600 text-white">
            Lọc
          </button>
          <button type="button" onClick={onClearFilters} className="h-10 px-4 rounded border text-gray-700 hover:bg-gray-100">
            Xoá lọc
          </button>
        </form>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead className="bg-gray-50 text-sm">
            <tr className="text-left">
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">Ảnh</th>
              <th className="px-3 py-2">Tên</th>
              <th className="px-3 py-2">Giá</th>
              <th className="px-3 py-2">Danh mục</th>
              <th className="px-3 py-2">Size (SL)</th>
              <th className="px-3 py-2">Tổng kho</th>
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
            {rows.map((p) => {
              const sizes = sizesMap[p.id] || [];
              const sizesText = sizes.map((s) => `${s.size}:${s.quantity}`).join(" • ");
              const totalStock = sizes.reduce((sum, s) => sum + (Number(s.quantity) || 0), 0);
              return (
                <tr key={p.id} className="border-t align-top">
                  <td className="px-3 py-2">{p.id}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded bg-gray-50 border overflow-hidden">
                        {p.image ? (
                          <img src={buildImageUrl(p)} alt="" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = "none")} />
                        ) : (
                          <div className="w-full h-full grid place-items-center text-xs text-gray-400">N/A</div>
                        )}
                      </div>
                      <label className="text-xs inline-flex items-center gap-2 cursor-pointer">
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => onPickImage(p.id, e.target.files)} />
                        <span className="px-2 py-1 rounded border hover:bg-gray-50">Upload ảnh</span>
                      </label>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="font-medium">{p.name}</div>
                    {p.description && (
                      <div title={p.description} className="text-xs text-gray-500 max-w-[300px] truncate">
                        {p.description}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-2">{fmtPrice(p.price)} ₫</td>
                  <td className="px-3 py-2">{p.category?.name ?? p.categoryName ?? "-"}</td>
                  <td className="px-3 py-2">
                    {sizes.length ? <span>{sizesText}</span> : <span className="text-gray-400">-</span>}
                    <div>
                      <button onClick={() => openSizeModal(p)} className="mt-1 h-8 px-3 rounded border text-xs">
                        Quản lý size
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-2">{totalStock || p.quantity || 0}</td>
                  <td className="px-3 py-2">
                    <button
                      onClick={() => toggleEnabled(p)}
                      className={`h-8 px-3 rounded ${
                        p.enabled ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {p.enabled ? "Đang bán" : "Ngừng bán"}
                    </button>
                  </td>
                  <td className="px-3 py-2 flex gap-2">
                    <button onClick={() => openEdit(p)} className="h-9 px-3 rounded border">
                      Sửa
                    </button>
                    <button onClick={() => onDelete(p.id)} className="h-9 px-3 rounded bg-red-600 text-white">
                      Xoá
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {loading && <div className="p-4 text-center text-gray-500">Đang tải...</div>}
      </div>

      {/* PAGINATION */}
      <div className="flex items-center gap-2">
        <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="h-9 px-3 rounded border disabled:opacity-60">
          Trước
        </button>
        <div className="text-sm">
          Trang {page}/{totalPages}
        </div>
        <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} className="h-9 px-3 rounded border disabled:opacity-60">
          Sau
        </button>
      </div>

      {/* MODAL THÊM/SỬA */}
      {open && (
        <div className="fixed inset-0 bg-black/30 grid place-items-center p-4 z-50">
          <form onSubmit={onSave} className="bg-white w-[620px] max-w-[95vw] rounded-xl p-5 grid gap-3">
            <h2 className="text-lg font-semibold">{editing ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h2>

            <div>
              <label className="block text-sm mb-1">Tên</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-11 rounded border px-3 w-full" required />
            </div>

            <div className="grid md:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm mb-1">Giá</label>
                <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="h-11 rounded border px-3 w-full" required min={0} />
              </div>
              <div>
                <label className="block text-sm mb-1">Số lượng</label>
                <input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} className="h-11 rounded border px-3 w-full" required min={0} />
              </div>
              <div>
                <label className="block text-sm mb-1">Danh mục</label>
                <Listbox value={String(form.categoryId)} onChange={(v) => setForm({ ...form, categoryId: v })}>
                  <div className="relative">
                    <Listbox.Button className="h-11 w-full rounded border px-3 text-left bg-white">
                      {cats.find((c) => String(c.id) === String(form.categoryId))?.name || "-- Chọn danh mục --"}
                    </Listbox.Button>
                    <Transition as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
                      <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded border bg-white shadow-lg">
                        {cats.map((c) => (
                          <Listbox.Option key={c.id} value={String(c.id)}>
                            {({ selected }) => (
                              <li className={`cursor-pointer px-3 py-2 ${selected ? "bg-blue-100" : "hover:bg-gray-100"}`}>{c.name}</li>
                            )}
                          </Listbox.Option>
                        ))}
                      </Listbox.Options>
                    </Transition>
                  </div>
                </Listbox>
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1">Mô tả</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded border px-3 py-2 w-full min-h-[96px]" />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setOpen(false)} className="h-10 px-4 rounded border">
                Huỷ
              </button>
              <button className="h-10 px-4 rounded bg-blue-600 text-white">{editing ? "Lưu" : "Tạo mới"}</button>
            </div>
            <p className="text-xs text-gray-500">* Ảnh sản phẩm tải qua nút <b>Upload ảnh</b> trong bảng.</p>
          </form>
        </div>
      )}

      {/* MODAL SIZE */}
      {sizeOpen && sizeProduct && (
        <div className="fixed inset-0 bg-black/30 grid place-items-center p-4 z-50">
          <div className="bg-white w-[720px] max-w-[95vw] rounded-xl p-5 grid gap-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                Quản lý size – {sizeProduct.name} (ID: {sizeProduct.id})
              </h2>
              <button onClick={() => setSizeOpen(false)} className="h-9 px-3 rounded border">
                Đóng
              </button>
            </div>

            <div className="overflow-x-auto border rounded">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr className="text-left text-sm">
                    <th className="px-3 py-2">Size</th>
                    <th className="px-3 py-2">Số lượng</th>
                    <th className="px-3 py-2">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {(sizesMap[sizeProduct.id] ?? []).length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-3 py-3 text-center text-gray-500">
                        Chưa có size
                      </td>
                    </tr>
                  )}
                  {(sizesMap[sizeProduct.id] ?? []).map((r) => (
                    <tr key={r.id} className="border-t">
                      <td className="px-3 py-2">
                        <input
                          value={r.size}
                          onChange={(e) => {
                            const v = e.target.value;
                            setSizesMap((prev) => ({
                              ...prev,
                              [sizeProduct.id]: prev[sizeProduct.id].map((x) => (x.id === r.id ? { ...x, size: v } : x)),
                            }));
                          }}
                          className="h-9 rounded border px-3 w-24"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={r.quantity}
                          min={0}
                          onChange={(e) => {
                            const v = Number(e.target.value);
                            setSizesMap((prev) => ({
                              ...prev,
                              [sizeProduct.id]: prev[sizeProduct.id].map((x) => (x.id === r.id ? { ...x, quantity: v } : x)),
                            }));
                          }}
                          className="h-9 rounded border px-3 w-28"
                        />
                      </td>
                      <td className="px-3 py-2 flex gap-2">
                        <button type="button" disabled={savingSize} onClick={() => onUpdateSizeRow(r)} className="h-9 px-3 rounded border">
                          Lưu
                        </button>
                        <button type="button" disabled={savingSize} onClick={() => onDeleteSizeRow(r)} className="h-9 px-3 rounded bg-red-600 text-white">
                          Xoá
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <form onSubmit={onAddSize} className="mt-2 grid grid-cols-[1fr_1fr_auto] gap-2">
              <input placeholder="Size (VD: S, M, L)" value={sizeForm.size} onChange={(e) => setSizeForm({ ...sizeForm, size: e.target.value })} className="h-10 rounded border px-3" required />
              <input
                type="number"
                placeholder="Số lượng"
                min={0}
                value={sizeForm.quantity}
                onChange={(e) => setSizeForm({ ...sizeForm, quantity: Number(e.target.value) })}
                className="h-10 rounded border px-3"
                required
              />
              <button disabled={savingSize} className="h-10 px-4 rounded bg-emerald-600 text-white">
                Thêm size
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
