// src/utils/auth.js

// ✅ Check if user has a valid token stored
export function isAuthed() {
  const token = localStorage.getItem("token");
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  return Boolean(token && isLoggedIn);
}

// ✅ Set login state after successful login
export function setAuth(token) {
  if (token) {
    localStorage.setItem("token", token);
    localStorage.setItem("isLoggedIn", "true");
  }
}

// ✅ Clear everything on logout
export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("isLoggedIn");
}
