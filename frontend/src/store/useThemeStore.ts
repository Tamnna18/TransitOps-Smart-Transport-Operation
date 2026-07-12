import { create } from "zustand";
import { APP_STORAGE_KEYS } from "../constants";

type Theme = "light" | "dark";

interface ThemeStore {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeStore>((set) => {
  const initialTheme = (localStorage.getItem(APP_STORAGE_KEYS.THEME) as Theme) || "light";
  
  if (initialTheme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }

  return {
    theme: initialTheme,
    toggleTheme: () => set((state) => {
      const nextTheme = state.theme === "light" ? "dark" : "light";
      localStorage.setItem(APP_STORAGE_KEYS.THEME, nextTheme);
      
      if (nextTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      
      return { theme: nextTheme };
    }),
    setTheme: (theme) => set(() => {
      localStorage.setItem(APP_STORAGE_KEYS.THEME, theme);
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return { theme };
    }),
  };
});
