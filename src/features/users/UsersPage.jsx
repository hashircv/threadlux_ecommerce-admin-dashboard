import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ConfirmDialog } from "../../components/ConfirmDialog";
import { date } from "../../components/Formatters";
import { StatusBadge } from "../../components/StatusBadge";
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
      <section className="grid gap-4 md:grid-cols-3">
        <article className="panel p-5">
          <span className="text-sm font-extrabold text-muted">Total Users</span>
          <strong className="mt-3 block text-3xl font-extrabold tracking-normal">{items.length}</strong>
        </article>
        <article className="panel p-5">
          <span className="text-sm font-extrabold text-muted">Admins</span>
          <strong className="mt-3 block text-3xl font-extrabold tracking-normal">{adminCount}</strong>
        </article>
        <article className="panel p-5">
          <span className="text-sm font-extrabold text-muted">Customers</span>
          <strong className="mt-3 block text-3xl font-extrabold tracking-normal">{customerCount}</strong>
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

      <section className="panel overflow-hidden">
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
                      <select
                        className="field min-w-36"
                        disabled={isCurrentUser}
                        onChange={(event) => requestRoleChange(user, event.target.value)}
                        value={user.role}
                      >
                        <option value="customer">Customer</option>
                        <option value="admin">Admin</option>
                      </select>
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
