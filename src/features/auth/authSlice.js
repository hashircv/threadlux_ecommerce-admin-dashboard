import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiRequest } from "../../app/api";

const savedUser = JSON.parse(localStorage.getItem("adminUser") || "null");
const savedToken = localStorage.getItem("adminToken");

export const loginAdmin = createAsyncThunk("auth/loginAdmin", async (credentials) => {
  const result = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

  if (
  result.user.role !== "admin" &&
  result.user.role !== "super_admin"
) {
  throw new Error("This account does not have admin access");
}

  return result;
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: savedUser,
    token: savedToken,
    status: "idle",
    error: "",
  },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      state.status = "idle";
      state.error = "";
      localStorage.removeItem("adminUser");
      localStorage.removeItem("adminToken");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAdmin.pending, (state) => {
        state.status = "loading";
        state.error = "";
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.user = action.payload.user;
        state.token = action.payload.token;
        localStorage.setItem("adminUser", JSON.stringify(action.payload.user));
        localStorage.setItem("adminToken", action.payload.token);
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Login failed";
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
