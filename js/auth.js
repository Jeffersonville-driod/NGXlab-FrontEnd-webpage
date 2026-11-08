const API_BASE_URL = "https://ngxlab-backend.vercel.app";

async function authRequest(endpoint, payload) {
  const response = await fetch(`${API_BASE_URL}/api/auth/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    credentials: "include",
    body: JSON.stringify(payload)
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error?.message || "Authentication failed");
  }

  return result.user;
}

export function register(name, email, password) {
  return authRequest("register", { name, email, password });
}

export function login(email, password) {
  return authRequest("login", { email, password });
}

export function loginWithGoogle(idToken) {
  return authRequest("google", { idToken });
}

export function requestPasswordReset(email) {
  return authRequest("forgot-password", { email });
}

export function resetPassword(token, password) {
  return authRequest("reset-password", { token, password });
}
