import { useContext } from "react";
import { AuthContext } from "../authContext";
import { login, register, logout } from "../services/authApi";

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  const { user, setUser, loading, setLoading } = context;

  const handleLogin = async ({ email, password }) => {
    setLoading(true);
    try {
      const data = await login({ email, password });

      if (!data || !data.user) {
        throw new Error("Invalid login response from server");
      }

      setUser(data.user);
      return data;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async ({ username, email, password }) => {
    setLoading(true);
    try {
      const data = await register({ username, email, password });

      if (!data) {
        throw new Error("Invalid register response from server");
      }

      setUser(data.user ?? data);
      return data;
    } catch (error) {
      console.error("Registration failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      const data = await logout();
      setUser(null);
      return data;
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { user, loading, handleLogin, handleRegister, handleLogout };
};
