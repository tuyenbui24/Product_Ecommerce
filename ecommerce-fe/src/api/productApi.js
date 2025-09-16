import http from "@/api/http";

export const listHomeProducts = (num = 10) =>
  http.get("/products/by-category", { params: { num } });

export const getProductDetail = (id) => http.get(`/products/${id}`);
