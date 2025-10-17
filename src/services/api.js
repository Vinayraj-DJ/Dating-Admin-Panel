import apiClient from "./apiClient";
import { ENDPOINTS } from "../config/apiConfig";

export async function adminLogin(payload, { signal } = {}) {
  const res = await apiClient.post(ENDPOINTS.ADMIN.LOGIN, payload, { signal });
  return res?.data?.data?.token || "";
}

export async function getAllInterests({ signal } = {}) {
  const res = await apiClient.get(ENDPOINTS.INTERESTS.ROOT, { signal });
  return res.data;
}

// Registration endpoints
export async function registerMaleUser(payload, { signal } = {}) {
  const res = await apiClient.post(ENDPOINTS.MALE_USER.REGISTER, payload, { signal });
  return res.data;
}

export async function registerFemaleUser(payload, { signal } = {}) {
  const res = await apiClient.post(ENDPOINTS.FEMALE_USER.REGISTER, payload, { signal });
  return res.data;
}

export async function registerAgency(payload, { signal } = {}) {
  const res = await apiClient.post(ENDPOINTS.AGENCY.REGISTER, payload, { signal });
  return res.data;
}
