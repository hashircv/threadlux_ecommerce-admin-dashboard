import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { apiRequest } from "../../app/api";

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (_, { getState }) => apiRequest("/admin/products", { token: getState().auth.token })
);

export const saveProduct = createAsyncThunk(
  "products/saveProduct",
  async (product, { getState, dispatch }) => {
    const { id, ...payload } = product;
    await apiRequest(id ? `/admin/products/${id}` : "/admin/products", {
      method: id ? "PUT" : "POST",
      token: getState().auth.token,
      body: JSON.stringify(payload),
    });
    return dispatch(fetchProducts()).unwrap();
  }
);

export const deactivateProduct = createAsyncThunk(
  "products/deactivateProduct",
  async (id, { getState, dispatch }) => {
    await apiRequest(`/admin/products/${id}/deactivate`, {
      method: "PATCH",
      token: getState().auth.token,
    });
    return dispatch(fetchProducts()).unwrap();
  }
);

export const deleteProduct = createAsyncThunk(
  "products/deleteProduct",
  async (id, { getState, dispatch }) => {
    await apiRequest(`/admin/products/${id}`, {
      method: "DELETE",
      token: getState().auth.token,
    });
    return dispatch(fetchProducts()).unwrap();
  }
);

const productsSlice = createSlice({
  name: "products",
  initialState: {
    items: [],
    status: "idle",
    saving: false,
    error: "",
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
        state.error = "";
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to load products";
      })
      .addCase(saveProduct.pending, (state) => {
        state.saving = true;
      })
      .addCase(saveProduct.fulfilled, (state) => {
        state.saving = false;
      })
      .addCase(saveProduct.rejected, (state, action) => {
        state.saving = false;
        state.error = action.error.message || "Failed to save product";
      })
      .addCase(deactivateProduct.rejected, (state, action) => {
        state.error = action.error.message || "Failed to deactivate product";
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.error = action.error.message || "Failed to delete product";
      });
  },
});

export default productsSlice.reducer;
