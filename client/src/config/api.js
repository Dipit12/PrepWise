import axios from "axios";

const LOCAL_API_URL = "http://localhost:3000";
const PRODUCTION_API_URL = "https://prepwise-18.onrender.com";

const getDefaultApiBaseUrl = () => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;

    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return LOCAL_API_URL;
    }
  }

  return PRODUCTION_API_URL;
};

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() || getDefaultApiBaseUrl();

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export default api;
