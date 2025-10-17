// // src/services/faqService.js
// import apiClient from "./apiClient";
// import { ENDPOINTS } from "../config/apiConfig";

// const endpoints = { base: ENDPOINTS.FAQS.ROOT };

// // Backend accepts "Publish" / "UnPublish"
// const normalizeStatus = (s) => {
//   const v = String(s || "").toLowerCase();
//   return v === "publish" ? "Publish" : "UnPublish";
// };

// // GET: /admin/faq
// export async function getAllFaqs({ signal } = {}) {
//   const res = await apiClient.get(endpoints.base, { signal });
//   return res.data; // { statusCode, success, message, data: [...] }
// }

// // POST: /admin/faq   BODY: { question, answer, status }
// export async function addFaq({ question, answer, status }, { signal } = {}) {
//   const payload = {
//     question: String(question || "").trim(),
//     answer: String(answer || "").trim(),
//     status: normalizeStatus(status),
//   };
//   const res = await apiClient.post(endpoints.base, payload, { signal });
//   return res.data; // { statusCode, success, message, data }
// }

// // PUT (partial): /admin/faqs/{id}   BODY: { [question], [answer], [status] }
// export async function updateFaqPartial(
//   { id, question, answer, status },
//   { signal } = {}
// ) {
//   const payload = {};
//   if (typeof question !== "undefined") payload.question = String(question).trim();
//   if (typeof answer !== "undefined") payload.answer = String(answer).trim();
//   if (typeof status !== "undefined") payload.status = normalizeStatus(status);

//   const res = await apiClient.put(`${endpoints.base}/${id}`, payload, { signal });
//   return res.data; // { statusCode, success, message, data }
// }

// // DELETE: /admin/faqs/{id}
// export async function deleteFaq({ id }, { signal } = {}) {
//   const res = await apiClient.delete(`${endpoints.base}/${id}`, { signal });
//   return res.data;
// }


// src/services/faqService.js
import apiClient from "./apiClient";
import { ENDPOINTS } from "../config/apiConfig";

const endpoints = { base: ENDPOINTS.FAQS.ROOT || "/admin/faqs" };

// normalize to lowercase values backend expects
const normalizeStatus = (s) => {
  if (s == null) return undefined;
  const low = String(s).trim().toLowerCase();
  if (low === "publish" || low === "published") return "publish";
  if (low === "unpublish" || low === "unpublished") return "unpublish";
  console.warn("normalizeStatus: unknown status:", s);
  return low;
};

// GET: /admin/faqs
export async function getAllFaqs({ signal } = {}) {
  try {
    const res = await apiClient.get(endpoints.base, { signal });
    return res.data; // expected: { statusCode, success, message, data: [...] }
  } catch (err) {
    err._ctx = { fn: "getAllFaqs", url: endpoints.base };
    throw err;
  }
}

// POST: /admin/faqs
export async function addFaq({ question, answer, status }, { signal } = {}) {
  const payload = {
    question: String(question || "").trim(),
    answer: String(answer || "").trim(),
  };
  const nStatus = normalizeStatus(status);
  if (typeof nStatus !== "undefined") payload.status = nStatus;

  if (!payload.question) throw new Error("addFaq: missing required field `question`.");

  try {
    const res = await apiClient.post(endpoints.base, payload, { signal });
    return res.data;
  } catch (err) {
    err._ctx = { fn: "addFaq", url: endpoints.base, payload };
    throw err;
  }
}

// PUT: /admin/faqs/{id} (partial)
export async function updateFaqPartial({ id, question, answer, status }, { signal } = {}) {
  if (!id) throw new Error("updateFaqPartial: missing id");

  const payload = {};
  if (typeof question !== "undefined") payload.question = String(question).trim();
  if (typeof answer !== "undefined") payload.answer = String(answer).trim();
  if (typeof status !== "undefined") payload.status = normalizeStatus(status);

  try {
    const res = await apiClient.put(`${endpoints.base}/${id}`, payload, { signal });
    return res.data;
  } catch (err) {
    err._ctx = { fn: "updateFaqPartial", url: `${endpoints.base}/${id}`, payload };
    throw err;
  }
}

// DELETE: /admin/faqs/{id}
export async function deleteFaq({ id }, { signal } = {}) {
  if (!id) throw new Error("deleteFaq: missing id");
  try {
    const res = await apiClient.delete(`${endpoints.base}/${id}`, { signal });
    return res.data;
  } catch (err) {
    err._ctx = { fn: "deleteFaq", url: `${endpoints.base}/${id}` };
    throw err;
  }
}
