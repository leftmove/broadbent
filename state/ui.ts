import { observable } from "@legendapp/state";
import { useEffect, useState } from "react";

// Define all possible UI state properties here
interface UIState {
  sidebar: {
    collapsed: boolean;
  };
  // Add more UI state categories as needed
  modals: {
    [key: string]: boolean;
  };
  // Example for future expansion:
  // panels: {
  //   rightPanelOpen: boolean;
  //   bottomPanelHeight: number;
  // },
}

// Default values for UI state
const DEFAULT_UI_STATE: UIState = {
  sidebar: {
    collapsed: false,
  },
  modals: {},
};

// Create the observable state
const uiState = observable<UIState>(DEFAULT_UI_STATE);

// Local storage key for persistence
const STORAGE_KEY = "broadbent-ui-state";

// Load from localStorage on initialization
if (typeof window !== "undefined") {
  const savedState = localStorage.getItem(STORAGE_KEY);

  if (savedState) {
    try {
      const parsed = JSON.parse(savedState);
      // Deep merge the saved state with default state to ensure new properties
      // are included when the app structure changes
      uiState.set({
        ...DEFAULT_UI_STATE,
        ...parsed,
      });
    } catch (e) {
      console.error("Failed to parse saved UI state:", e);
    }
  }
}

// Save the current state to localStorage
const persistState = () => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(uiState.get()));
  }
};

// Hook for accessing UI state
export const useUIState = () => {
  // Use a state updater to force re-renders
  const [, setUpdateCounter] = useState(0);

  // Subscribe to changes - use forceUpdate pattern to ensure re-renders
  useEffect(() => {
    // Force component to re-render when state changes
    const unsubscribe = uiState.onChange(() => {
      setUpdateCounter((prev) => prev + 1);
    });

    return unsubscribe;
  }, []);

  // Get the latest state directly from the observable
  const currentState = uiState.get();

  // Direct sidebar toggle function that works with the observable directly
  const toggleSidebar = () => {
    const current = uiState.sidebar.collapsed.get();
    uiState.sidebar.collapsed.set(!current);
    persistState();
  };

  // Direct setter for sidebar collapsed state
  const setSidebarCollapsed = (collapsed: boolean) => {
    uiState.sidebar.collapsed.set(collapsed);
    persistState();
  };

  // Generic setter for any UI state property
  const setUIState = (category: keyof UIState, key: string, value: any) => {
    // @ts-expect-error - Dynamically setting nested properties
    uiState[category][key].set(value);
    persistState();
  };

  // Generic toggle for boolean UI state properties
  const toggleUIState = (category: keyof UIState, key: string) => {
    // @ts-expect-error - Dynamically getting nested properties
    const currentValue = uiState[category][key].get();
    if (typeof currentValue === "boolean") {
      // @ts-expect-error - Dynamically setting nested properties
      uiState[category][key].set(!currentValue);
      persistState();
    } else {
      console.error(
        `Cannot toggle non-boolean UI state: ${String(category)}.${String(key)}`
      );
    }
  };

  // Return the state and utility functions
  return {
    // Get current state directly from observable to ensure it's always fresh
    state: currentState,

    // Direct access to sidebar state for convenience
    sidebarCollapsed: uiState.sidebar.collapsed.get(),
    toggleSidebar,
    setSidebarCollapsed,

    // Generic methods
    setUIState,
    toggleUIState,
  };
};
