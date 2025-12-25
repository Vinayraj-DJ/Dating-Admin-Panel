import apiClient from "./apiClient";
import { ENDPOINTS } from "../config/apiConfig";

// POST /admin/users/operate-balance
export async function operateWalletBalance({ userType, userId, action, amount, message }) {
  const body = {
    userType,
    userId,
    operationType: "wallet",
    action,
    amount,
    message,
  };

  const res = await apiClient.post(`${ENDPOINTS.ADMIN.USERS}/operate-balance`, body);
  return res.data;
}

// GET /admin/users/:userType/:userId/transactions?operationType=wallet
export async function getWalletTransactions({ userType, userId }) {
  const res = await apiClient.get(
    `${ENDPOINTS.ADMIN.USERS}/${userType}/${userId}/transactions`,
    { params: { operationType: "wallet" } }
  );
  return res.data;
}
