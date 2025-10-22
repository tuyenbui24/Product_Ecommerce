import http from "@/api/http";

export const searchUsers = ({ page = 1, keyword = "" } = {}) =>
  http.get("/users", { params: { page, keyword } });
export const deleteUser = (id) =>
  http.delete(`/users/${id}`);


// export const searchProducts = ({ page = 1, keyword = "" } = {}) =>
//   http.get("/products", { params: { page, keyword } });
export const searchProducts = ({
  page = 1,
  keyword = "",
  categoryId,
  sizeFilter,
  minStock,
  maxStock,
  size = 10,
} = {}) =>
  http.get("/products", {
    params: { page, size, keyword, categoryId, sizeFilter, minStock, maxStock },
  });
export const getProduct = (id) => http.get(`/products/${id}`);
export const createProduct = (payload) =>
  http.post("/products", payload);
export const updateProduct = (id, payload) =>
  http.put(`/products/${id}`, payload);
export const deleteProduct = (id) => http.delete(`/products/${id}`);
export const updateProductStatus = (id, enabled) =>
  http.put(`/products/${id}/status`, null, { params: { enabled } });
export const uploadProductImage = (id, file) => {
  const fd = new FormData();
  fd.append("file", file);
  return http.post(`/products/${id}/upload-image`, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};


export const searchCategories = ({ page = 1, keyword = "" } = {}) =>
  http.get("/categories", { params: { page, keyword } });
export const createCategory  = (payload) => http.post("/categories", payload);
export const updateCategory  = (id, payload) => http.put(`/categories/${id}`, payload);
export const deleteCategory  = (id) => http.delete(`/categories/${id}`);
export const getProductCategories = () =>
  http.get("/products/categories");


export const getProductSizes = (productId) =>
  http.get(`/product-sizes/by-product/${productId}`);
export const addProductSize = (payload) => 
  http.post(`/product-sizes`, payload);
export const updateProductSize = (sizeId, payload) =>
  http.put(`/product-sizes/${sizeId}`, payload);
export const deleteProductSize = (sizeId) =>
  http.delete(`/product-sizes/${sizeId}`, { params: { t: Date.now() } });


export const searchStaffs = ({ page = 1, keyword = "" } = {}) =>
  http.get("/staffs", { params: { page, keyword } });
export const createStaff = (payload) => http.post("/staffs", payload);
export const updateStaff = (id, payload) => http.put(`/staffs/${id}`, payload);
export const deleteStaff = (id) => http.delete(`/staffs/${id}`);
export const getStaffRoles = () => http.get("/staffs/roles");


export const adminListOrders = (page = 1, size = 10, extra = {}) =>
  http.get("/admin/orders", { params: { page, size, ...extra } });
export const adminGetOrder = (id) => http.get(`/admin/orders/${id}`);
export const adminUpdateOrderStatus = (id, status) =>
  http.put(`/admin/orders/${id}/status`, null, { params: { status } });
export const adminDeleteOrder = (id) =>
  http.delete(`/admin/orders/${id}`);


const cleanParams = (p = {}) =>
  Object.fromEntries(Object.entries(p).filter(([, v]) => v !== null && v !== undefined && v !== ""));

export const adminStatsSummary = (params = {}) =>
  http.get("/admin/stats/summary", { params: cleanParams(params) });
export const adminStatsSalesTrend = (params = {}) =>
  http.get("/admin/stats/sales-trend", { params: cleanParams(params) });
export const adminStatsTopProducts = (params = {}) =>
  http.get("/admin/stats/top-products", { params: cleanParams(params) });