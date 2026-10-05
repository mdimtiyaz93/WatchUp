import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@clerk/react";

const ProtectedRoute = () => {
  const { isLoaded, isSignedIn } = useAuth();

  console.log("CLERK AUTH:", { isLoaded, isSignedIn });

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
