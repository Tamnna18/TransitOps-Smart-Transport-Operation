import React from "react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { Truck } from "lucide-react";

export const LoadingScreen: React.FC = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg animate-bounce">
          <Truck className="h-6 w-6" />
        </div>
        <div className="space-y-2 text-center">
          <h2 className="text-xl font-bold tracking-tight text-foreground">TransitOps</h2>
          <p className="text-xs text-muted-foreground">Loading interface resources...</p>
        </div>
      </div>
      <LoadingSpinner className="mt-8" size="md" />
    </div>
  );
};
