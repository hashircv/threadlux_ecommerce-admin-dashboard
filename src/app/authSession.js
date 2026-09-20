function isTokenValid(token) {
  try {
    const encoded = token.split(".")[1];
    const payload = JSON.parse(atob(encoded.replace(/-/g, "+").replace(/_/g, "/")));
    return Boolean(payload.exp && payload.exp * 1000 > Date.now());
  } catch {
    return false;
  }
}

export function clearAdminSession() {
  sessionStorage.removeItem("adminToken");
  sessionStorage.removeItem("adminUser");
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminUser");
}

export function readAdminSession() {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminUser");
  const token = sessionStorage.getItem("adminToken");

  if (!isTokenValid(token)) {
    clearAdminSession();
    return { token: null, user: null };
  }

  try {
    return { token, user: JSON.parse(sessionStorage.getItem("adminUser") || "null") };
  } catch {
    clearAdminSession();
    return { token: null, user: null };
  }
}

export function saveAdminSession(token, user) {
  sessionStorage.setItem("adminToken", token);
  sessionStorage.setItem("adminUser", JSON.stringify(user));
}
