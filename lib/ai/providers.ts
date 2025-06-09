import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

export type AIProvider = 'openai' | 'anthropic' | 'google';

export interface AIConfig {
  provider: AIProvider;
  model: string;
  apiKey: string;
}

export function createAIProvider(config: AIConfig) {
  switch (config.provider) {
    case 'openai':
      return createOpenAI({
        apiKey: config.apiKey,
      });
    case 'anthropic':
      return createAnthropic({
        apiKey: config.apiKey,
      });
    case 'google':
      return createGoogleGenerativeAI({
        apiKey: config.apiKey,
      });
    default:
      throw new Error(`Unsupported provider: ${config.provider}`);
  }
}

export const MODELS = {
  openai: [
    { id: 'gpt-4o', name: 'GPT-4o' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
  ],
  anthropic: [
    { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet' },
    { id: 'claude-3-haiku-20240307', name: 'Claude 3 Haiku' },
    { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus' },
  ],
  google: [
    { id: 'gemini-pro', name: 'Gemini Pro' },
    { id: 'gemini-pro-vision', name: 'Gemini Pro Vision' },
  ],
} as const;

export function getModelName(provider: AIProvider, modelId: string): string {
  const models = MODELS[provider];
  const model = models.find(m => m.id === modelId);
  return model?.name || modelId;
}