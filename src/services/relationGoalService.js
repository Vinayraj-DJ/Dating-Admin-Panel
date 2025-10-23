// src/services/relationGoalService.js
import apiClient from "./apiClient";

const endpoints = { base: "/admin/relation-goals" };

// backend expects lowercase "publish" | "unpublish"
const normalizeStatus = (s) =>
  String(s || "").toLowerCase() === "publish" ? "publish" : "unpublish";

// GET all relation goals -> returns { data: [...] }
export async function getAllRelationGoals({ signal } = {}) {
  const res = await apiClient.get(endpoints.base, { signal });
  return { data: res?.data?.data || [] };
}

// POST create relation goal (JSON)
// Accepts `subtitle` (friendly name) and maps to `subTitle` for API
export async function addRelationGoal({ title, subtitle = "", status }, { signal } = {}) {
  const payload = {
    title: String(title || "").trim(),
    subTitle: String(subtitle || "").trim(), // map to API field expected by backend
    status: normalizeStatus(status),
  };
  const res = await apiClient.post(endpoints.base, payload, {
    signal,
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
}

// PUT partial update -> PUT /admin/relation-goals/:id  (body = JSON of changed fields)
// Accepts `subtitle` and maps to `subTitle`
export async function updateRelationGoalPartial({ id, title, subtitle, status }, { signal } = {}) {
  const body = {};
  if (typeof title !== "undefined") body.title = String(title).trim();
  if (typeof subtitle !== "undefined") body.subTitle = String(subtitle).trim(); // map to API field
  if (typeof status !== "undefined") body.status = normalizeStatus(status);

  const res = await apiClient.put(`${endpoints.base}/${encodeURIComponent(id)}`, body, {
    signal,
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
}

// DELETE -> DELETE /admin/relation-goals/:id
export async function deleteRelationGoal({ id }, { signal } = {}) {
  const res = await apiClient.delete(`${endpoints.base}/${encodeURIComponent(id)}`, { signal });
  return res.data;
}
