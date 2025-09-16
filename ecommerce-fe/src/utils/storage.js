const TOKEN_KEY = "access_token";
const USER_KEY  = "auth_user";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) =>
  t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY);
export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

export const getUser = () => {
  try { return JSON.parse(localStorage.getItem(USER_KEY) || "null"); }
  catch { return null; }
};

console.log("Token saved:", getToken());

export const setUser = (u) => localStorage.setItem(USER_KEY, JSON.stringify(u || null));
export const removeUser = () => localStorage.removeItem(USER_KEY);
