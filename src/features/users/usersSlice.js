import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiRequest } from "../../app/api";

export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (_, { getState }) => apiRequest("/admin/users", { token: getState().auth.token })
);

export const updateUserRole = createAsyncThunk(
  "users/updateUserRole",
  async ({ id, role }, { getState, dispatch }) => {
    await apiRequest(`/admin/users/${id}/role`, {
      method: "PATCH",
      token: getState().auth.token,
      body: JSON.stringify({ role }),
    });
    return dispatch(fetchUsers()).unwrap();
  }
);

const usersSlice = createSlice({
  name: "users",
  initialState: {
    items: [],
    status: "idle",
    error: "",
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = "loading";
        state.error = "";
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to load users";
      })
      .addCase(updateUserRole.rejected, (state, action) => {
        state.error = action.error.message || "Failed to update user role";
      });
  },
});

export default usersSlice.reducer;
