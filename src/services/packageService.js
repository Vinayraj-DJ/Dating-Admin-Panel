import apiClient from "./apiClient";
import { ENDPOINTS } from "../config/apiConfig";

const endpoints = { base: ENDPOINTS.PACKAGES.ROOT };

// backend expects lowercase 'publish' | 'unpublish' (per Postman)
const normalizeStatus = (s) =>
  String(s || "").toLowerCase() === "publish" ? "publish" : "unpublish";

/**
 * GET: /admin/packages
 */
export async function getAllPackages({ signal } = {}) {
  const res = await apiClient.get(endpoints.base, { signal });
  return res.data;
}

/**
 * POST: /admin/packages
 * Accepts either { coin } or { totalCoin } (legacy), plus amount and status.
 */
export async function addPackage(
  { coin, totalCoin, amount, status } = {},
  { signal } = {}
) {
  const resolvedCoin =
    typeof coin !== "undefined" && coin !== null ? Number(coin) : Number(totalCoin ?? 0);
  const payload = {
    coin: Number(isNaN(resolvedCoin) ? 0 : resolvedCoin),
    amount: Number(isNaN(Number(amount)) ? 0 : Number(amount)),
    status: normalizeStatus(status),
  };

  const res = await apiClient.post(endpoints.base, payload, { signal });
  return res.data;
}

/**
 * PUT: /admin/packages/{id}
 * Partial update - send only fields you want to change.
 * Exposes both updatePackagePartial and updatePackage (alias).
 */
export async function updatePackagePartial(
  { id, coin, totalCoin, amount, status } = {},
  { signal } = {}
) {
  if (!id) throw new Error("Package id is required");

  const body = {};
  if (typeof coin !== "undefined") body.coin = Number(coin);
  else if (typeof totalCoin !== "undefined") body.coin = Number(totalCoin);

  if (typeof amount !== "undefined") body.amount = Number(amount);
  if (typeof status !== "undefined") body.status = normalizeStatus(status);

  const res = await apiClient.put(`${endpoints.base}/${id}`, body, { signal });
  return res.data;
}

// alias so older imports using `updatePackage` still work
export const updatePackage = updatePackagePartial;

/**
 * DELETE: /admin/packages/{id}
 */
export async function deletePackage({ id }, { signal } = {}) {
  const res = await apiClient.delete(`${endpoints.base}/${id}`, { signal });
  return res.data;
}
