import React from "react";
import { Outlet, Navigate, NavLink } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { ROLES } from "@/constants";
import { cn } from "@/utils/cn";
import { Truck, LogOut, MapPin, CreditCard, FileText, User } from "lucide-react";

export const DriverLayout: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== ROLES.DRIVER) {
    return <Navigate to="/app/dashboard" replace />;
  }

  const driverTabs = [
    { name: "Active Trip", path: "/driver/active-trip", icon: MapPin },
    { name: "Log Cost", path: "/driver/expenses", icon: CreditCard },
    { name: "My Docs", path: "/driver/documents", icon: FileText },
    { name: "Profile", path: "/driver/profile", icon: User },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="flex h-14 items-center justify-between border-b bg-card px-4 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-primary" />
          <span className="font-bold text-sm tracking-tight">Driver Portal</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold text-muted-foreground">{user?.name}</span>
          <button
            onClick={logout}
            className="p-1 text-destructive hover:bg-destructive/10 rounded"
            title="Log Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main className="flex-1 pb-16 p-4 overflow-y-auto">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t flex justify-around items-center z-10 px-2 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] animate-fade-in">
        {driverTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.name}
              to={tab.path}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center flex-1 py-1 text-muted-foreground hover:text-foreground transition-colors duration-200",
                  isActive && "text-primary hover:text-primary font-semibold"
                )
              }
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] mt-1">{tab.name}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};
