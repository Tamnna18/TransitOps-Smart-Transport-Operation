import React from "react";
import { NavLink } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { useSidebarStore } from "@/store/useSidebarStore";
import { ROLES, type Role } from "@/constants";
import { cn } from "@/utils/cn";
import {
  LayoutDashboard,
  Truck,
  Users,
  MapPin,
  Wrench,
  CircleDollarSign,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

interface SidebarItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  allowedRoles: Role[];
}

const sidebarItems: SidebarItem[] = [
  {
    name: "Dashboard",
    path: "/app/dashboard",
    icon: LayoutDashboard,
    allowedRoles: [ROLES.MANAGER, ROLES.SAFETY, ROLES.ANALYST],
  },
  {
    name: "Fleet Registry",
    path: "/app/fleet",
    icon: Truck,
    allowedRoles: [ROLES.MANAGER, ROLES.SAFETY],
  },
  {
    name: "Driver Operations",
    path: "/app/drivers",
    icon: Users,
    allowedRoles: [ROLES.MANAGER, ROLES.SAFETY],
  },
  {
    name: "Dispatch Center",
    path: "/app/dispatch",
    icon: MapPin,
    allowedRoles: [ROLES.MANAGER],
  },
  {
    name: "Maintenance",
    path: "/app/maintenance",
    icon: Wrench,
    allowedRoles: [ROLES.MANAGER, ROLES.SAFETY],
  },
  {
    name: "Fuel & Expenses",
    path: "/app/expenses",
    icon: CircleDollarSign,
    allowedRoles: [ROLES.MANAGER, ROLES.ANALYST],
  },
  {
    name: "Reports",
    path: "/app/reports",
    icon: FileText,
    allowedRoles: [ROLES.MANAGER, ROLES.SAFETY, ROLES.ANALYST],
  },
  {
    name: "Analytics",
    path: "/app/analytics",
    icon: BarChart3,
    allowedRoles: [ROLES.MANAGER, ROLES.ANALYST],
  },
  {
    name: "Settings",
    path: "/app/settings",
    icon: Settings,
    allowedRoles: [ROLES.MANAGER, ROLES.SAFETY, ROLES.ANALYST],
  },
];

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { isCollapsed, toggleSidebar } = useSidebarStore();

  const userRole = user?.role || ROLES.MANAGER;

  const filteredItems = sidebarItems.filter((item) =>
    item.allowedRoles.includes(userRole)
  );

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 h-screen sticky top-0 z-20",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <Truck className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg tracking-tight">TransitOps</span>
          </div>
        )}
        {isCollapsed && (
          <Truck className="h-6 w-6 text-primary mx-auto" />
        )}
        <button
          onClick={toggleSidebar}
          className="p-1 hover:bg-sidebar-accent rounded text-sidebar-foreground/75 hidden md:block"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
        {filteredItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                )
              }
              title={isCollapsed ? item.name : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!isCollapsed && <span>{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-2 border-t border-sidebar-border">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-destructive hover:bg-destructive/10 w-full transition-all duration-200"
          title={isCollapsed ? "Logout" : undefined}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};
