import apiClient from "./apiClient";
import { ENDPOINTS } from "../config/apiConfig";

// GET: /admin/me → returns admin profile
export async function getAdminProfile({ signal } = {}) {
  const res = await apiClient.get(ENDPOINTS.ADMIN.PROFILE, { signal });
  return res.data; // { success, message, data: { ...profile } }
}

// PUT: /admin/me → update allowed fields (e.g., name, password)
export async function updateAdminProfile(payload, { signal } = {}) {
  // Only send known fields if provided
  const body = {};
  if (typeof payload?.name !== "undefined") body.name = String(payload.name);
  if (typeof payload?.password !== "undefined") body.password = String(payload.password);

  const res = await apiClient.put(ENDPOINTS.ADMIN.PROFILE, body, { signal });
  return res.data; // { success, message, data }
}

// DELETE: /admin/me → delete admin account (rarely used, but present in Postman)
export async function deleteAdminAccount({ signal } = {}) {
  const res = await apiClient.delete(ENDPOINTS.ADMIN.PROFILE, { signal });
  return res.data;
}


