import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";

export type AIProvider =
  | "openai"
  | "anthropic"
  | "google"
  | "grok"
  | "openrouter";

export interface ApiKeys {
  openai: string;
  anthropic: string;
  google: string;
  grok: string;
  openrouter: string;
}

// Extract model ID types from AI SDK providers
type OpenAIModelId = Parameters<typeof openai>[0];
type AnthropicModelId = Parameters<typeof anthropic>[0];
type GoogleModelId = Parameters<typeof google>[0];

// Define supported model IDs as const tuples for strict typing
const OPENAI_MODEL_IDS = [
  "gpt-4o",
  "gpt-4o-mini",
  "gpt-4-turbo",
  "gpt-4",
  "gpt-3.5-turbo",
] as const;

const ANTHROPIC_MODEL_IDS = [
  "claude-3-5-sonnet-20241022",
  "claude-3-5-haiku-20241022",
  "claude-3-opus-20240229",
  "claude-3-sonnet-20240229",
  "claude-3-haiku-20240307",
] as const;

const GOOGLE_MODEL_IDS = [
  "gemini-1.5-flash",
  "gemini-1.5-pro",
  "gemini-pro",
  "gemini-pro-vision",
] as const;

const GROK_MODEL_IDS = ["grok-beta", "grok-2"] as const;

const OPENROUTER_MODEL_IDS = [
  "openai/gpt-4o",
  "anthropic/claude-3.5-sonnet",
  "meta-llama/llama-3.1-405b-instruct",
  "google/gemini-pro-1.5",
  "mistralai/mixtral-8x7b-instruct",
] as const;

// Create union types from the const tuples
type SupportedOpenAIModelId = (typeof OPENAI_MODEL_IDS)[number];
type SupportedAnthropicModelId = (typeof ANTHROPIC_MODEL_IDS)[number];
type SupportedGoogleModelId = (typeof GOOGLE_MODEL_IDS)[number];
type SupportedGrokModelId = (typeof GROK_MODEL_IDS)[number];
type SupportedOpenRouterModelId = (typeof OPENROUTER_MODEL_IDS)[number];

// Model capabilities interface
interface ModelCapabilities {
  thinking: boolean;
  image: boolean;
  tool: boolean;
  streaming: boolean;
  contextWindow: number;
}

// Model configuration interface
export interface ModelConfig {
  name: string;
  id: string;
  description?: string;
  capabilities: ModelCapabilities;
}

// Model capabilities mappings
const OPENAI_CAPABILITIES: Record<SupportedOpenAIModelId, ModelCapabilities> = {
  "gpt-4o": {
    thinking: false,
    image: true,
    tool: true,
    streaming: true,
    contextWindow: 128000,
  },
  "gpt-4o-mini": {
    thinking: false,
    image: true,
    tool: true,
    streaming: true,
    contextWindow: 128000,
  },
  "gpt-4-turbo": {
    thinking: false,
    image: true,
    tool: true,
    streaming: true,
    contextWindow: 128000,
  },
  "gpt-4": {
    thinking: false,
    image: false,
    tool: true,
    streaming: true,
    contextWindow: 8192,
  },
  "gpt-3.5-turbo": {
    thinking: false,
    image: false,
    tool: true,
    streaming: true,
    contextWindow: 16385,
  },
};

const ANTHROPIC_CAPABILITIES: Record<
  SupportedAnthropicModelId,
  ModelCapabilities
> = {
  "claude-3-5-sonnet-20241022": {
    thinking: true,
    image: true,
    tool: true,
    streaming: true,
    contextWindow: 200000,
  },
  "claude-3-5-haiku-20241022": {
    thinking: false,
    image: true,
    tool: true,
    streaming: true,
    contextWindow: 200000,
  },
  "claude-3-opus-20240229": {
    thinking: false,
    image: true,
    tool: true,
    streaming: true,
    contextWindow: 200000,
  },
  "claude-3-sonnet-20240229": {
    thinking: false,
    image: true,
    tool: true,
    streaming: true,
    contextWindow: 200000,
  },
  "claude-3-haiku-20240307": {
    thinking: false,
    image: true,
    tool: true,
    streaming: true,
    contextWindow: 200000,
  },
};

