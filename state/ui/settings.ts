import { observable } from '@legendapp/state'

interface ApiKeys {
  openai: string
  anthropic: string
  google: string
}

interface SettingsState {
  apiKeys: ApiKeys
  selectedProvider: 'openai' | 'anthropic' | 'google'
}

const settingsState = observable<SettingsState>({
  apiKeys: {
    openai: '',
    anthropic: '',
    google: ''
  },
  selectedProvider: 'openai'
})

export const useSettingsState = () => ({
  apiKeys: settingsState.apiKeys.get(),
  selectedProvider: settingsState.selectedProvider.get(),
  setApiKey: (provider: keyof ApiKeys, key: string) => {
    settingsState.apiKeys[provider].set(key)
  },
  setSelectedProvider: (provider: 'openai' | 'anthropic' | 'google') => {
    settingsState.selectedProvider.set(provider)
  }
})
