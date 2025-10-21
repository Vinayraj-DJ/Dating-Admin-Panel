// src/services/giftService.js
import apiClient from "./apiClient";
import { ENDPOINTS } from "../config/apiConfig";

const endpoints = { base: ENDPOINTS.GIFTS.ROOT };

// backend expects lowercase 'publish' | 'unpublish'
const normalizeStatus = (s) =>
  String(s || "").toLowerCase() === "publish" ? "publish" : "unpublish";

/**
 * GET: /admin/gifts
 * returns normalized array of objects:
 *  - coin (from coin or price)
 *  - icon (string) - url or path extracted from icon|image|imageUrl|path
 *  - status (lowercase 'publish'|'unpublish')
 */
export async function getAllGifts({ signal } = {}) {
  const res = await apiClient.get(endpoints.base, { signal });

  // Accept either { success:true, data: [...] } or an array directly
  const payload = res?.data ?? res;
  const list = Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
    ? payload.data
    : [];

  return list.map((g) => {
    const icon = g.icon ?? g.image ?? g.imageUrl ?? g.path ?? "";
    return {
      ...g,
      coin: g.coin ?? g.price ?? "",
      icon,
      status: normalizeStatus(g.status),
    };
  });
}

// POST: /admin/gifts  (coin, status, image[file])
export async function addGift({ coin, status, iconFile }, { signal } = {}) {
  const fd = new FormData();
  fd.append("coin", String(coin ?? ""));
  fd.append("status", normalizeStatus(status));
  if (iconFile instanceof File) fd.append("image", iconFile, iconFile.name);

  const res = await apiClient.post(endpoints.base, fd, { signal });
  // return consistent shape: some callers expect res.data, some expect the data directly
  return res.data;
}

// PUT: /admin/gifts/{id}
export async function updateGift({ id, coin, status, iconFile }, { signal } = {}) {
  if (!id) throw new Error("Missing id for updateGift");

  const fd = new FormData();
  if (typeof coin !== "undefined") fd.append("coin", String(coin));
  if (typeof status !== "undefined") fd.append("status", normalizeStatus(status));
  if (iconFile instanceof File) fd.append("image", iconFile, iconFile.name);

  const res = await apiClient.put(`${endpoints.base}/${id}`, fd, { signal });
  return res.data;
}

// DELETE: /admin/gifts/{id}
export async function deleteGift({ id }, { signal } = {}) {
  const res = await apiClient.delete(`${endpoints.base}/${id}`, { signal });
  return res.data;
}
