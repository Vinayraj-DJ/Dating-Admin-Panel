import apiClient from "./apiClient";
import { ENDPOINTS } from "../config/apiConfig";

const BASE = "/admin/staff"; // not in ENDPOINTS map; using literal per Postman

const normalizeStatus = (s) =>
  String(s || "").toLowerCase() === "publish" ? "publish" : "unpublish";

// GET: /admin/staff
export async function getAllStaff({ signal } = {}) {
  const res = await apiClient.get(BASE, { signal });
  return res.data; // { success, data:[...] }
}

// POST: /admin/staff  { email, password, status, permissions }
export async function createStaff({ email, password, status, permissions }, { signal } = {}) {
  const body = {
    email: String(email || "").trim(),
    password: String(password || ""),
    status: normalizeStatus(status),
    permissions: permissions || {},
  };
  const res = await apiClient.post(BASE, body, { signal });
  return res.data;
}

// PATCH: /admin/staff/:id  { permissions? , status? , password? }
export async function updateStaffPartial({ id, permissions, status, password }, { signal } = {}) {
  const body = {};
  if (typeof permissions !== "undefined") body.permissions = permissions;
  if (typeof status !== "undefined") body.status = normalizeStatus(status);
  if (typeof password !== "undefined") body.password = String(password);
  const res = await apiClient.patch(`${BASE}/${id}`, body, { signal });
  return res.data;
}

// DELETE: /admin/staff/:id
export async function deleteStaff({ id }, { signal } = {}) {
  const res = await apiClient.delete(`${BASE}/${id}`, { signal });
  return res.data;
}


