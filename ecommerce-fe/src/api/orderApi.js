import http from "@/api/http";

export const adminListOrders = (page = 1) =>
  http.get("/admin/orders", { params: { page } });

export const adminListAllOrders = () =>
  http.get("/admin/orders/all");

export const adminGetOrder = (id) =>
  http.get(`/admin/orders/${id}`);

export const adminUpdateOrderStatus = (id, status) =>
  http.put(`/admin/orders/${id}/status`, null, { params: { status } });


export const getMyOrdersPaged = (page = 1, size = 10) =>
  http.get("/me/orders/paged", { params: { page, size } });

export const getMyOrderById = (id) => http.get(`/me/orders/${id}`);

export const createOrder = ({ shippingAddress, note, phoneNumber, paymentMethod = "COD" }) =>
  http.post("/me/orders", { shippingAddress, note, phoneNumber, paymentMethod });

export const createVnpayPayment = ({ orderId }) =>
  http.post("/payments/vnpay/create", { orderId })
     .then(res => res.data.payUrl);
     
export const payAgainVnpay = (orderId) =>
  http.post(`/payments/vnpay/pay-again/${orderId}`)
      .then(r => r.data.payUrl);