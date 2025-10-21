// const PROD_BASE = (process.env.REACT_APP_API_BASE_URL || "").replace(/\/+$/,"");
// export const API_BASE = process.env.NODE_ENV === "development" ? "/api" : PROD_BASE;

// export const ENDPOINTS = {
//   AUTH: { LOGIN: "/admin/auth/login" },
//   INTEREST: { ROOT: "/admin/interest" }, // GET/POST/PUT/DELETE on same path
// };


// Set the production base URL, removing trailing slashes
const PROD_BASE = (process.env.REACT_APP_API_BASE_URL || "https://friend-circle-nine.vercel.app").replace(/\/+$/, "");

// Use "/api" in development, otherwise use production base
export const API_BASE = process.env.NODE_ENV === "development" ? "/api" : PROD_BASE;

// Updated endpoints based on Postman collection
export const ENDPOINTS = {
  ADMIN: {
    LOGIN: "/admin/login",
    PROFILE: "/admin/me",
    USERS: "/admin/users"
  },
  MALE_USER: {
    REGISTER: "/male-user/register",
  },
  FEMALE_USER: {
    REGISTER: "/female-user/register",
  },
  AGENCY: {
    REGISTER: "/agency/register",
  },
  INTERESTS: { 
    ROOT: "/admin/interests" 
  },
  GIFTS: {
    ROOT: "/admin/gifts"
  },
  RELIGIONS: {
    ROOT: "/admin/religions"
  },
  FAQS: {
    ROOT: "/admin/faqs"
  },
  PLANS: {
    ROOT: "/admin/plans"
  },
  PACKAGES: {
    ROOT: "/admin/packages"
  },
  LANGUAGES: {
    ROOT: "/admin/languages"
  },
  PAGES: {
    ROOT: "/admin/pages"
  },
  RELATION_GOALS: {
    ROOT: "/admin/relation-goals"
  },
};
