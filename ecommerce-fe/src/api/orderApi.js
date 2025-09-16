import http from "@/api/http";

export const adminListOrders = (page = 1) =>
  http.get("/admin/orders", { params: { page } });

export const adminListAllOrders = () =>
  http.get("/admin/orders/all");

export const adminGetOrder = (id) =>
  http.get(`/admin/orders/${id}`);

export const adminUpdateOrderStatus = (id, status) =>
  http.put(`/admin/orders/${id}/status`, null, { params: { status } });

// export const createOrder = (shippingAddress, note) =>
//   http.post("/me/orders", { shippingAddress, note });

export const getMyOrders = () => http.get("/me/orders");

export const getMyOrdersPaged = (page = 1) =>
  http.get("/me/orders/paged", { params: { page } });

export const getMyOrderById = (id) => http.get(`/me/orders/${id}`);

export const createOrder = ({ shippingAddress, note, paymentMethod = "COD" }) =>
  http.post("/me/orders", { shippingAddress, note, paymentMethod });

// export function createVnpPayment({ shippingAddress, note }) {
//   return http.post("/me/orders/vnpay", { shippingAddress, note });
// }
