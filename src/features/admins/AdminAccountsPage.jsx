import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { fetchAdmins, createAdminAccount, deleteAdminAccount } from "./adminsSlice";

const emptyForm = {
  name: "",
  email: "",
  password: "",
  role: "admin",
};

export default function AdminAccountsPage() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { items: admins, status } = useSelector((state) => state.admins || { items: [], status: "idle" });
  const loading = status === "loading";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    dispatch(fetchAdmins());
  }, [dispatch]);

  function openCreateModal() {
    setForm(emptyForm);
    setIsModalOpen(true);
  }

  function closeModal() {
    setForm(emptyForm);
    setIsModalOpen(false);
  }

  async function createAdmin(event) {
    event.preventDefault();

    try {
      await dispatch(createAdminAccount({
        ...form,
        role: "admin",
      })).unwrap();

      toast.success("Admin created successfully");
      closeModal();
    } catch (error) {
      toast.error(error.message || "Failed to create admin");
    }
  }

  async function deleteAdmin(id) {
    const confirmed = window.confirm(
      "Delete this admin account?"
    );

    if (!confirmed) return;

    try {
      await dispatch(deleteAdminAccount(id)).unwrap();
      toast.success("Admin deleted");
    } catch (error) {
      toast.error(error.message || "Failed to delete admin");
    }
  }

  if (user?.role !== "super_admin") {
    return (
      <div className="panel p-6">
        <h2 className="text-xl font-bold">
          Access Denied
        </h2>

        <p className="mt-2 text-muted">
          Only Super Admins can manage admin
          accounts.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <section className="panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="eyebrow">Administration</p>
          <h3 className="text-xl font-extrabold tracking-normal">
            Admin Accounts
          </h3>
        </div>

        <button
          className="btn-primary"
          onClick={openCreateModal}
          type="button"
        >
          Create Admin
        </button>
      </section>

      <section className="panel overflow-hidden">
        <div className="flex items-center justify-between border-b border-line p-5">
          <div>
            <p className="eyebrow">
              Access Management
            </p>

            <h3 className="text-lg font-extrabold tracking-normal">
              Admin Accounts
            </h3>
          </div>

          <span className="text-sm font-semibold text-muted">
            {admins.length} account
            {admins.length !== 1 ? "s" : ""}
          </span>
        </div>

        {loading && !admins.length ? (
          <div className="p-6">
            <p className="font-semibold text-muted">
              Loading admins...
            </p>
          </div>
        ) : admins.length === 0 ? (
          <div className="p-6">
            <p className="font-semibold text-muted">
              No admin accounts found.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead>
                <tr className="border-b bg-slate-50 text-left">
                  <th className="p-4 text-sm font-bold">
                    Name
                  </th>

                  <th className="p-4 text-sm font-bold">
                    Email
                  </th>

                  <th className="p-4 text-sm font-bold">
                    Role
                  </th>

                  <th className="p-4 text-sm font-bold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {admins.map((admin) => (
                  <tr
                    key={admin.id}
                    className="border-b hover:bg-slate-50"
                  >
                    <td className="p-4 font-semibold">
                      {admin.name}
                    </td>

                    <td className="p-4">
                      {admin.email}
                    </td>

                    <td className="p-4">
                      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-bold">
                        {admin.role}
                      </span>
                    </td>

                    <td className="p-4">
                      {admin.role !==
                        "super_admin" && (
                        <button
                          type="button"
                          onClick={() =>
                            deleteAdmin(admin.id)
                          }
                          className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 px-4 py-6">
          <section className="panel w-full max-w-2xl overflow-hidden shadow-2xl">
            <header className="flex items-center justify-between border-b border-line p-5">
              <div>
                <p className="eyebrow">
                  Administration
                </p>

                <h3 className="text-2xl font-extrabold tracking-normal">
                  Create Admin
                </h3>
              </div>

              <button
                className="btn-ghost"
                onClick={closeModal}
                type="button"
              >
                Close
              </button>
            </header>

            <form
              onSubmit={createAdmin}
              className="grid gap-4 p-5 md:grid-cols-2"
            >
              <label className="label">
                Full Name
                <input
                  className="field"
                  placeholder="Enter full name"
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                  required
                />
              </label>

              <label className="label">
                Email
                <input
                  className="field"
                  type="email"
                  placeholder="admin@example.com"
                  value={form.email}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      email: e.target.value,
                    })
                  }
                  required
                />
              </label>

              <label className="label">
                Password
                <input
                  className="field"
                  type="password"
                  placeholder="Enter password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      password: e.target.value,
                    })
                  }
                  required
                />
              </label>

              <div className="md:col-span-2 flex justify-end gap-3 border-t border-line pt-5">
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="btn-primary"
                >
                  Create Admin
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
