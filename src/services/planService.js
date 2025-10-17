// // src/services/planService.js
// import apiClient from "./apiClient";
// import { ENDPOINTS } from "../config/apiConfig";

// const endpoints = { base: ENDPOINTS.PLANS.ROOT };

// const normalizeStatus = (s) => {
//   const v = String(s || "").toLowerCase();
//   return v === "publish" ? "Publish" : "UnPublish";
// };

// export async function getAllPlans({ signal } = {}) {
//   const res = await apiClient.get(endpoints.base, { signal });
//   return res.data;
// }

// export async function addPlan(
//   {
//     title,
//     amount,      // string like "49.99"
//     dayLimit,    // string like "30"
//     description, // optional
//     filterInclude,
//     audioVideo,
//     directChat,
//     chat,
//     likeMenu,
//     status,
//   },
//   { signal } = {}
// ) {
//   const body = {
//     title,
//     amount: String(amount ?? ""),
//     dayLimit: String(dayLimit ?? ""),
//     description: description ?? "",
//     filterInclude: !!filterInclude,
//     audioVideo: !!audioVideo,
//     directChat: !!directChat,
//     chat: !!chat,
//     likeMenu: !!likeMenu,
//     status: normalizeStatus(status),
//   };
//   const res = await apiClient.post(endpoints.base, body, { signal });
//   return res.data;
// }

// // Send ONLY changed fields
// export async function updatePlanPartial(
//   {
//     id,
//     title,
//     amount,
//     dayLimit,
//     description,
//     filterInclude,
//     audioVideo,
//     directChat,
//     chat,
//     likeMenu,
//     status,
//   },
//   { signal } = {}
// ) {
//   if (!id) throw new Error("Plan id is required");
//   const body = {};
//   if (typeof title !== "undefined") body.title = title;
//   if (typeof amount !== "undefined") body.amount = String(amount);
//   if (typeof dayLimit !== "undefined") body.dayLimit = String(dayLimit);
//   if (typeof description !== "undefined") body.description = description ?? "";
//   if (typeof filterInclude !== "undefined")
//     body.filterInclude = !!filterInclude;
//   if (typeof audioVideo !== "undefined") body.audioVideo = !!audioVideo;
//   if (typeof directChat !== "undefined") body.directChat = !!directChat;
//   if (typeof chat !== "undefined") body.chat = !!chat;
//   if (typeof likeMenu !== "undefined") body.likeMenu = !!likeMenu;
//   if (typeof status !== "undefined") body.status = normalizeStatus(status);

//   const res = await apiClient.put(`${endpoints.base}/${id}`, body, { signal });
//   return res.data;
// }

// export async function deletePlan({ id }, { signal } = {}) {
//   const res = await apiClient.delete(`${endpoints.base}/${id}`, { signal });
//   return res.data;
// }


// src/services/planService.js
import apiClient from "./apiClient";
import { ENDPOINTS } from "../config/apiConfig";

const endpoints = { base: ENDPOINTS.PLANS.ROOT || "/admin/plans" };

// normalize to lowercase values backend expects
const normalizeStatus = (s) => {
  if (s == null) return undefined;
  const low = String(s).trim().toLowerCase();
  if (low === "publish" || low === "published") return "publish";
  if (low === "unpublish" || low === "unpublished") return "unpublish";
  console.warn("normalizeStatus: unknown status:", s);
  return low;
};

function buildToggleButtons({
  filterInclude,
  audioVideo,
  directChat,
  chat,
  likeMenu,
}) {
  return {
    filterInclude: !!filterInclude,
    audioVideo: !!audioVideo,
    directChat: !!directChat,
    chat: !!chat,
    likeMenu: !!likeMenu,
  };
}

export async function getAllPlans({ signal } = {}) {
  try {
    const res = await apiClient.get(endpoints.base, { signal });
    return res.data;
  } catch (err) {
    err._ctx = { fn: "getAllPlans", url: endpoints.base };
    throw err;
  }
}

/**
 * POST /admin/plans
 * body should match Postman:
 * {
 *   title, amount, dayLimit, description,
 *   toggleButtons: { filterInclude, audioVideo, directChat, chat, likeMenu },
 *   status: "publish" | "unpublish"
 * }
 */
export async function addPlan(
  {
    title,
    amount, // numeric or numeric string - backend often accepts number
    dayLimit,
    description,
    filterInclude,
    audioVideo,
    directChat,
    chat,
    likeMenu,
    status,
  },
  { signal } = {}
) {
  if (!title || !String(title).trim()) {
    throw new Error("addPlan: title is required");
  }

  const payload = {
    title: String(title).trim(),
    // send numbers as numbers if possible; convert only if you must:
    amount: amount === undefined || amount === null ? undefined : Number(amount),
    dayLimit: dayLimit === undefined || dayLimit === null ? undefined : Number(dayLimit),
    description: description ?? "",
    toggleButtons: buildToggleButtons({
      filterInclude,
      audioVideo,
      directChat,
      chat,
      likeMenu,
    }),
  };

  const nStatus = normalizeStatus(status);
  if (typeof nStatus !== "undefined") payload.status = nStatus;

  // remove undefined fields (so backend doesn't receive `amount: undefined`)
  Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

  try {
    const res = await apiClient.post(endpoints.base, payload, { signal });
    return res.data;
  } catch (err) {
    err._ctx = { fn: "addPlan", url: endpoints.base, payload };
    throw err;
  }
}

/**
 * PUT /admin/plans/{id} - send only changed fields
 * Note: We map toggles into toggleButtons only when any toggle present.
 */
export async function updatePlanPartial(
  {
    id,
    title,
    amount,
    dayLimit,
    description,
    filterInclude,
    audioVideo,
    directChat,
    chat,
    likeMenu,
    status,
  },
  { signal } = {}
) {
  if (!id) throw new Error("updatePlanPartial: id is required");

  const body = {};
  if (typeof title !== "undefined") body.title = String(title).trim();
  if (typeof amount !== "undefined") body.amount = Number(amount);
  if (typeof dayLimit !== "undefined") body.dayLimit = Number(dayLimit);
  if (typeof description !== "undefined") body.description = description ?? "";

  // if any toggle field is present, include toggleButtons
  const togglesProvided =
    typeof filterInclude !== "undefined" ||
    typeof audioVideo !== "undefined" ||
    typeof directChat !== "undefined" ||
    typeof chat !== "undefined" ||
    typeof likeMenu !== "undefined";

  if (togglesProvided) {
    body.toggleButtons = buildToggleButtons({
      filterInclude,
      audioVideo,
      directChat,
      chat,
      likeMenu,
    });
  }

  if (typeof status !== "undefined") body.status = normalizeStatus(status);

  try {
    const res = await apiClient.put(`${endpoints.base}/${id}`, body, { signal });
    return res.data;
  } catch (err) {
    err._ctx = { fn: "updatePlanPartial", url: `${endpoints.base}/${id}`, body };
    throw err;
  }
}

export async function deletePlan({ id }, { signal } = {}) {
  if (!id) throw new Error("deletePlan: missing id");
  try {
    const res = await apiClient.delete(`${endpoints.base}/${id}`, { signal });
    return res.data;
  } catch (err) {
    err._ctx = { fn: "deletePlan", url: `${endpoints.base}/${id}` };
    throw err;
  }
}
