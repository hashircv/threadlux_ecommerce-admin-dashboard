import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Menu, X } from "lucide-react";
import { logout } from "../features/auth/authSlice";

const headings = {
  dashboard: ["Overview", "Dashboard"],
  products: ["Catalog", "Products"],
  orders: ["Sales", "Orders"],
  users: ["Accounts", "Users"],
  admins: ["Administration", "Admin Accounts"],
};

export function Layout({
  activeView,
  onViewChange,
  onRefresh,
  children,
}) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navButtonClass = (key) => `
    min-h-10 rounded-md px-3 py-2 text-sm font-bold
    transition text-left
    ${
      activeView === key
        ? "bg-slate-600 text-white"
        : "text-slate-200 hover:bg-slate-700"
    }
  `;

  return (
    <main className="h-screen overflow-hidden">
      {/* Mobile Menu Button */}
      <button
        type="button"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed left-4 top-4 z-50 rounded-md bg-nav p-2 text-white shadow-lg lg:hidden"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`
          fixed left-0 top-0 z-40 flex h-screen flex-col
          bg-nav text-white transition-all duration-300
          ${sidebarOpen ? "w-[240px]" : "w-[72px]"}
          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 lg:p-7">
          {sidebarOpen && (
            <div>
              <p className="mb-1 text-xs font-extrabold uppercase text-emerald-200">
                E-Commerce
              </p>
              <h1 className="text-3xl font-extrabold">
                Admin
              </h1>
            </div>
          )}

          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden rounded-md p-2 hover:bg-slate-700 lg:block"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <nav
          className="flex flex-col gap-1 px-3"
          aria-label="Admin sections"
        >
          {/* Dashboard */}
          <button
            onClick={() => onViewChange("dashboard")}
            className={navButtonClass("dashboard")}
          >
            {sidebarOpen ? "Dashboard" : "D"}
          </button>

          {/* Catalog */}
          {sidebarOpen && (
            <p className="mt-4 px-3 text-xs font-bold uppercase tracking-wider text-slate-400">
              Catalog
            </p>
          )}

          <button
            onClick={() => onViewChange("products")}
            className={navButtonClass("products")}
          >
            {sidebarOpen ? "Products" : "P"}
          </button>

          {/* Sales */}
          {sidebarOpen && (
            <p className="mt-4 px-3 text-xs font-bold uppercase tracking-wider text-slate-400">
              Sales
            </p>
          )}

          <button
            onClick={() => onViewChange("orders")}
            className={navButtonClass("orders")}
          >
            {sidebarOpen ? "Orders" : "O"}
          </button>

          {/* Accounts */}
          {sidebarOpen && (
            <p className="mt-4 px-3 text-xs font-bold uppercase tracking-wider text-slate-400">
              Accounts
            </p>
          )}

          <button
            onClick={() => onViewChange("users")}
            className={navButtonClass("users")}
          >
            {sidebarOpen ? "Users" : "U"}
          </button>

          {/* Super Admin Section */}
          {user?.role === "super_admin" && (
            <>
              {sidebarOpen && (
                <p className="mt-4 px-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Administration
                </p>
              )}

              <button
                onClick={() => onViewChange("admins")}
                className={navButtonClass("admins")}
              >
                {sidebarOpen ? "Admin Accounts" : "A"}
              </button>
            </>
          )}
        </nav>

        {/* User Info */}
        <div className="mt-auto border-t border-slate-700 p-4 text-sm text-slate-200">
          {sidebarOpen && (
            <>
              <div className="mb-3">
                <p className="font-semibold">
                  {user?.name}
                </p>

                <span className="text-xs uppercase text-slate-400">
                  {user?.role}
                </span>
              </div>

              <button
                type="button"
                onClick={() => dispatch(logout())}
                className="btn-ghost w-full"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <section
        className={`
          h-screen overflow-y-auto p-5 transition-all duration-300 lg:p-7
          ${sidebarOpen ? "lg:ml-[240px]" : "lg:ml-[72px]"}
        `}
      >
        <header className="mb-6 flex min-h-16 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow">
              {headings[activeView]?.[0]}
            </p>

            <h2 className="text-3xl font-extrabold">
              {headings[activeView]?.[1]}
            </h2>
          </div>

          <button
            className="btn-ghost"
            onClick={onRefresh}
            type="button"
          >
            Refresh
          </button>
        </header>

        {children}
      </section>
    </main>
  );
}