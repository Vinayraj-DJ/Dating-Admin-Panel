// src/services/interestService.js
import apiClient from "./apiClient";
import { ENDPOINTS } from "../config/apiConfig";

const endpoints = { base: ENDPOINTS.INTERESTS.ROOT };

// Use backend-accepted values only (expects lowercase)
const normalizeStatus = (s) => {
	const t = String(s || "").toLowerCase();
	return t === "publish" ? "publish" : "unpublish";
};

// GET: /admin/interest
export async function getAllInterests({ signal } = {}) {
	const res = await apiClient.get(endpoints.base, { signal });
	return res.data; // { statusCode, success, message, data:[...] }
}

// POST: /admin/interests (create)
export async function addInterest({ name, status, iconFile }, { signal } = {}) {
	const fd = new FormData();
	fd.set("title", name); // API expects "title" not "name"
	fd.set("status", normalizeStatus(status));
	if (iconFile instanceof File) fd.append("image", iconFile, iconFile.name);

	const res = await apiClient.post(endpoints.base, fd, { signal });
	return res.data;
}

// PUT: /admin/interests/{id} (update)
export async function updateInterestPartial(
	{ id, name, status, iconFile },
	{ signal } = {}
) {
	const fd = new FormData();

	if (typeof name !== "undefined") fd.set("title", name);
	if (typeof status !== "undefined") fd.set("status", normalizeStatus(status));
	if (iconFile instanceof File) fd.append("image", iconFile, iconFile.name);

	const res = await apiClient.put(`${endpoints.base}/${id}`, fd, { signal });
	return res.data;
}

// DELETE: /admin/interests/{id}
export async function deleteInterest({ id }, { signal } = {}) {
	const res = await apiClient.delete(`${endpoints.base}/${id}`, { signal });
	return res.data;
}
