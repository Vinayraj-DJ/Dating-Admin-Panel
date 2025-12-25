// src/services/coinService.js
import apiClient from "./apiClient";

/**
 * POST /admin/users/operate-balance
 * body: { userType, userId, operationType: "coin", action: "credit"|"debit", amount, message }
 */
export async function operateCoinBalance({ userType, userId, action, amount, message }, { signal } = {}) {
  const body = {
    userType,
    userId,
    operationType: "coin",
    action,
    amount,
    message,
  };
  const res = await apiClient.post("/admin/users/operate-balance", body, { signal });
  // return res.data (server wraps response)
  return res.data ?? res;
}

/**
 * GET /admin/users/:userType/:userId/transactions?operationType=coin
 * returns { success: true, data: [...] } or array depending on API
 */
export async function getCoinTransactions({ userType, userId }, { signal } = {}) {
  const url = `/admin/users/${encodeURIComponent(userType)}/${encodeURIComponent(userId)}/transactions?operationType=coin`;
  const res = await apiClient.get(url, { signal });
  return res.data ?? res;
}
