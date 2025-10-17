// // src/services/relationGoalService.js
// import apiClient from "./apiClient";
// import { ENDPOINTS } from "../config/apiConfig";

// const endpoints = { base: ENDPOINTS.RELATION_GOALS.ROOT };

// // normalize exactly what backend accepts
// const normalizeStatus = (s) =>
//   String(s || "").toLowerCase() === "publish" ? "Publish" : "UnPublish";

// // GET: /admin/relation-goals
// export async function getAllRelationGoals({ signal } = {}) {
//   const res = await apiClient.get(endpoints.base, { signal });
//   return res.data; // { statusCode, success, message, data: [...] }
// }

// // POST (JSON): /admin/relation-goals
// export async function addRelationGoal(
//   { title, subtitle = "", status },
//   { signal } = {}
// ) {
//   const payload = {
//     title: String(title || "").trim(),
//     subtitle: String(subtitle || "").trim(),
//     status: normalizeStatus(status),
//   };
//   const res = await apiClient.post(endpoints.base, payload, { signal });
//   return res.data;
// }

// // PUT (partial JSON): /admin/relation-goals/{id}
// export async function updateRelationGoalPartial(
//   { id, title, subtitle, status },
//   { signal } = {}
// ) {
//   const body = {};
//   if (typeof title !== "undefined") body.title = String(title).trim();
//   if (typeof subtitle !== "undefined") body.subtitle = String(subtitle).trim();
//   if (typeof status !== "undefined") body.status = normalizeStatus(status);

//   const res = await apiClient.put(`${endpoints.base}/${id}`, body, { signal });
//   return res.data;
// }

// // DELETE: /admin/relation-goals/{id}
// export async function deleteRelationGoal({ id }, { signal } = {}) {
//   const res = await apiClient.delete(`${endpoints.base}/${id}`, { signal });
//   return res.data;
// }


// src/services/relationGoalService.js
import apiClient from "./apiClient";
import { ENDPOINTS } from "../config/apiConfig";

const endpoints = { base: ENDPOINTS.RELATION_GOALS.ROOT || "/admin/relation-goals" };

// normalize to exactly what backend expects (lowercase)
const normalizeStatus = (s) => {
  if (s == null) return undefined;
  const low = String(s).trim().toLowerCase();
  if (low === "publish" || low === "published") return "publish";
  if (low === "unpublish" || low === "unpublished") return "unpublish";
  console.warn("normalizeStatus: unknown status:", s);
  return low;
};

// GET: /admin/relation-goals
export async function getAllRelationGoals({ signal } = {}) {
  try {
    const res = await apiClient.get(endpoints.base, { signal });
    return res.data; // expected: { statusCode, success, message, data: [...] }
  } catch (err) {
    err._ctx = { fn: "getAllRelationGoals", url: endpoints.base };
    throw err;
  }
}

// POST: /admin/relation-goals
export async function addRelationGoal({ title, subtitle = "", status }, { signal } = {}) {
  const payload = {
    title: String(title || "").trim(),
    subTitle: String(subtitle || "").trim(), // NOTE: backend expects camelCase `subTitle`
  };
  const nStatus = normalizeStatus(status);
  if (typeof nStatus !== "undefined") payload.status = nStatus;

  if (!payload.title) throw new Error("addRelationGoal: missing required field `title`.");

  try {
    const res = await apiClient.post(endpoints.base, payload, { signal });
    return res.data;
  } catch (err) {
    err._ctx = { fn: "addRelationGoal", url: endpoints.base, payload };
    throw err;
  }
}

// PUT: /admin/relation-goals/{id}  (partial)
export async function updateRelationGoalPartial({ id, title, subtitle, status }, { signal } = {}) {
  if (!id) throw new Error("updateRelationGoalPartial: missing id");

  const body = {};
  if (typeof title !== "undefined") body.title = String(title).trim();
  if (typeof subtitle !== "undefined") body.subTitle = String(subtitle).trim(); // send subTitle
  if (typeof status !== "undefined") body.status = normalizeStatus(status);

  try {
    const res = await apiClient.put(`${endpoints.base}/${id}`, body, { signal });
    return res.data;
  } catch (err) {
    err._ctx = { fn: "updateRelationGoalPartial", url: `${endpoints.base}/${id}`, body };
    throw err;
  }
}

// DELETE: /admin/relation-goals/{id}
export async function deleteRelationGoal({ id }, { signal } = {}) {
  if (!id) throw new Error("deleteRelationGoal: missing id");

  try {
    const res = await apiClient.delete(`${endpoints.base}/${id}`, { signal });
    return res.data;
  } catch (err) {
    err._ctx = { fn: "deleteRelationGoal", url: `${endpoints.base}/${id}` };
    throw err;
  }
}
