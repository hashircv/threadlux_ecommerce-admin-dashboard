import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { StatusBadge } from "../../components/StatusBadge";
import { date, money } from "../../components/Formatters";
import { fetchDashboard } from "./dashboardSlice";

export function DashboardPage() {
  const dispatch = useDispatch();
  const { data, status, error } = useSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboard());
  }, [dispatch]);

  if (status === "loading" && !data) return <p className="font-bold text-muted">Loading dashboard...</p>;
  if (error) return <p className="font-bold text-red-700">{error}</p>;
  if (!data) return null;

  const metrics = [
    ["Revenue", money(data.revenue)],
    ["Orders", data.orders],
    ["Pending", data.pendingOrders],
    ["Products", data.products],
    ["Users", data.users],
  ];

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {metrics.map(([label, value]) => (
          <article className="panel grid min-h-28 content-between p-5" key={label}>
            <span className="text-sm font-extrabold text-muted">{label}</span>
            <strong className="text-3xl font-extrabold tracking-normal">{value}</strong>
          </article>
        ))}
      </section>

      <section className="panel overflow-hidden">
        <div className="p-5">
          <h3 className="text-lg font-extrabold tracking-normal">Recent Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left text-xs font-extrabold uppercase text-muted">
                <th className="border-t border-line px-5 py-4">ID</th>
                <th className="border-t border-line px-5 py-4">Customer</th>
                <th className="border-t border-line px-5 py-4">Status</th>
                <th className="border-t border-line px-5 py-4">Total</th>
                <th className="border-t border-line px-5 py-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.map((order) => (
                <tr key={order.id}>
                  <td className="border-t border-line px-5 py-4">#{order.id}</td>
                  <td className="border-t border-line px-5 py-4">{order.customer_name}</td>
                  <td className="border-t border-line px-5 py-4">
                    <StatusBadge>{order.status}</StatusBadge>
                  </td>
                  <td className="border-t border-line px-5 py-4">{money(order.total_amount)}</td>
                  <td className="border-t border-line px-5 py-4">{date(order.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
