import { observable } from "@legendapp/state";
import { useEffect, useState } from "react";

// Define all possible UI state properties here
interface UIState {
  sidebar: {
    collapsed: boolean;
    forceCollapsed: boolean; // For responsive behavior
  };
  // Add more UI state categories as needed
  modals: {
    [key: string]: boolean;
  };
  input: {
    hasContent: boolean; // Whether the input has any text
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
    forceCollapsed: false,
  },
  modals: {},
  input: {
    hasContent: false,
  },
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
        sidebar: {
          ...DEFAULT_UI_STATE.sidebar,
          ...parsed.sidebar,
          forceCollapsed: false, // Always reset forceCollapsed on page load
        },
        input: {
          ...DEFAULT_UI_STATE.input,
          ...parsed.input,
        },
      });
    } catch (e) {
      console.error("Failed to parse saved UI state:", e);
    }
  }
}

// Save the current state to localStorage (but don't save forceCollapsed)
const persistState = () => {
  if (typeof window !== "undefined") {
    const currentState = uiState.get();
    const stateToPersist = {
      ...currentState,
      sidebar: {
        ...currentState.sidebar,
        forceCollapsed: false, // Don't persist forceCollapsed
      },
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToPersist));
  }
};

// Responsive breakpoint (768px = md breakpoint in Tailwind)
const MOBILE_BREAKPOINT = 768;

// Check if screen is mobile size
const isMobileSize = () => {
  if (typeof window === "undefined") return false;
  return window.innerWidth < MOBILE_BREAKPOINT;
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

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const isMobile = isMobileSize();
      const currentForceCollapsed = uiState.sidebar.forceCollapsed.get();

      if (isMobile && !currentForceCollapsed) {
        // Force collapse on mobile
        uiState.sidebar.forceCollapsed.set(true);
      } else if (!isMobile && currentForceCollapsed) {
        // Remove force collapse on desktop
        uiState.sidebar.forceCollapsed.set(false);
      }
    };

    // Check on mount
    handleResize();

    // Add resize listener
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Get the latest state directly from the observable
  const currentState = uiState.get();

  // Calculate if sidebar should be collapsed (either user preference or forced by screen size)
  const isSidebarCollapsed =
    currentState.sidebar.collapsed || currentState.sidebar.forceCollapsed;

  // Direct sidebar toggle function that works with the observable directly
  const toggleSidebar = () => {
    // Don't allow toggle if force collapsed (mobile)
    if (currentState.sidebar.forceCollapsed) {
      return;
    }

    const current = uiState.sidebar.collapsed.get();
    uiState.sidebar.collapsed.set(!current);
    persistState();
  };

  // Direct setter for sidebar collapsed state
  const setSidebarCollapsed = (collapsed: boolean) => {
    // Don't allow changing if force collapsed (mobile)
    if (currentState.sidebar.forceCollapsed) {
      return;
    }

    uiState.sidebar.collapsed.set(collapsed);
    persistState();
  };

  // Direct setter for input content state
  const setInputHasContent = (hasContent: boolean) => {
    uiState.input.hasContent.set(hasContent);
    // Don't persist input state as it's transient
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
    sidebarCollapsed: isSidebarCollapsed,
    isMobile: currentState.sidebar.forceCollapsed,
    toggleSidebar,
    setSidebarCollapsed,

    // Direct access to input state for convenience
    inputHasContent: currentState.input.hasContent,
    setInputHasContent,

    // Generic methods
    setUIState,
    toggleUIState,
  };
};
