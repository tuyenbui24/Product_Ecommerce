import http from "./http";

export const loginUser    = (payload) => http.post("/auth/users/login", payload);
export const registerUser = (payload) => http.post("/auth/users/register", payload);

export const loginStaff   = (payload) => http.post("/auth/staffs/login", payload);

export const me             = () => http.get("/users/me");
export const updateProfile  = (payload) => http.put("/users/me", payload);
export const changePassword = (payload) => http.put("/users/me/password", payload);
