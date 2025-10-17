import apiClient from "./apiClient";
import { ENDPOINTS } from "../config/apiConfig";

export async function adminLogin(payload, { signal } = {}) {
  const res = await apiClient.post(ENDPOINTS.ADMIN.LOGIN, payload, { signal });
  return res?.data?.data?.token || "";
}
