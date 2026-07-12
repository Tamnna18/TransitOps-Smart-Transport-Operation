import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { useThemeStore } from "@/store/useThemeStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bell,
  Sun,
  Moon,
  User,
  Menu,
  CheckCircle,
  AlertTriangle,
  Info
} from "lucide-react";

interface NavbarProps {
  onOpenMobileMenu: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenMobileMenu }) => {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { notifications, unreadCount, markAllAsRead } = useNotificationStore();
  const [showNotiDropdown, setShowNotiDropdown] = React.useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = React.useState(false);

  const pathSegments = location.pathname.split("/").filter(Boolean);
  
  const getIconForType = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case "warning": return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "error": return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default: return <Info className="h-4 w-4 text-sky-500" />;
    }
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-6 sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenMobileMenu}
          className="p-1 hover:bg-muted rounded text-muted-foreground md:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>
        
        <nav className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
          {pathSegments.map((segment, index) => {
            const path = `/${pathSegments.slice(0, index + 1).join("/")}`;
            const isLast = index === pathSegments.length - 1;
            const cleanName = segment.charAt(0).toUpperCase() + segment.slice(1);
            
            return (
              <React.Fragment key={path}>
                {index > 0 && <span className="text-muted-foreground/50">/</span>}
                {isLast ? (
                  <span className="text-foreground font-semibold">{cleanName}</span>
                ) : (
                  <Link to={path} className="hover:text-foreground">
                    {cleanName}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={toggleTheme}>
          {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </Button>

        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setShowNotiDropdown(!showNotiDropdown);
              setShowProfileDropdown(false);
            }}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white animate-pulse">
                {unreadCount}
              </span>
            )}
          </Button>

          {showNotiDropdown && (
            <div className="absolute right-0 mt-2 w-80 rounded-md border bg-card shadow-lg ring-1 ring-black ring-opacity-5 z-50 animate-fade-in">
              <div className="flex items-center justify-between border-b px-4 py-2">
                <span className="text-sm font-semibold">Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-xs text-primary hover:underline">
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-muted-foreground">
                    No new notifications
                  </div>
                ) : (
                  notifications.map((noti) => (
                    <div
                      key={noti.id}
                      className={`flex gap-3 px-4 py-3 border-b text-xs last:border-b-0 hover:bg-muted/50 ${
                        !noti.isRead ? "bg-primary/5 font-semibold" : ""
                      }`}
                    >
                      <div className="mt-0.5">{getIconForType(noti.type)}</div>
                      <div className="flex-1">
                        <p className="text-foreground">{noti.title}</p>
                        <p className="text-muted-foreground font-normal mt-0.5">{noti.message}</p>
                        <p className="text-[10px] text-muted-foreground/60 font-normal mt-1">
                          {new Date(noti.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => {
              setShowProfileDropdown(!showProfileDropdown);
              setShowNotiDropdown(false);
            }}
            className="flex items-center gap-2 focus:outline-none"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="h-5 w-5" />
            </div>
            <div className="hidden lg:flex flex-col items-start text-left">
              <span className="text-xs font-semibold leading-none">{user?.name || "Guest User"}</span>
              <span className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wide">{user?.role || "Guest"}</span>
            </div>
          </button>

          {showProfileDropdown && (
            <div className="absolute right-0 mt-2 w-56 rounded-md border bg-card shadow-lg ring-1 ring-black ring-opacity-5 z-50 animate-fade-in">
              <div className="px-4 py-3 border-b">
                <p className="text-xs font-medium text-foreground">{user?.name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{user?.email}</p>
                <Badge className="mt-2 text-[9px] uppercase tracking-wide" variant="outline">
                  {user?.role}
                </Badge>
              </div>
              <div className="py-1">
                <Link
                  to="/app/settings"
                  className="block px-4 py-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={() => setShowProfileDropdown(false)}
                >
                  Account Settings
                </Link>
                <button
                  onClick={() => {
                    setShowProfileDropdown(false);
                    logout();
                  }}
                  className="block w-full text-left px-4 py-2 text-xs text-destructive hover:bg-destructive/10"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
