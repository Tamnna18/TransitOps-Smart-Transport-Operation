import { create } from "zustand";

interface SystemSettings {
  unitSystem: "metric" | "imperial";
  currency: string;
  pageSize: number;
}

interface SettingsStore {
  settings: SystemSettings;
  updateSettings: (settings: Partial<SystemSettings>) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: {
    unitSystem: "imperial",
    currency: "INR",
    pageSize: 10,
  },
  updateSettings: (newSettings) => set((state) => ({
    settings: { ...state.settings, ...newSettings },
  })),
}));