const GOOGLE_CAPABILITIES: Record<SupportedGoogleModelId, ModelCapabilities> = {
  "gemini-1.5-pro": {
    thinking: false,
    image: true,
    tool: true,
    streaming: true,
    contextWindow: 2000000,
  },
  "gemini-1.5-flash": {
    thinking: false,
    image: true,
    tool: true,
    streaming: true,
    contextWindow: 1000000,
  },
  "gemini-pro": {
    thinking: false,
    image: false,
    tool: true,
    streaming: true,
    contextWindow: 32768,
  },
  "gemini-pro-vision": {
    thinking: false,
    image: true,
    tool: false,
    streaming: true,
    contextWindow: 16384,
  },
};

const GROK_CAPABILITIES: Record<SupportedGrokModelId, ModelCapabilities> = {
  "grok-beta": {
    thinking: false,
    image: false,
    tool: true,
    streaming: true,
    contextWindow: 131072,
  },
  "grok-2": {
    thinking: false,
    image: true,
    tool: true,
    streaming: true,
    contextWindow: 131072,
  },
};

const OPENROUTER_CAPABILITIES: Record<
  SupportedOpenRouterModelId,
  ModelCapabilities
> = {
  "openai/gpt-4o": {
    thinking: false,
    image: true,
    tool: true,
    streaming: true,
    contextWindow: 128000,
  },
  "anthropic/claude-3.5-sonnet": {
    thinking: true,
    image: true,
    tool: true,
    streaming: true,
    contextWindow: 200000,
  },
  "meta-llama/llama-3.1-405b-instruct": {
    thinking: false,
    image: false,
    tool: true,
    streaming: true,
    contextWindow: 131072,
  },
  "google/gemini-pro-1.5": {
    thinking: false,
    image: true,
    tool: true,
    streaming: true,
    contextWindow: 2000000,
  },
  "mistralai/mixtral-8x7b-instruct": {
    thinking: false,
    image: false,
    tool: true,
    streaming: true,
    contextWindow: 32768,
  },
};

// Provider model configurations
export const providerModels: Record<AIProvider, ModelConfig[]> = {
  openai: OPENAI_MODEL_IDS.map((id) => ({
    name: getOpenAIModelName(id),
    id,
    description: getOpenAIModelDescription(id),
    capabilities: OPENAI_CAPABILITIES[id],
  })),
  anthropic: ANTHROPIC_MODEL_IDS.map((id) => ({
    name: getAnthropicModelName(id),
    id,
    description: getAnthropicModelDescription(id),
    capabilities: ANTHROPIC_CAPABILITIES[id],
  })),
  google: GOOGLE_MODEL_IDS.map((id) => ({
    name: getGoogleModelName(id),
    id,
    description: getGoogleModelDescription(id),
    capabilities: GOOGLE_CAPABILITIES[id],
  })),
  grok: GROK_MODEL_IDS.map((id) => ({
    name: getGrokModelName(id),
    id,
    description: getGrokModelDescription(id),
    capabilities: GROK_CAPABILITIES[id],
  })),
  openrouter: OPENROUTER_MODEL_IDS.map((id) => ({
    name: getOpenRouterModelName(id),
    id,
    description: getOpenRouterModelDescription(id),
    capabilities: OPENROUTER_CAPABILITIES[id],
  })),
};

// Helper functions for model names and descriptions
function getOpenAIModelName(id: SupportedOpenAIModelId): string {
  const names: Record<SupportedOpenAIModelId, string> = {
    "gpt-4o": "GPT-4o",
    "gpt-4o-mini": "GPT-4o mini",
    "gpt-4-turbo": "GPT-4 Turbo",
    "gpt-4": "GPT-4",
    "gpt-3.5-turbo": "GPT-3.5 Turbo",
  };
  return names[id];
}

function getOpenAIModelDescription(id: SupportedOpenAIModelId): string {
  const descriptions: Record<SupportedOpenAIModelId, string> = {
    "gpt-4o": "Most capable model with vision",
    "gpt-4o-mini": "Faster and more affordable",
    "gpt-4-turbo": "Previous generation flagship",
    "gpt-4": "Original GPT-4 model",
    "gpt-3.5-turbo": "Fast and efficient",
  };
  return descriptions[id];
}

