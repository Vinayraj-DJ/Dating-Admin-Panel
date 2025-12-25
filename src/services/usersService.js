// src/services/usersService.js
import apiClient from "./apiClient";

const BASE = "/admin/users";

export async function getMaleUsers({ signal } = {}) {
  const res = await apiClient.get(`${BASE}?type=male`, { signal });
  if (!res) return [];
  const payload = res.data ?? res;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data;
  if (payload.data && Array.isArray(payload.data.data)) return payload.data.data;
  return [];
}

export async function getFemaleUsers({ signal } = {}) {
  const res = await apiClient.get(`${BASE}?type=female`, { signal });
  const payload = res.data ?? res;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.data)) return payload.data; 
  return [];
}

export async function getAllUsers({ signal } = {}) {
  const res = await apiClient.get(BASE, { signal });
  return res.data ?? res;
}

/**
 * Toggle (activate / deactivate) user account
 * body: { userType: "male"|"female"|"agency", userId: "<id>", status: "active"|"inactive" }
 *
 * Returns: the updated user object (i.e. the server's `data` field).
 */
export async function toggleUserStatus({ userType, userId, status }, { signal } = {}) {
  if (!userType || !userId || !status) {
    throw new Error("Missing userType, userId or status");
  }

  const res = await apiClient.post(`${BASE}/toggle-status`, { userType, userId, status }, { signal });
  const payload = res.data ?? res;

  if (payload && typeof payload === "object") {
    if (payload.data && typeof payload.data === "object") {
      return payload.data;
    }
    return payload;
  }

  throw new Error("Unexpected response from toggleUserStatus");
}

export const activateUser = (opts, ctx) => toggleUserStatus({ ...opts, status: "active" }, ctx);
export const deactivateUser = (opts, ctx) => toggleUserStatus({ ...opts, status: "inactive" }, ctx);

export async function getUserById(userId, { signal } = {}) {
  if (!userId) return null;
  const res = await apiClient.get(`${BASE}/${userId}`, { signal });
  return res.data ?? res;
}



// // src/services/usersService.js
// import apiClient from "./apiClient";

// const BASE = "/admin/users";

// /**
//  * Fetch male users
//  */
// export async function getMaleUsers({ signal } = {}) {
//   const res = await apiClient.get(`${BASE}?type=male`, { signal });
//   if (!res) return [];
//   const payload = res.data ?? res;
//   if (Array.isArray(payload)) return payload;
//   if (Array.isArray(payload.data)) return payload.data;
//   if (payload.data && Array.isArray(payload.data.data)) return payload.data.data;
//   return [];
// }

// /**
//  * Fetch female users
//  */
// export async function getFemaleUsers({ signal } = {}) {
//   const res = await apiClient.get(`${BASE}?type=female`, { signal });
//   const payload = res.data ?? res;
//   if (Array.isArray(payload)) return payload;
//   if (Array.isArray(payload.data)) return payload.data;
//   return [];
// }

// /**
//  * Fetch all users (males, females, agencies)
//  * Server shape: { success:true, data:{ males:[], females:[], agencies:[] } }
//  */
// export async function getAllUsers({ signal } = {}) {
//   const res = await apiClient.get(BASE, { signal });
//   return res.data ?? res;
// }

// /**
//  * Toggle (activate / deactivate) user account
//  * body: { userType: "male"|"female"|"agency", userId: "<id>", status: "active"|"inactive" }
//  * Returns the updated user object (payload.data)
//  */
// export async function toggleUserStatus({ userType, userId, status }, { signal } = {}) {
//   if (!userType || !userId || !status) {
//     throw new Error("Missing userType, userId or status");
//   }

//   const res = await apiClient.post(
//     `${BASE}/toggle-status`,
//     { userType, userId, status },
//     { signal }
//   );

//   const payload = res.data ?? res;

//   if (payload && typeof payload === "object") {
//     if (payload.data && typeof payload.data === "object") {
//       return payload.data;
//     }
//     return payload;
//   }

//   throw new Error("Unexpected response from toggleUserStatus");
// }

// /** Shortcut helpers for clarity */
// export const activateUser = (opts, ctx) =>
//   toggleUserStatus({ ...opts, status: "active" }, ctx);
// export const deactivateUser = (opts, ctx) =>
//   toggleUserStatus({ ...opts, status: "inactive" }, ctx);

// /**
//  * Get a single user by ID (robust unwrap)
//  * Backend: POST /admin/users/get-single-user
//  * body: { userId, userType }
//  */
// export async function getUserById(userId, userType = "male", { signal } = {}) {
//   if (!userId) throw new Error("User ID is required");

//   const res = await apiClient.post(
//     `${BASE}/get-single-user`,
//     { userId, userType },
//     { signal }
//   );

//   // axios-style: res.data is server payload
//   const payload = res?.data ?? res;

//   // Common shapes:
//   // 1) { success: true, data: { ...user } }
//   // 2) { data: { ...user } }
//   // 3) { success: true, data: { data: { ...user } } } (nested)
//   // 4) direct user object { _id: "...", firstName: "...", ... }
//   // Prefer to return the actual user object or null.

//   if (!payload) return null;

//   // case: { success: true, data: {...} }
//   if (payload.success && payload.data) {
//     // nested: payload.data.data
//     if (payload.data.data && typeof payload.data.data === "object") {
//       return payload.data.data;
//     }
//     return payload.data;
//   }

//   // case: { data: {...} } (no success flag)
//   if (payload.data && typeof payload.data === "object") {
//     // nested: payload.data.data
//     if (payload.data.data && typeof payload.data.data === "object") {
//       return payload.data.data;
//     }
//     return payload.data;
//   }

//   // case: sometimes server wraps user in payload.data.user etc.
//   if (payload.user && typeof payload.user === "object") {
//     return payload.user;
//   }

//   // case: direct user object
//   if (payload._id || payload.id) {
//     return payload;
//   }

//   // nothing matched — return payload for debugging (caller should handle)
//   return payload;
// }

