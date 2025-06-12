import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { xai } from "@ai-sdk/xai";
import { groq } from "@ai-sdk/groq";

import {
  OpenAIProvider,
  AnthropicProvider,
  GoogleProvider,
  XAIProvider,
  GroqProvider,
  OpenAIModel,
  AnthropicModel,
  GoogleModel,
  XAIModel,
  GroqModel,
} from "./models";

export type AIProvider = "openai" | "anthropic" | "google" | "xai" | "groq";
export type ModelId = (typeof availableModels)[number];
export type ProviderModel =
  | OpenAIModel
  | AnthropicModel
  | GoogleModel
  | XAIModel
  | GroqModel;

export interface ApiKeys {
  openai: string;
  anthropic: string;
  google: string;
  xai: string;
  groq: string;
}

type OpenAIModelId = Parameters<typeof openai>[0];
type AnthropicModelId = Parameters<typeof anthropic>[0];
type GoogleModelId = Parameters<typeof google>[0];
type XAIModelId = Parameters<typeof xai>[0];
type GroqModelId = Parameters<typeof groq>[0];

export const getProviderName = (provider: AIProvider): string => {
  switch (provider) {
    case "openai":
      return "OpenAI";
    case "anthropic":
      return "Anthropic";
    case "google":
      return "Google";
    case "xai":
      return "xAI";
    case "groq":
      return "Groq";
    default:
      return "Unknown";
  }
};

export const availableProviders = [
  "openai",
  "anthropic",
  "google",
  "xai",
  "groq",
] as const;

export const availableModels = [
  ...OpenAIProvider.keys(),
  ...AnthropicProvider.keys(),
  ...GoogleProvider.keys(),
  ...XAIProvider.keys(),
  ...GroqProvider.keys(),
];

export const providerModels: Record<
  AIProvider,
  | typeof OpenAIProvider
  | typeof AnthropicProvider
  | typeof GoogleProvider
  | typeof XAIProvider
  | typeof GroqProvider
> = {
  openai: OpenAIProvider,
  anthropic: AnthropicProvider,
  google: GoogleProvider,
  xai: XAIProvider,
  groq: GroqProvider,
};

export type {
  OpenAIModelId,
  AnthropicModelId,
  GoogleModelId,
  XAIModelId,
  GroqModelId,
};
