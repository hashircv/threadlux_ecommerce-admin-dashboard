import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiRequest } from "../../app/api";

export const fetchDashboard = createAsyncThunk(
  "dashboard/fetchDashboard",
  async (_, { getState }) => apiRequest("/admin/dashboard", { token: getState().auth.token })
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    data: null,
    status: "idle",
    error: "",
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => {
        state.status = "loading";
        state.error = "";
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to load dashboard";
      });
  },
});

export default dashboardSlice.reducer;
