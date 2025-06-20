import { observable } from "@legendapp/state";
import { ToolProvider } from "lib/tools/types";
import { useEffect, useState } from "react";

interface ToolsState {
  selectedTool: ToolProvider;
}

const DEFAULT_TOOLS_STATE: ToolsState = {
  selectedTool: "firecrawl",
};

const STORAGE_KEYS = {
  SELECTED_TOOL: "broadbent-selected-tool",
} as const;

class ToolsStorage {
  static loadSelectedTool(): ToolProvider {
    const stored = localStorage.getItem(STORAGE_KEYS.SELECTED_TOOL);
    return (stored as ToolProvider) || DEFAULT_TOOLS_STATE.selectedTool;
  }

  static saveSelectedTool(tool: ToolProvider): void {
    localStorage.setItem(STORAGE_KEYS.SELECTED_TOOL, tool);
  }

  static loadAll(): ToolsState {
    return {
      selectedTool: this.loadSelectedTool(),
    };
  }
}

const toolsState = observable<ToolsState>(DEFAULT_TOOLS_STATE);

// Initialize from localStorage on client side
if (typeof window !== "undefined") {
  toolsState.set(ToolsStorage.loadAll());
}

const ToolsActions = {
  setSelectedTool: (tool: ToolProvider): void => {
    toolsState.selectedTool.set(tool);
    ToolsStorage.saveSelectedTool(tool);
  },
};

const useStateSubscription = <T>(
  getter: () => T,
  onChange: (callback: () => void) => () => void
): T => {
  const [state, setState] = useState<T>(getter);

  useEffect(() => {
    const unsubscribe = onChange(() => setState(getter));
    return unsubscribe;
  }, [getter, onChange]);

  return state;
};

export const useToolsState = () => {
  const selectedTool = useStateSubscription(
    () => toolsState.selectedTool.get(),
    (callback) => toolsState.selectedTool.onChange(callback)
  );

  return {
    selectedTool,
    setSelectedTool: ToolsActions.setSelectedTool,
  };
};