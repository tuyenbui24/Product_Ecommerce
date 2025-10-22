import http from "@/api/http";

export const listHomeProducts = (num = 10) =>
  http.get("/products/by-category-blocks", { params: { num } });

export const getAllCategories = () => http.get("/products/categories");

export const getProductDetail = (id) =>
  http.get(`/products/${id}`);

export const listProducts = ({ page = 1, size = 12, keyword, categoryId } = {}) =>
  http.get("/products", { params: { page, size, keyword, categoryId } });

export const listByCategoryId = ({ id, page = 1, size = 12 }) =>
  http.get("/products/by-category", { params: { id, page, size } });
