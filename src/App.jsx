import { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Layout } from "./components/Layout";
import { LoginPage } from "./features/auth/LoginPage";
import { fetchDashboard } from "./features/dashboard/dashboardSlice";
import { DashboardPage } from "./features/dashboard/DashboardPage";
import { fetchOrders } from "./features/orders/ordersSlice";
import { OrdersPage } from "./features/orders/OrdersPage";
import { fetchProducts } from "./features/products/productsSlice";
import { ProductsPage } from "./features/products/ProductsPage";
import { fetchUsers } from "./features/users/usersSlice";
import { UsersPage } from "./features/users/UsersPage";
import { fetchAdmins } from "./features/admins/adminsSlice";
import AdminAccountsPage from "./features/admins/AdminAccountsPage";


const loaders = {
  dashboard: fetchDashboard,
  products: fetchProducts,
  orders: fetchOrders,
  users: fetchUsers,
  admins: fetchAdmins,
};

export function App() {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const [activeView, setActiveView] = useState("dashboard");

  const refresh = useCallback(() => {
    dispatch(loaders[activeView]());
  }, [activeView, dispatch]);

  if (!token) {
    return <LoginPage />;
  }

  return (
   <Layout
  activeView={activeView}
  onRefresh={refresh}
  onViewChange={setActiveView}
>
  {activeView === "dashboard" && <DashboardPage />}

  {activeView === "products" && <ProductsPage />}

  {activeView === "orders" && <OrdersPage />}

  {activeView === "users" && <UsersPage />}

  {activeView === "admins" && (
    <AdminAccountsPage />
  )}
</Layout>
  );
}
