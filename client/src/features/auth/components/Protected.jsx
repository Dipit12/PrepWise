import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import React from "react";

const Protected = ({ children }) => {
  const { loading, user } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return children;
};
export default Protected;
