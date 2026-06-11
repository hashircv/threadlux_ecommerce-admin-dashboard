import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import dashboardReducer from "../features/dashboard/dashboardSlice";
import ordersReducer from "../features/orders/ordersSlice";
import productsReducer from "../features/products/productsSlice";
import usersReducer from "../features/users/usersSlice";
import adminsReducer from "../features/admins/adminsSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    dashboard: dashboardReducer,
    products: productsReducer,
    orders: ordersReducer,
    users: usersReducer,
    admins: adminsReducer,
  },
});
