import React from "react";
import { Outlet, Navigate, NavLink } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { ROLES } from "@/constants";
import { cn } from "@/utils/cn";
import { X, Truck, LogOut, LayoutDashboard, Users, MapPin, Wrench, CircleDollarSign, FileText, BarChart3, Settings } from "lucide-react";

export const DashboardLayout: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role === ROLES.DRIVER) {
    return <Navigate to="/driver/active-trip" replace />;
  }

  const menuItems = [
    { name: "Dashboard", path: "/app/dashboard", icon: LayoutDashboard, roles: ["MANAGER", "SAFETY", "ANALYST"] },
    { name: "Fleet Registry", path: "/app/fleet", icon: Truck, roles: ["MANAGER", "SAFETY"] },
    { name: "Driver Operations", path: "/app/drivers", icon: Users, roles: ["MANAGER", "SAFETY"] },
    { name: "Dispatch Center", path: "/app/dispatch", icon: MapPin, roles: ["MANAGER"] },
    { name: "Maintenance", path: "/app/maintenance", icon: Wrench, roles: ["MANAGER", "SAFETY"] },
    { name: "Fuel & Expenses", path: "/app/expenses", icon: CircleDollarSign, roles: ["MANAGER", "ANALYST"] },
    { name: "Reports", path: "/app/reports", icon: FileText, roles: ["MANAGER", "SAFETY", "ANALYST"] },
    { name: "Analytics", path: "/app/analytics", icon: BarChart3, roles: ["MANAGER", "ANALYST"] },
    { name: "Settings", path: "/app/settings", icon: Settings, roles: ["MANAGER", "SAFETY", "ANALYST"] },
  ].filter(item => item.roles.includes(user?.role || ""));

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-background/80 backdrop-blur-sm animate-fade-in">
          <div className="relative flex w-full max-w-xs flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border p-4">
            <div className="flex items-center justify-between border-b border-sidebar-border pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Truck className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg tracking-tight">TransitOps</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 hover:bg-sidebar-accent rounded text-sidebar-foreground"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav className="flex-1 space-y-1 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                      )
                    }
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>

            <div className="border-t border-sidebar-border pt-4">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-destructive hover:bg-destructive/10 w-full transition-all"
              >
                <LogOut className="h-5 w-5 shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col flex-1 min-w-0">
        <Navbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto max-w-[1600px] mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
