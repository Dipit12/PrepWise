import { useState, useEffect } from "react";
import { AuthContext } from "./authContext";
import { getMe } from "./services/authApi";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getAndSetUser = async () => {
      try {
        const data = await getMe();
        setUser(data?.user ?? null);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getAndSetUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, setLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
