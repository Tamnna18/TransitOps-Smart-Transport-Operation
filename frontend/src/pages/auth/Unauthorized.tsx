import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

export const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center animate-fade-in">
      <div className="p-4 bg-destructive/10 text-destructive rounded-full mb-6 animate-pulse">
        <ShieldAlert className="h-16 w-16" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
        Access Denied
      </h1>
      <p className="mt-4 text-lg text-muted-foreground max-w-md">
        You do not have the required permissions to view this module. Please contact your administrator or switch to an authorized role.
      </p>
      <div className="mt-8 flex gap-4">
        <Button onClick={() => navigate(-1)} variant="outline">
          Go Back
        </Button>
        <Button onClick={() => navigate("/login")}>
          Return to Login
        </Button>
      </div>
    </div>
  );
};
