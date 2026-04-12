import axios from "axios";

const API_BASE_URL = "https://prepwise-9.onrender.com";
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
    console.log("Register response:", response);
    return response.data;
  } catch (err) {
    console.error("Register API error:", err);
    throw err;
  }
}

export async function login({ email, password }) {
  try {
    console.log("Attempting login with:", { email });
    const response = await api.post("/api/auth/login", {
      email,
      password,
    });
    console.log("Login response status:", response.status);
    console.log("Login response data:", response.data);
    console.log("Login response headers:", response.headers);
    return response.data;
  } catch (err) {
    console.error("Login request error:", err);
    if (err.response) {
      console.error("Login error response status:", err.response.status);
      console.error("Login error response data:", err.response.data);
    }
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
