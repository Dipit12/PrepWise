import axios from "axios";

const API_BASE_URL = "https://prepwise-2.onrender.com";
// For local development, change to: "http://localhost:3001"

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export async function register({ username, email, password }) {
  try {
    const response = await api.post("/api/auth/register", {
      username,
      email,
      password,
    });
    return response.data;
  } catch (err) {
    console.error("Register API error:", err);
    throw err;
  }
}

export async function login({ email, password }) {
  try {
    const response = await api.post("/api/auth/login", {
      email,
      password,
    });
    return response.data;
  } catch (err) {
    console.error("Login API error:", err);
    throw err;
  }
}

export async function logout() {
  try {
    const response = await api.post("/api/auth/logout");
    return response.data;
  } catch (err) {
    console.error("Logout API error:", err);
    throw err;
  }
}

export async function getMe() {
  try {
    const response = await api.get("/api/auth/getMe");
    return response.data;
  } catch (err) {
    console.error("GetMe API error:", err);
    throw err;
  }
}
