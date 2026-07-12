import { create } from "zustand";

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: "info" | "warning" | "error" | "success";
  timestamp: string;
  isRead: boolean;
}

interface NotificationStore {
  notifications: SystemNotification[];
  unreadCount: number;
  addNotification: (notification: Omit<SystemNotification, "id" | "timestamp" | "isRead">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
  notifications: [
    {
      id: "1",
      title: "New Trip Assigned",
      message: "You have been dispatched to Route #TO-9942 from Ahmedabad to Surat.",
      type: "info",
      timestamp: new Date().toISOString(),
      isRead: false,
    },
    {
      id: "2",
      title: "Document Approaching Expiry",
      message: "Vehicle #GJ01AB4587 insurance policy expires in 12 days.",
      type: "warning",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      isRead: false,
    }
  ],
  unreadCount: 2,
  addNotification: (noti) => set((state) => {
    const newNotification: SystemNotification = {
      ...noti,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    const notifications = [newNotification, ...state.notifications];
    return {
      notifications,
      unreadCount: notifications.filter(n => !n.isRead).length,
    };
  }),
  markAsRead: (id) => set((state) => {
    const notifications = state.notifications.map((n) =>
      n.id === id ? { ...n, isRead: true } : n
    );
    return {
      notifications,
      unreadCount: notifications.filter(n => !n.isRead).length,
    };
  }),
  markAllAsRead: () => set((state) => {
    const notifications = state.notifications.map((n) => ({ ...n, isRead: true }));
    return {
      notifications,
      unreadCount: 0,
    };
  }),
  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}));
