// src/services/usersService.js
import apiClient from "./apiClient";

const BASE = "/admin/users";

/**
 * Fetch users with query param type=male
 * Expected server response shape (your example):
 * { success: true, data: [ ...maleUsers ] }
 *
 * Returns the array of male user objects.
 */
export async function getMaleUsers({ signal } = {}) {
  const res = await apiClient.get(`${BASE}?type=male`, { signal });
  // safe unwrap: returned shape may be { data: [...] } or { success:true, data: [...] }
  if (!res) return [];
  // axios-like: res.data contains server payload
  const payload = res.data ?? res;
  // server payload shape: { success: true, data: [ ... ] }
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  // fallback: try payload.data.data
  if (payload.data && Array.isArray(payload.data.data)) return payload.data.data;
  return [];
}

/**
 * If you later need female users:
 */
export async function getFemaleUsers({ signal } = {}) {
  const res = await apiClient.get(`${BASE}?type=female`, { signal });
  const payload = res.data ?? res;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  return [];
}



/**
 * Fetch all users. Server shape (Postman): { success:true, data: { males: [], females: [], agencies: [] } }
 * Returns the raw response payload (not normalized).
 */
export async function getAllUsers({ signal } = {}) {
  const res = await apiClient.get(BASE, { signal });
  // unwrap axios-like response
  return res.data ?? res;
}

/**
 * Toggle (activate / deactivate) user account
 * body: { userType: "male"|"female"|"agency", userId: "<id>", status: "active"|"inactive" }
 * Returns server response (unwrapped).
 */
export async function toggleUserStatus({ userType, userId, status }, { signal } = {}) {
  if (!userType || !userId || !status) {
    throw new Error("Missing userType, userId or status");
  }
  const res = await apiClient.post(`${BASE}/toggle-status`, { userType, userId, status }, { signal });
  return res.data ?? res;
}
