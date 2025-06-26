import { observable } from "@legendapp/state";
import { ToolProvider } from "lib/tools/types";
import {
  persistObservable,
  configureObservablePersistence,
} from "@legendapp/state/persist";
import { ObservablePersistLocalStorage } from "@legendapp/state/persist-plugins/local-storage";

// Configure persistence to use local storage
configureObservablePersistence({
  pluginLocal: ObservablePersistLocalStorage,
});

interface ToolsState {
  selectedTool: ToolProvider;
}

const DEFAULT_TOOLS_STATE: ToolsState = {
  selectedTool: "firecrawl",
};

export const toolsState$ = observable<ToolsState>(DEFAULT_TOOLS_STATE);

persistObservable(toolsState$, {
  local: "broadbent-tools",
});
