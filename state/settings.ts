import { observable } from "@legendapp/state";
import { AIProvider, ApiKeys, ModelId } from "lib/ai/providers";
import { useEffect, useState } from "react";

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
  },
  selectedProvider: "openai",
  selectedModel: "gpt-4o",
};

const STORAGE_KEYS = {
  API_KEYS: "broadbent-api-keys",
  PROVIDER: "broadbent-selected-provider",
  MODEL: "broadbent-selected-model",
} as const;

class SettingsStorage {
  static loadApiKeys(): ApiKeys {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.API_KEYS);
      return stored ? JSON.parse(stored) : DEFAULT_SETTINGS.apiKeys;
    } catch {
      return DEFAULT_SETTINGS.apiKeys;
    }
  }

  static loadProvider(): AIProvider {
    const stored = localStorage.getItem(STORAGE_KEYS.PROVIDER);
    return (stored as AIProvider) || DEFAULT_SETTINGS.selectedProvider;
  }

  static loadModel(): ModelId {
    const stored = localStorage.getItem(STORAGE_KEYS.MODEL);
    return stored || DEFAULT_SETTINGS.selectedModel;
  }

  static saveApiKeys(apiKeys: ApiKeys): void {
    localStorage.setItem(STORAGE_KEYS.API_KEYS, JSON.stringify(apiKeys));
  }

  static saveProvider(provider: AIProvider): void {
    localStorage.setItem(STORAGE_KEYS.PROVIDER, provider);
  }

  static saveModel(model: ModelId): void {
    localStorage.setItem(STORAGE_KEYS.MODEL, model);
  }

  static loadAll(): SettingsState {
    return {
      apiKeys: this.loadApiKeys(),
      selectedProvider: this.loadProvider(),
      selectedModel: this.loadModel(),
    };
  }
}

const settingsState = observable<SettingsState>(DEFAULT_SETTINGS);

// Initialize from localStorage on client side
if (typeof window !== "undefined") {
  settingsState.set(SettingsStorage.loadAll());
}

const SettingsActions = {
  setApiKey: (provider: keyof ApiKeys, key: string): void => {
    settingsState.apiKeys[provider].set(key);
    SettingsStorage.saveApiKeys(settingsState.apiKeys.get());
  },

  setSelectedProvider: (provider: AIProvider): void => {
    settingsState.selectedProvider.set(provider);
    SettingsStorage.saveProvider(provider);
  },

  setSelectedModel: (model: ModelId): void => {
    settingsState.selectedModel.set(model);
    SettingsStorage.saveModel(model);
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

export const useSettingsState = () => {
  const apiKeys = useStateSubscription(
    () => settingsState.apiKeys.get(),
    (callback) => settingsState.apiKeys.onChange(callback)
  );

  const selectedProvider = useStateSubscription(
    () => settingsState.selectedProvider.get(),
    (callback) => settingsState.selectedProvider.onChange(callback)
  );

  const selectedModel = useStateSubscription(
    () => settingsState.selectedModel.get(),
    (callback) => settingsState.selectedModel.onChange(callback)
  );

  return {
    apiKeys,
    selectedProvider,
    selectedModel,
    setApiKey: SettingsActions.setApiKey,
    setSelectedProvider: SettingsActions.setSelectedProvider,
    setSelectedModel: SettingsActions.setSelectedModel,
  };
};
