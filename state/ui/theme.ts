import { observable } from "@legendapp/state";

export interface ThemeState {
  mode: "light" | "dark";
  isSystemTheme: boolean;
}

export const themeState = observable<ThemeState>({
  mode: "light",
  isSystemTheme: true,
});