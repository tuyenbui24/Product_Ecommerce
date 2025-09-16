import { configureStore } from "@reduxjs/toolkit";
import auth from "./slices/authSlice";
import order from "./slices/orderSlice";
import ui from "./slices/uiSlice";

export const store = configureStore({
  reducer: { auth, order, ui },
});
