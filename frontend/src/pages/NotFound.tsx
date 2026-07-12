import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Compass } from "lucide-react";

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center animate-fade-in">
      <div className="p-4 bg-primary/10 text-primary rounded-full mb-6">
        <Compass className="h-16 w-16" />
      </div>
      <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
        404 - Page Not Found
      </h1>
      <p className="mt-4 text-lg text-muted-foreground max-w-md">
        The route you are trying to reach does not exist or has been relocated in the ERP registry.
      </p>
      <div className="mt-8">
        <Button onClick={() => navigate(-1)} variant="outline" className="mr-4">
          Go Back
        </Button>
        <Button onClick={() => navigate("/")}>
          Return Home
        </Button>
      </div>
    </div>
  );
};
