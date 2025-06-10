import { observable } from "@legendapp/state";
import { AIProvider, ApiKeys } from "lib/ai/types";
import { useEffect, useState } from "react";

interface SettingsState {
  apiKeys: ApiKeys;
  selectedProvider: AIProvider;
}

const settingsState = observable<SettingsState>({
  apiKeys: {
    openai: "",
    anthropic: "",
    google: "",
    grok: "",
    openrouter: "",
  },
  selectedProvider: "openai",
});

// Load from localStorage on initialization
if (typeof window !== "undefined") {
  const savedApiKeys = localStorage.getItem("broadbent-api-keys");
  const savedProvider = localStorage.getItem("broadbent-selected-provider");

  if (savedApiKeys) {
    try {
      const parsed = JSON.parse(savedApiKeys);
      settingsState.apiKeys.set(parsed);
    } catch (e) {
      console.error("Failed to parse saved API keys:", e);
    }
  }

  if (savedProvider) {
    settingsState.selectedProvider.set(savedProvider as AIProvider);
  }
}

export const useSettingsState = () => {
  const [apiKeys, setApiKeys] = useState<ApiKeys>(settingsState.apiKeys.get());
  const [selectedProvider, setSelectedProviderState] = useState<AIProvider>(
    settingsState.selectedProvider.get()
  );

  useEffect(() => {
    const unsubscribeApiKeys = settingsState.apiKeys.onChange(() => {
      setApiKeys(settingsState.apiKeys.get());
    });

    const unsubscribeProvider = settingsState.selectedProvider.onChange(() => {
      setSelectedProviderState(settingsState.selectedProvider.get());
    });

    return () => {
      unsubscribeApiKeys();
      unsubscribeProvider();
    };
  }, []);

  return {
    apiKeys,
    selectedProvider,
    setApiKey: (provider: keyof ApiKeys, key: string) => {
      settingsState.apiKeys[provider].set(key);
      // Save to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "broadbent-api-keys",
          JSON.stringify(settingsState.apiKeys.get())
        );
      }
    },
    setSelectedProvider: (provider: AIProvider) => {
      settingsState.selectedProvider.set(provider);
      localStorage.setItem("broadbent-selected-provider", provider);
    },
  };
};
