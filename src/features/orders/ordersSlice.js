import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiRequest } from "../../app/api";

export const fetchOrders = createAsyncThunk(
  "orders/fetchOrders",
  async (_, { getState }) => apiRequest("/admin/orders", { token: getState().auth.token })
);

export const updateOrderStatus = createAsyncThunk(
  "orders/updateOrderStatus",
  async ({ id, status }, { getState, dispatch }) => {
    await apiRequest(`/admin/orders/${id}/status`, {
      method: "PATCH",
      token: getState().auth.token,
      body: JSON.stringify({ status }),
    });
    return dispatch(fetchOrders()).unwrap();
  }
);

const ordersSlice = createSlice({
  name: "orders",
  initialState: {
    items: [],
    status: "idle",
    error: "",
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.status = "loading";
        state.error = "";
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to load orders";
      });
  },
});

export default ordersSlice.reducer;
