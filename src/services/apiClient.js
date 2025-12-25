


// src/services/apiClient.js
import axios from "axios";
import { API_BASE } from "../config/apiConfig";

// normalize base url (no trailing slash)
const baseURL = (API_BASE || "").replace(/\/+$/, "");

const apiClient = axios.create({
  baseURL,
  timeout: 20000,
  // do NOT set a global Content-Type here
});

// Attach auth header and ensure FormData uses browser-set multipart boundary
apiClient.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;

    const isFormData =
      typeof FormData !== "undefined" && config.data instanceof FormData;

    if (isFormData) {
      // remove any existing content-type so axios/browser set it with boundary
      if (config.headers) {
        delete config.headers["Content-Type"];
        delete config.headers["content-type"];
      }
      if (config.headers?.common) {
        delete config.headers.common["Content-Type"];
        delete config.headers.common["content-type"];
      }
      if (config.headers?.post) {
        delete config.headers.post["Content-Type"];
        delete config.headers.post["content-type"];
      }
      if (config.headers?.put) {
        delete config.headers.put["Content-Type"];
        delete config.headers.put["content-type"];
      }
    }
  } catch (e) {
    // ignore and continue
  }
  return config;
}, (err) => Promise.reject(err));

apiClient.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("isLoggedIn");
      // optionally redirect to login here
    }
    return Promise.reject(err);
  }
);

export default apiClient;
