// // src/services/giftService.js
// import apiClient from "./apiClient";
// import { ENDPOINTS } from "../config/apiConfig";

// const endpoints = { base: ENDPOINTS.GIFTS.ROOT };

// // Backend accepts exactly "Publish" or "UnPublish"
// const normalizeStatus = (s) =>
//   String(s || "").toLowerCase() === "publish" ? "Publish" : "UnPublish";

// // GET: /admin/gift  -> { data: [ { _id, price, status, icon, ... } ] }
// export async function getAllGifts({ signal } = {}) {
//   const res = await apiClient.get(endpoints.base, { signal });
//   return res.data;
// }

// // POST: /admin/gifts  (coin, status, image[file])
// export async function addGift({ coin, status, iconFile }, { signal } = {}) {
//   const fd = new FormData();
//   fd.set("coin", String(coin));                 // API field is "coin"
//   fd.set("status", normalizeStatus(status));
//   if (iconFile instanceof File) fd.append("image", iconFile, iconFile.name);

//   const res = await apiClient.post(endpoints.base, fd, { signal });
//   return res.data;
// }

// // PUT (partial): /admin/gifts  (id + any of coin/status/image)
// export async function updateGiftPartial(
//   { id, coin, status, iconFile },
//   { signal } = {}
// ) {
//   const fd = new FormData();
//   fd.set("id", id);

//   if (typeof coin !== "undefined")   fd.set("coin", String(coin));
//   if (typeof status !== "undefined") fd.set("status", normalizeStatus(status));
//   if (iconFile instanceof File)      fd.append("image", iconFile, iconFile.name);

//   const res = await apiClient.put(`${endpoints.base}/${id}`, fd, { signal });
//   return res.data;
// }

// // DELETE: /admin/gifts/{id}
// export async function deleteGift({ id }, { signal } = {}) {
//   const res = await apiClient.delete(`${endpoints.base}/${id}`, { signal });
//   return res.data;
// }


// src/services/giftService.js
import apiClient from "./apiClient";
import { ENDPOINTS } from "../config/apiConfig";

const endpoints = { base: ENDPOINTS.GIFTS.ROOT };

// backend (per Postman) expects lowercase 'publish' | 'unpublish'
const normalizeStatus = (s) =>
  String(s || "").toLowerCase() === "publish" ? "publish" : "unpublish";

// GET: /admin/gifts
export async function getAllGifts({ signal } = {}) {
  const res = await apiClient.get(endpoints.base, { signal });
  return res.data;
}

// POST: /admin/gifts  (coin, status, image[file])
export async function addGift({ coin, status, iconFile }, { signal } = {}) {
  const fd = new FormData();
  fd.append("coin", String(coin ?? ""));
  fd.append("status", normalizeStatus(status));
  if (iconFile instanceof File) fd.append("image", iconFile, iconFile.name);

  const res = await apiClient.post(endpoints.base, fd, { signal });
  return res.data;
}

// PUT: /admin/gifts/{id}  (coin, status, image[file]) - partial or full update
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