function getAnthropicModelName(id: SupportedAnthropicModelId): string {
  const names: Record<SupportedAnthropicModelId, string> = {
    "claude-3-5-sonnet-20241022": "Claude 3.5 Sonnet",
    "claude-3-5-haiku-20241022": "Claude 3.5 Haiku",
    "claude-3-opus-20240229": "Claude 3 Opus",
    "claude-3-sonnet-20240229": "Claude 3 Sonnet",
    "claude-3-haiku-20240307": "Claude 3 Haiku",
  };
  return names[id];
}

function getAnthropicModelDescription(id: SupportedAnthropicModelId): string {
  const descriptions: Record<SupportedAnthropicModelId, string> = {
    "claude-3-5-sonnet-20241022": "Most capable with thinking",
    "claude-3-5-haiku-20241022": "Fast and efficient",
    "claude-3-opus-20240229": "Most powerful previous gen",
    "claude-3-sonnet-20240229": "Balanced performance",
    "claude-3-haiku-20240307": "Fastest response times",
  };
  return descriptions[id];
}

function getGoogleModelName(id: SupportedGoogleModelId): string {
  const names: Record<SupportedGoogleModelId, string> = {
    "gemini-1.5-pro": "Gemini 1.5 Pro",
    "gemini-1.5-flash": "Gemini 1.5 Flash",
    "gemini-pro": "Gemini Pro",
    "gemini-pro-vision": "Gemini Pro Vision",
  };
  return names[id];
}

function getGoogleModelDescription(id: SupportedGoogleModelId): string {
  const descriptions: Record<SupportedGoogleModelId, string> = {
    "gemini-1.5-pro": "Most capable with 2M context",
    "gemini-1.5-flash": "Fast with 1M context",
    "gemini-pro": "Previous generation",
    "gemini-pro-vision": "With vision capabilities",
  };
  return descriptions[id];
}

function getGrokModelName(id: SupportedGrokModelId): string {
  const names: Record<SupportedGrokModelId, string> = {
    "grok-beta": "Grok Beta",
    "grok-2": "Grok 2",
  };
  return names[id];
}

function getGrokModelDescription(id: SupportedGrokModelId): string {
  const descriptions: Record<SupportedGrokModelId, string> = {
    "grok-beta": "X.AI conversational AI",
    "grok-2": "Latest with vision support",
  };
  return descriptions[id];
}

function getOpenRouterModelName(id: SupportedOpenRouterModelId): string {
  const names: Record<SupportedOpenRouterModelId, string> = {
    "openai/gpt-4o": "GPT-4o",
    "anthropic/claude-3.5-sonnet": "Claude 3.5 Sonnet",
    "meta-llama/llama-3.1-405b-instruct": "Llama 3.1 405B",
    "google/gemini-pro-1.5": "Gemini Pro 1.5",
    "mistralai/mixtral-8x7b-instruct": "Mixtral 8x7B",
  };
  return names[id];
}

function getOpenRouterModelDescription(id: SupportedOpenRouterModelId): string {
  const descriptions: Record<SupportedOpenRouterModelId, string> = {
    "openai/gpt-4o": "OpenAI flagship via OpenRouter",
    "anthropic/claude-3.5-sonnet": "Anthropic best via OpenRouter",
    "meta-llama/llama-3.1-405b-instruct": "Meta largest open model",
    "google/gemini-pro-1.5": "Google advanced via OpenRouter",
    "mistralai/mixtral-8x7b-instruct": "Mistral mixture of experts",
  };
  return descriptions[id];
}

// Utility functions
export const getDefaultModel = (provider: AIProvider): string => {
  const models = providerModels[provider];
  return models?.[0]?.id || "";
};

export const getModelName = (provider: AIProvider, modelId: string): string => {
  const models = providerModels[provider];
  return models?.find((m) => m.id === modelId)?.name || modelId;
};

export const getModelCapabilities = (
  provider: AIProvider,
  modelId: string
): ModelCapabilities | null => {
  const models = providerModels[provider];
  return models?.find((m) => m.id === modelId)?.capabilities || null;
};

// Type guards for runtime validation
export const isValidModelId = (
  provider: AIProvider,
  modelId: string
): boolean => {
  const models = providerModels[provider];
  return models?.some((m) => m.id === modelId) || false;
};

// Export model ID types for external use
export type {
  OpenAIModelId,
  AnthropicModelId,
  GoogleModelId,
  SupportedOpenAIModelId,
  SupportedAnthropicModelId,
  SupportedGoogleModelId,
  SupportedGrokModelId,
  SupportedOpenRouterModelId,
};
