import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { date, money } from "../../components/Formatters";
import { ResponsiveSelect } from "../../components/ResponsiveSelect";
import { fetchOrders, updateOrderStatus } from "./ordersSlice";

const statuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

const initialFilters = {
  search: "",
  status: "all",
  fromDate: "",
  toDate: "",
  minTotal: "",
  maxTotal: "",
  sort: "newest",
};

const sortOptions = [
  { label: "Newest first", value: "newest" },
  { label: "Oldest first", value: "oldest" },
  { label: "Total low-high", value: "total-asc" },
  { label: "Total high-low", value: "total-desc" },
];

export function OrdersPage() {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((state) => state.orders);
  const [filters, setFilters] = useState(initialFilters);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const filteredItems = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    const fromTime = filters.fromDate ? new Date(`${filters.fromDate}T00:00:00`).getTime() : null;
    const toTime = filters.toDate ? new Date(`${filters.toDate}T23:59:59`).getTime() : null;
    const minTotal = filters.minTotal === "" ? null : Number(filters.minTotal);
    const maxTotal = filters.maxTotal === "" ? null : Number(filters.maxTotal);

    return items
      .filter((order) => {
        const orderTime = order.created_at ? new Date(order.created_at).getTime() : 0;
        const total = Number(order.total_amount || 0);
        const itemText = order.items
          ?.map((item) => `${item.product_name || ""} ${item.product_id || ""}`)
          .join(" ");
        const matchesSearch =
          !search ||
          [order.id, order.customer_name, order.customer_email, itemText]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(search));
        const matchesStatus = filters.status === "all" || order.status === filters.status;
        const matchesFromDate = !fromTime || orderTime >= fromTime;
        const matchesToDate = !toTime || orderTime <= toTime;
        const matchesMinTotal = minTotal === null || total >= minTotal;
        const matchesMaxTotal = maxTotal === null || total <= maxTotal;

        return matchesSearch && matchesStatus && matchesFromDate && matchesToDate && matchesMinTotal && matchesMaxTotal;
      })
      .sort((a, b) => {
        if (filters.sort === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        if (filters.sort === "total-asc") return Number(a.total_amount || 0) - Number(b.total_amount || 0);
        if (filters.sort === "total-desc") return Number(b.total_amount || 0) - Number(a.total_amount || 0);
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [filters, items]);

  function handleFilterChange(event) {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  }

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => value !== initialFilters[key]);

  if (status === "loading" && !items.length) return <p className="font-bold text-muted">Loading orders...</p>;
  if (error) return <p className="font-bold text-red-700">{error}</p>;

  return (
    <section className="grid gap-4">
      <section className="panel grid gap-4 p-5">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr_1fr_0.8fr_0.8fr_1fr_auto]">
          <label className="label">
            Search
            <input
              className="field"
              name="search"
              onChange={handleFilterChange}
              placeholder="Order, customer, product"
              value={filters.search}
            />
          </label>
          <label className="label">
            Status
            <ResponsiveSelect name="status" onChange={handleFilterChange} value={filters.status} options={[{ label: "All statuses", value: "all" }, ...statuses.map((item) => ({ label: item, value: item }))]} />
          </label>
          <label className="label">
            From
            <input className="field" name="fromDate" onChange={handleFilterChange} type="date" value={filters.fromDate} />
          </label>
          <label className="label">
            To
            <input className="field" name="toDate" onChange={handleFilterChange} type="date" value={filters.toDate} />
          </label>
          <label className="label">
            Min total
            <input className="field" min="0" name="minTotal" onChange={handleFilterChange} step="0.01" type="number" value={filters.minTotal} />
          </label>
          <label className="label">
            Max total
            <input className="field" min="0" name="maxTotal" onChange={handleFilterChange} step="0.01" type="number" value={filters.maxTotal} />
          </label>
          <label className="label">
            Sort
            <ResponsiveSelect name="sort" onChange={handleFilterChange} options={sortOptions} value={filters.sort} />
          </label>
          <button
            className="btn-ghost self-end"
            disabled={!hasActiveFilters}
            onClick={() => setFilters(initialFilters)}
            type="button"
          >
            Reset
          </button>
        </div>
        <p className="text-sm font-bold text-muted">
          Showing {filteredItems.length} of {items.length} orders
        </p>
      </section>

      {filteredItems.map((order) => (
        <article className="panel grid min-w-0 gap-4 overflow-hidden p-4 sm:p-5" key={order.id}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h3 className="text-lg font-extrabold tracking-normal">Order #{order.id}</h3>
              <p className="break-words text-sm font-bold text-muted">
                {order.customer_name} / {order.customer_email} / {date(order.created_at)} / {money(order.total_amount)}
              </p>
            </div>
            <label className="label min-w-44">
              Status
              <ResponsiveSelect
                onChange={(event) => dispatch(updateOrderStatus({ id: order.id, status: event.target.value }))}
                options={statuses.map((item) => ({ label: item, value: item }))}
                value={order.status}
              />
            </label>
          </div>
          <div className="grid gap-2 text-sm font-semibold text-muted">
            {order.items?.map((item) => (
              <span key={`${order.id}-${item.product_id}`}>
                {item.product_name || `Product ${item.product_id}`} x {item.quantity} at {money(item.unit_price)}
              </span>
            ))}
          </div>
        </article>
      ))}
      {!filteredItems.length && status !== "loading" ? (
        <section className="panel p-6 text-center font-bold text-muted">No orders match the selected filters.</section>
      ) : null}
    </section>
  );
}
