
// src/services/adminService.js
import apiClient from "./apiClient";
import { ENDPOINTS } from "../config/apiConfig";

/**
 * Fetch Admin Profile
 * GET /admin/me
 */
export async function getAdminProfile({ signal } = {}) {
  const res = await apiClient.get(ENDPOINTS.ADMIN.PROFILE, { signal });
  return res.data; // { success, data: {...} }
}

/**
 * Update Admin Profile
 * PUT /admin/me
 */
export async function updateAdminProfile(payload, { signal } = {}) {
  const body = {};

  if (payload?.name) body.name = payload.name;
  if (payload?.password) body.password = payload.password;

  const res = await apiClient.put(ENDPOINTS.ADMIN.PROFILE, body, { signal });
  return res.data; // { success, data: {...} }
}

/**
 * Delete Admin Profile (optional)
 * DELETE /admin/me
 */
export async function deleteAdminAccount({ signal } = {}) {
  const res = await apiClient.delete(ENDPOINTS.ADMIN.PROFILE, { signal });
  return res.data;
}
