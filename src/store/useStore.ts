import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserPreferences {
  locale: "ar" | "en";
  setLocale: (locale: "ar" | "en") => void;
}

export const useUserPreferences = create<UserPreferences>()(
  persist(
    (set) => ({
      locale: "ar",
      setLocale: (locale) => set({ locale }),
    }),
    { name: "user-preferences" }
  )
);

interface UIState {
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  isNotificationPanelOpen: boolean;
  setNotificationPanelOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isMobileMenuOpen: false,
  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
  isNotificationPanelOpen: false,
  setNotificationPanelOpen: (open) => set({ isNotificationPanelOpen: open }),
}));
