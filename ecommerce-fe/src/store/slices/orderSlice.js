import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as orderApi from "@/api/orderApi";

export const fetchOrders = createAsyncThunk("order/fetchList", async (params, { rejectWithValue }) => {
  try {
    const { data } = await orderApi.getOrders(params);
    return data;
  } catch (e) {
    return rejectWithValue(e.response?.data || { message: "Fetch orders failed" });
  }
});

const slice = createSlice({
  name: "order",
  initialState: { list: [], loading: false, error: null },
  reducers: {},
  extraReducers: (b) => {
    b.addCase(fetchOrders.pending, (s) => { s.loading = true; s.error = null; })
     .addCase(fetchOrders.fulfilled, (s, a) => { s.loading = false; s.list = a.payload || []; })
     .addCase(fetchOrders.rejected, (s, a) => { s.loading = false; s.error = a.payload || a.error; });
  },
});

export default slice.reducer;
