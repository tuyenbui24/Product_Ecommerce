import http from "@/api/http";

export const getMyCart = () => http.get("/cart/me");

export const addToCart = (productId, size, quantity = 1) =>
  http.post("/cart/me", null, { params: { productId, size, quantity } });

export const updateCartItem = (itemId, quantity) =>
  http.put(`/cart/me/${itemId}`, null, { params: { quantity } });

export const changeCartItemSize = (itemId, size) =>
  http.put(`/cart/me/${itemId}/size`, null, { params: { size } });

export const removeCartItem = (itemId) =>
  http.delete(`/cart/me/${itemId}`);

export const clearCart = async () => {
  const { data } = await getMyCart();
  const items = data?.items || [];
  await Promise.all(items.map((it) => removeCartItem(it.id)));
};
