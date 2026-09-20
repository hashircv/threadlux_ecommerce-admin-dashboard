const API_URL = import.meta.env.VITE_API_URL;
import { clearAdminSession } from "./authSession";


export async function apiRequest(path, { token, ...options } = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      clearAdminSession();
      window.location.reload();
    }
    throw new Error(body.message || "Request failed");
  }

  return body;
}
