import React from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { Button } from "@/components/ui/button";

const DriverProfile: React.FC = () => {
  const { user, logout } = useAuthStore();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">My Profile</h1>
      <div className="rounded-lg border bg-card p-6 shadow-sm">
        <p className="text-sm font-medium text-muted-foreground">Driver Details</p>
        <h3 className="text-lg font-bold mt-1">{user?.name}</h3>
        <p className="text-xs text-muted-foreground">{user?.email}</p>
        <p className="text-xs text-muted-foreground mt-2">Role: {user?.role}</p>
      </div>
      <Button onClick={logout} variant="destructive" className="w-full">
        Sign Out
      </Button>
    </div>
  );
};

export default DriverProfile;
