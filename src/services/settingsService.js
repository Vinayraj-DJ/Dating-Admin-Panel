import apiClient from "./apiClient"; // adapt to your apiClient path

// GET settings
export function getSettings({ signal } = {}) {
  return apiClient.get("/admin/settings", { signal }).then(res => res.data);
}

// PUT/UPDATE settings
// Accepts JSON payload. If you need file upload, send FormData from page-level.
export function updateSettings(payload) {
  // If passing FormData, apiClient will send multipart automatically if configured.
  return apiClient.put("/admin/settings", payload).then(res => res.data);
}

// Optional: image upload endpoint if your backend exposes it
export function uploadImage(formData) {
  return apiClient.post("/admin/upload", formData, { headers: { "Content-Type": "multipart/form-data" } }).then(res => res.data);
}
