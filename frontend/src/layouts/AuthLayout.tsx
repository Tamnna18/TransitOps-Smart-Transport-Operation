import React from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { ROLES } from "@/constants";

export const AuthLayout: React.FC = () => {
  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user) {
    if (user.role === ROLES.DRIVER) {
      return <Navigate to="/driver/active-trip" replace />;
    }
    return <Navigate to="/app/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Outlet />
    </div>
  );
};
