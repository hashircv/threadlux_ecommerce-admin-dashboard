import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { date } from "../../components/Formatters";
import { StatusBadge } from "../../components/StatusBadge";
import { ResponsiveSelect } from "../../components/ResponsiveSelect";
import { fetchUsers, updateUserRole } from "./usersSlice";

export function UsersPage() {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((state) => state.users);
  const currentUser = useSelector((state) => state.auth.user);
  const [query, setQuery] = useState("");
  const [pendingRoleChange, setPendingRoleChange] = useState(null);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const filteredUsers = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return items;

    return items.filter((user) =>
      [user.name, user.email, user.role].some((value) => String(value || "").toLowerCase().includes(needle))
    );
  }, [items, query]);

  const adminCount = items.filter((user) => user.role === "admin").length;
  const customerCount = items.filter((user) => user.role === "customer").length;

  function requestRoleChange(user, role) {
    if (user.role === role) return;

    setPendingRoleChange({
      user,
      role,
      title: "Change user access?",
      message: `${user.name} will be updated from ${user.role} to ${role}.`,
    });
  }

  function confirmRoleChange() {
    dispatch(updateUserRole({ id: pendingRoleChange.user.id, role: pendingRoleChange.role }));
    setPendingRoleChange(null);
  }

  if (status === "loading" && !items.length) return <p className="font-bold text-muted">Loading users...</p>;

  return (
    <div className="grid gap-6">
      <section className="grid grid-cols-3 gap-2 sm:gap-4">
        <article className="panel grid min-h-24 min-w-0 place-content-center p-2 text-center sm:min-h-28 sm:p-5">
          <span className="text-[11px] font-extrabold leading-tight text-muted sm:text-sm">Total Users</span>
          <strong className="mt-2 block text-2xl font-extrabold tracking-normal sm:mt-3 sm:text-3xl">{items.length}</strong>
        </article>
        <article className="panel grid min-h-24 min-w-0 place-content-center p-2 text-center sm:min-h-28 sm:p-5">
          <span className="text-[11px] font-extrabold leading-tight text-muted sm:text-sm">Admins</span>
          <strong className="mt-2 block text-2xl font-extrabold tracking-normal sm:mt-3 sm:text-3xl">{adminCount}</strong>
        </article>
        <article className="panel grid min-h-24 min-w-0 place-content-center p-2 text-center sm:min-h-28 sm:p-5">
          <span className="text-[11px] font-extrabold leading-tight text-muted sm:text-sm">Customers</span>
          <strong className="mt-2 block text-2xl font-extrabold tracking-normal sm:mt-3 sm:text-3xl">{customerCount}</strong>
        </article>
      </section>

      <section className="panel p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="eyebrow">Access Control</p>
            <h3 className="text-xl font-extrabold tracking-normal">Users</h3>
          </div>
          <label className="label w-full lg:max-w-sm">
            Search users
            <input
              className="field"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Name, email, or role"
              value={query}
            />
          </label>
        </div>
      </section>

      {error ? <p className="font-bold text-red-700">{error}</p> : null}

      <section className="grid gap-3 md:hidden">
        {filteredUsers.map((user) => {
          const isCurrentUser = currentUser?.id === user.id;

          return (
            <article className="panel min-w-0 p-4" key={user.id}>
              <div className="flex min-w-0 items-start justify-between gap-3">
                <div className="min-w-0">
                  <h4 className="truncate font-extrabold">{user.name}</h4>
                  <p className="break-all text-sm font-semibold text-muted">{user.email}</p>
                </div>
                <StatusBadge tone={user.role === "admin" ? "warning" : "default"}>{user.role}</StatusBadge>
              </div>

              <div className="mt-4 grid gap-3 border-t border-line pt-4">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-bold text-muted">Created</span>
                  <span className="text-right font-semibold">{date(user.created_at)}</span>
                </div>
                <label className="label">
                  Manage access
                  <ResponsiveSelect disabled={isCurrentUser} onChange={(event) => requestRoleChange(user, event.target.value)} value={user.role} options={[{ label: "Customer", value: "customer" }, { label: "Admin", value: "admin" }]} />
                </label>
                {isCurrentUser ? (
                  <p className="text-xs font-bold text-muted">Current signed-in account</p>
                ) : null}
              </div>
            </article>
          );
        })}
        {!filteredUsers.length ? (
          <div className="panel p-5 text-center font-bold text-muted">No users match your search.</div>
        ) : null}
      </section>

      <section className="panel hidden overflow-hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="text-left text-xs font-extrabold uppercase text-muted">
                <th className="px-5 py-4">User</th>
                <th className="px-5 py-4">Current Access</th>
                <th className="px-5 py-4">Manage Access</th>
                <th className="px-5 py-4">Created</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const isCurrentUser = currentUser?.id === user.id;

                return (
                  <tr key={user.id}>
                    <td className="border-t border-line px-5 py-4">
                      <div className="grid gap-1">
                        <span className="font-extrabold">{user.name}</span>
                        <span className="text-sm font-semibold text-muted">{user.email}</span>
                      </div>
                    </td>
                    <td className="border-t border-line px-5 py-4">
                      <StatusBadge tone={user.role === "admin" ? "warning" : "default"}>{user.role}</StatusBadge>
                    </td>
                    <td className="border-t border-line px-5 py-4">
                      <ResponsiveSelect disabled={isCurrentUser} onChange={(event) => requestRoleChange(user, event.target.value)} value={user.role} options={[{ label: "Customer", value: "customer" }, { label: "Admin", value: "admin" }]} />
                      {isCurrentUser ? (
                        <p className="mt-2 text-xs font-bold text-muted">Current signed-in account</p>
                      ) : null}
                    </td>
                    <td className="border-t border-line px-5 py-4">{date(user.created_at)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {pendingRoleChange ? (
        <ConfirmDialog
          title={pendingRoleChange.title}
          message={pendingRoleChange.message}
          confirmLabel="Update Access"
          onCancel={() => setPendingRoleChange(null)}
          onConfirm={confirmRoleChange}
        />
      ) : null}
    </div>
  );
}
