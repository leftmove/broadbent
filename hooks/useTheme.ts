import { useObservable } from "@legendapp/state/react";
import { themeState } from "state/ui/theme";
import { Storage } from "lib/utils/storage";
import { useEffect } from "react";

export function useTheme() {
  const theme = useObservable(themeState);

  useEffect(() => {
    // Load theme from storage on mount
    const savedTheme = Storage.get('THEME');
    if (savedTheme) {
      themeState.set(savedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      themeState.mode.set(prefersDark ? 'dark' : 'light');
    }

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (themeState.isSystemTheme.get()) {
        themeState.mode.set(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    // Apply theme to document
    document.documentElement.classList.toggle('dark', theme.mode === 'dark');
    Storage.set('THEME', theme);
  }, [theme.mode, theme.isSystemTheme]);

  const toggleTheme = () => {
    themeState.isSystemTheme.set(false);
    themeState.mode.set(theme.mode === 'light' ? 'dark' : 'light');
  };

  const setSystemTheme = () => {
    themeState.isSystemTheme.set(true);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    themeState.mode.set(prefersDark ? 'dark' : 'light');
  };

  return {
    mode: theme.mode,
    isSystemTheme: theme.isSystemTheme,
    toggleTheme,
    setSystemTheme,
  };
}