import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginAdmin } from "./authSlice";

export function LoginPage() {
  const dispatch = useDispatch();
  const { status, error } = useSelector((state) => state.auth);
  const [credentials, setCredentials] = useState({
    // email: "admin@example.com",
    // password: "Admin@123",
  });

  function handleChange(event) {
    setCredentials((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    dispatch(loginAdmin(credentials));
  }

  return (
    <main className="grid min-h-screen place-items-center px-5 py-10">
      <form className="panel grid w-full max-w-md gap-5 p-7 shadow-sm" onSubmit={handleSubmit}>
        <div>
          <p className="eyebrow">Secure Access</p>
          <h1 className="text-3xl font-extrabold tracking-normal">Admin Sign In</h1>
        </div>

        <label className="label">
          Email
          <input
            className="field"
            name="email"
            type="email"
            value={credentials.email}
            onChange={handleChange}
            required
          />
        </label>

        <label className="label">
          Password
          <input
            className="field"
            name="password"
            type="password"
            value={credentials.password}
            onChange={handleChange}
            required
          />
        </label>

        <button className="btn-primary" disabled={status === "loading"} type="submit">
          {status === "loading" ? "Signing in..." : "Sign In"}
        </button>

        {error ? <p className="text-sm font-bold text-red-700">{error}</p> : null}
      </form>
    </main>
  );
}
