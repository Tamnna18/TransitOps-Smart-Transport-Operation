import React from "react";
import { Badge } from "../ui/badge";

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getVariant = (s: string) => {
    const check = s.toUpperCase();
    if (["ACTIVE", "AVAILABLE", "COMPLETED", "APPROVED"].includes(check)) {
      return "success";
    }
    if (["IN_TRANSIT", "IN_USE", "IN_SERVICE", "PENDING"].includes(check)) {
      return "info";
    }
    if (["MAINTENANCE", "SCHEDULED", "ON_REST"].includes(check)) {
      return "warning";
    }
    if (["OUT_OF_SERVICE", "SUSPENDED", "CANCELLED", "REJECTED"].includes(check)) {
      return "destructive";
    }
    return "secondary";
  };

  return (
    <Badge variant={getVariant(status)}>
      {status.replace(/_/g, " ")}
    </Badge>
  );
};
