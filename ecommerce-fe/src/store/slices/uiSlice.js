import { createSlice } from "@reduxjs/toolkit";

const slice = createSlice({
  name: "ui",
  initialState: { loading: false, modal: null, toast: null },
  reducers: {
    setLoading: (s, { payload }) => { s.loading = payload; },
    openModal: (s, { payload }) => { s.modal = payload; },
    closeModal: (s) => { s.modal = null; },
    setToast: (s, { payload }) => { s.toast = payload; },
    clearToast: (s) => { s.toast = null; },
  },
});

export const { setLoading, openModal, closeModal, setToast, clearToast } = slice.actions;
export default slice.reducer;
