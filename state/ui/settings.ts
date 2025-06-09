import { observable } from "@legendapp/state";
import { AIProvider, ApiKeys } from "lib/ai/types";

interface SettingsState {
  apiKeys: ApiKeys;
  selectedProvider: AIProvider;
}

const settingsState = observable<SettingsState>({
  apiKeys: {
    openai: "",
    anthropic: "",
    google: "",
  },
  selectedProvider: "openai",
});

export const useSettingsState = () => ({
  apiKeys: settingsState.apiKeys.get(),
  selectedProvider: settingsState.selectedProvider.get(),
  setApiKey: (provider: keyof ApiKeys, key: string) => {
    settingsState.apiKeys[provider].set(key);
  },
  setSelectedProvider: (provider: AIProvider) => {
    settingsState.selectedProvider.set(provider);
  },
});
