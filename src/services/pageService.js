// import apiClient from "./apiClient";
// import { ENDPOINTS } from "../config/apiConfig";

// const endpoints = { base: ENDPOINTS.PAGES.ROOT };

// // map to exactly what the backend accepts
// const normalizeStatus = (s) => (String(s || "").toLowerCase() === "publish" ? "Publish" : "UnPublish");

// export async function getAllPages({ signal } = {}) {
//   const res = await apiClient.get(endpoints.base, { signal });
//   return res.data;                // -> { statusCode, success, message, data:[...], errors:{} }
// }

// export async function addPage({ title, description, status }, { signal } = {}) {
//   const payload = {
//     title: String(title || "").trim(),
//     description: String(description || ""),
//     status: normalizeStatus(status),
//   };
//   const res = await apiClient.post(endpoints.base, payload, { signal });
//   return res.data;
// }

// export async function updatePage({ id, title, description, status }, { signal } = {}) {
//   const payload = {
//     title: String(title || "").trim(),
//     description: String(description || ""),
//     status: normalizeStatus(status),
//   };
//   const res = await apiClient.put(`${endpoints.base}/${id}`, payload, { signal });
//   return res.data;
// }

// export async function deletePage({ id }, { signal } = {}) {
//   const res = await apiClient.delete(`${endpoints.base}/${id}`, { signal });
//   return res.data;
// }



// src/services/pageService.js
import apiClient from "./apiClient";
import { ENDPOINTS } from "../config/apiConfig";

const endpoints = { base: ENDPOINTS.PAGES.ROOT };

// backend expects 'publish' | 'unpublish' (lowercase)
const normalizeStatus = (s) =>
  String(s || "").toLowerCase() === "publish" ? "publish" : "unpublish";

/**
 * GET all pages
 */
export async function getAllPages({ signal } = {}) {
  const res = await apiClient.get(endpoints.base, { signal });
  return res.data;
}

/**
 * POST create page
 * Expects body: { title, slug, description, status }
 * If slug not provided, it will be generated from title.
 */
export async function addPage(
  { title, slug, description, status } = {},
  { signal } = {}
) {
  const payload = {
    title: String(title || "").trim(),
    slug: slug ? String(slug).trim() : String(title || "").trim().replace(/\s+/g, "-").toLowerCase(),
    description: String(description || ""),
    status: normalizeStatus(status),
  };

  const res = await apiClient.post(endpoints.base, payload, { signal });
  return res.data;
}

/**
 * PUT update page
 * Send full body (title, slug, description, status) as JSON like Postman expects.
 */
export async function updatePage(
  { id, title, slug, description, status } = {},
  { signal } = {}
) {
  const payload = {
    title: String(title || "").trim(),
    slug: slug ? String(slug).trim() : String(title || "").trim().replace(/\s+/g, "-").toLowerCase(),
    description: String(description || ""),
    status: normalizeStatus(status),
  };

  const res = await apiClient.put(`${endpoints.base}/${id}`, payload, { signal });
  return res.data;
}

/**
 * DELETE page
 */
export async function deletePage({ id }, { signal } = {}) {
  const res = await apiClient.delete(`${endpoints.base}/${id}`, { signal });
  return res.data;
}
