import { observable } from "@legendapp/state";
import { AIProvider, ApiKeys, ModelId } from "lib/ai/providers";
import { useEffect, useState } from "react";

interface SettingsState {
  apiKeys: ApiKeys;
  selectedProvider: AIProvider;
  selectedModel: ModelId;
}

const settingsState = observable<SettingsState>({
  apiKeys: {
    openai: "",
    anthropic: "",
    google: "",
    xai: "",
    groq: "",
  },
  selectedProvider: "openai",
  selectedModel: "gpt-4o",
});

try {
  const savedApiKeys = localStorage.getItem("broadbent-api-keys") || "{}";
  const savedProvider =
    localStorage.getItem("broadbent-selected-provider") || "";
  const savedModel = localStorage.getItem("broadbent-selected-model") || "";

  const parsed = JSON.parse(savedApiKeys);
  if (parsed) settingsState.apiKeys.set(parsed);
  if (savedProvider)
    settingsState.selectedProvider.set(savedProvider as AIProvider);
  if (savedModel) settingsState.selectedModel.set(savedModel);
} catch {
  console.error("Failed to save settings");
}

export const useSettingsState = () => {
  const [apiKeys, setApiKeys] = useState<ApiKeys>(settingsState.apiKeys.get());
  const [selectedProvider, setSelectedProviderState] = useState<AIProvider>(
    settingsState.selectedProvider.get()
  );
  const [selectedModel, setSelectedModel] = useState<ModelId>(
    settingsState.selectedModel.get()
  );

  useEffect(() => {
    const unsubscribeApiKeys = settingsState.apiKeys.onChange(() => {
      setApiKeys(settingsState.apiKeys.get());
    });

    const unsubscribeProvider = settingsState.selectedProvider.onChange(() => {
      setSelectedProviderState(settingsState.selectedProvider.get());
    });

    const unsubscribeModel = settingsState.selectedModel.onChange(() => {
      setSelectedModel(settingsState.selectedModel.get());
    });

    return () => {
      unsubscribeApiKeys();
      unsubscribeProvider();
      unsubscribeModel();
    };
  }, []);

  return {
    apiKeys,
    selectedProvider,
    selectedModel,
    setApiKey: (provider: keyof ApiKeys, key: string) => {
      settingsState.apiKeys[provider].set(key);
      localStorage.setItem(
        "broadbent-api-keys",
        JSON.stringify(settingsState.apiKeys.get())
      );
    },
    setSelectedProvider: (provider: AIProvider) => {
      settingsState.selectedProvider.set(provider);
      localStorage.setItem("broadbent-selected-provider", provider);
    },
    setSelectedModel: (model: ModelId) => {
      settingsState.selectedModel.set(model);
      localStorage.setItem("broadbent-selected-model", model);
    },
  };
};
