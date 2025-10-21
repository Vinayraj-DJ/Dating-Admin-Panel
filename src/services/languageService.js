// src/services/languageService.js
import apiClient from "./apiClient";
import { ENDPOINTS } from "../config/apiConfig";

const endpoints = { base: ENDPOINTS.LANGUAGES.ROOT };

// normalize status to backend format (your Postman used lowercase 'publish'/'unpublish')
const normalizeStatus = (s) => {
  const t = String(s || "").toLowerCase();
  return t === "publish" ? "publish" : "unpublish";
};

// GET: /admin/languages
export async function getAllLanguages({ signal } = {}) {
  const res = await apiClient.get(endpoints.base, { signal });
  return res.data; // { statusCode, success, message, data:[...] }
}

// POST: /admin/languages  (title, status, image[file])
export async function addLanguage({ name, status, iconFile }, { signal } = {}) {
  const fd = new FormData();
  fd.append("title", name);
  fd.append("status", normalizeStatus(status));
  if (iconFile instanceof File) fd.append("image", iconFile, iconFile.name);

  const res = await apiClient.post(endpoints.base, fd, { signal });
  return res.data;
}

// PUT: /admin/languages/{id}  (id + changed fields)
export async function updateLanguage(
  { id, name, status, iconFile },
  { signal } = {}
) {
  const fd = new FormData();
  if (typeof name !== "undefined") fd.append("title", name);
  if (typeof status !== "undefined") fd.append("status", normalizeStatus(status));
  if (iconFile instanceof File) fd.append("image", iconFile, iconFile.name);

  const res = await apiClient.put(`${endpoints.base}/${id}`, fd, { signal });
  return res.data;
}

// DELETE: /admin/languages/{id}
export async function deleteLanguage({ id }, { signal } = {}) {
  const res = await apiClient.delete(`${endpoints.base}/${id}`, { signal });
  return res.data;
}
