import axios from "axios";
import { getToken, removeToken, removeUser } from "@/utils/storage";

const http = axios.create({
  baseURL: import.meta.env.PROD ? (import.meta.env.VITE_API_URL || "/api") : "/api",
  timeout: 15000,
});

http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      removeToken(); removeUser();
      const isAdminArea = window.location.pathname.startsWith('/admin');
      window.location.href = isAdminArea ? '/admin/login' : '/login';
      return Promise.reject(error);;
    }
    return Promise.reject(error);
  }
);


export default http;
