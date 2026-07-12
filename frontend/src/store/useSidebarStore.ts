import { create } from "zustand";
import { APP_STORAGE_KEYS } from "../constants";

interface SidebarStore {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  setCollapsed: (isCollapsed: boolean) => void;
}

export const useSidebarStore = create<SidebarStore>((set) => {
  const initialCollapsed = localStorage.getItem(APP_STORAGE_KEYS.SIDEBAR_COLLAPSED) === "true";
  
  return {
    isCollapsed: initialCollapsed,
    toggleSidebar: () => set((state) => {
      const nextCollapsed = !state.isCollapsed;
      localStorage.setItem(APP_STORAGE_KEYS.SIDEBAR_COLLAPSED, String(nextCollapsed));
      return { isCollapsed: nextCollapsed };
    }),
    setCollapsed: (isCollapsed) => set(() => {
      localStorage.setItem(APP_STORAGE_KEYS.SIDEBAR_COLLAPSED, String(isCollapsed));
      return { isCollapsed };
    }),
  };
});
