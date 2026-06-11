import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiRequest } from "../../app/api";

export const fetchAdmins = createAsyncThunk(
  "admins/fetchAdmins",
  async (_, { getState }) => apiRequest("/admin/admins", { token: getState().auth.token })
);

export const createAdminAccount = createAsyncThunk(
  "admins/createAdminAccount",
  async (adminData, { getState, dispatch }) => {
    await apiRequest("/admin/create-admin", {
      method: "POST",
      token: getState().auth.token,
      body: JSON.stringify(adminData),
    });
    return dispatch(fetchAdmins()).unwrap();
  }
);

export const deleteAdminAccount = createAsyncThunk(
  "admins/deleteAdminAccount",
  async (id, { getState, dispatch }) => {
    await apiRequest(`/admin/admins/${id}`, {
      method: "DELETE",
      token: getState().auth.token,
    });
    return dispatch(fetchAdmins()).unwrap();
  }
);

const adminsSlice = createSlice({
  name: "admins",
  initialState: {
    items: [],
    status: "idle",
    error: "",
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdmins.pending, (state) => {
        state.status = "loading";
        state.error = "";
      })
      .addCase(fetchAdmins.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchAdmins.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to load admins";
      })
      .addCase(createAdminAccount.rejected, (state, action) => {
        state.error = action.error.message || "Failed to create admin";
      })
      .addCase(deleteAdminAccount.rejected, (state, action) => {
        state.error = action.error.message || "Failed to delete admin";
      });
  },
});

export default adminsSlice.reducer;
