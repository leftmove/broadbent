import { observable } from "@legendapp/state";
import { AIProvider, ApiKeys, ModelId } from "lib/ai/providers";
import {
  persistObservable,
  configureObservablePersistence,
} from "@legendapp/state/persist";
import { ObservablePersistLocalStorage } from "@legendapp/state/persist-plugins/local-storage";

// Configure persistence to use local storage
configureObservablePersistence({
  pluginLocal: ObservablePersistLocalStorage,
});

interface SettingsState {
  apiKeys: ApiKeys;
  selectedProvider: AIProvider;
  selectedModel: ModelId;
}

const DEFAULT_SETTINGS: SettingsState = {
  apiKeys: {
    openai: "",
    anthropic: "",
    google: "",
    xai: "",
    groq: "",
    firecrawl: "",
  },
  selectedProvider: "openai",
  selectedModel: "gpt-4o",
};

export const settingsState$ = observable<SettingsState>(DEFAULT_SETTINGS);

persistObservable(settingsState$, {
  local: "broadbent-settings",
});