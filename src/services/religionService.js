


// src/services/religionService.js
import apiClient from "./apiClient";
import { ENDPOINTS } from "../config/apiConfig";

/**
 * endpoints.base should resolve to "/admin/religions"
 */
const endpoints = { base: ENDPOINTS.RELIGIONS.ROOT };

// normalize to lowercase values backend expects
const normalizeStatus = (s) => {
  if (s == null) return undefined;
  const low = String(s).trim().toLowerCase();
  if (low === "publish" || low === "published") return "publish";
  if (low === "unpublish" || low === "unpublished" || low === "un-publish") return "unpublish";
  console.warn("normalizeStatus: unknown status:", s);
  return low;
};

// GET: /admin/religions
export async function getAllReligions({ signal } = {}) {
  try {
    const res = await apiClient.get(endpoints.base, { signal });
    return res.data; // expected shape: { statusCode, success, message, data: [...] }
  } catch (err) {
    err._ctx = { fn: "getAllReligions", url: endpoints.base };
    throw err;
  }
}

// POST: /admin/religions  (JSON body)
export async function addReligion({ name, status }, { signal } = {}) {
  const title = typeof name === "string" ? name.trim() : name;
  if (!title) {
    throw new Error("addReligion: missing required field `name` (title).");
  }

  const payload = { title };
  const nStatus = normalizeStatus(status);
  if (typeof nStatus !== "undefined") payload.status = nStatus;

  try {
    const res = await apiClient.post(endpoints.base, payload, { signal });
    return res.data;
  } catch (err) {
    err._ctx = { fn: "addReligion", url: endpoints.base, payload };
    throw err;
  }
}

// PUT: /admin/religions/{id}  (JSON body)
export async function updateReligion({ id, name, status }, { signal } = {}) {
  if (!id) throw new Error("updateReligion: missing id");

  const payload = {};
  if (typeof name !== "undefined") payload.title = (typeof name === "string" ? name.trim() : name);
  const nStatus = normalizeStatus(status);
  if (typeof nStatus !== "undefined") payload.status = nStatus;

  try {
    const res = await apiClient.put(`${endpoints.base}/${id}`, payload, { signal });
    return res.data;
  } catch (err) {
    err._ctx = { fn: "updateReligion", url: `${endpoints.base}/${id}`, payload };
    throw err;
  }
}

// DELETE: /admin/religions/{id}
export async function deleteReligion({ id }, { signal } = {}) {
  if (!id) throw new Error("deleteReligion: missing id");

  try {
    const res = await apiClient.delete(`${endpoints.base}/${id}`, { signal });
    return res.data;
  } catch (err) {
    err._ctx = { fn: "deleteReligion", url: `${endpoints.base}/${id}` };
    throw err;
  }
}
