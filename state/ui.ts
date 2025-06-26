"use client";

import { observable } from "@legendapp/state";
import {
  persistObservable,
  configureObservablePersistence,
} from "@legendapp/state/persist";
import { ObservablePersistLocalStorage } from "@legendapp/state/persist-plugins/local-storage";

// Configure persistence to use local storage
configureObservablePersistence({
  pluginLocal: ObservablePersistLocalStorage,
});

// --- STATE --- //

interface UIState {
  sidebar: {
    collapsed: boolean;
  };
  modals: {
    [key: string]: boolean;
  };
  input: {
    hasContent: boolean;
  };
  search: {
    enabled: boolean;
    isSearching: boolean;
  };
}

export const uiStore$ = observable<UIState>({
  sidebar: {
    collapsed: false,
  },
  modals: {},
  input: {
    hasContent: false,
  },
  search: {
    enabled: true,
    isSearching: false,
  },
});

// --- PERSISTENCE --- //

persistObservable(uiStore$, {
  local: "broadbent-ui-state",
  pluginLocal: ObservablePersistLocalStorage,
});
