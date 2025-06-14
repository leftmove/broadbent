import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { xai } from "@ai-sdk/xai";
import { groq } from "@ai-sdk/groq";

import { InvalidProviderError } from "lib/errors";

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

export type ProviderModel =
  | OpenAIModel
  | AnthropicModel
  | GoogleModel
  | XAIModel
  | GroqModel;

export type ApiKeys = Record<AIProvider, string>;

type OpenAIModelId = Parameters<typeof openai>[0];
type AnthropicModelId = Parameters<typeof anthropic>[0];
type GoogleModelId = Parameters<typeof google>[0];
type XAIModelId = Parameters<typeof xai>[0];
type GroqModelId = Parameters<typeof groq>[0];

export type AIProvider = "openai" | "anthropic" | "google" | "xai" | "groq";
export type AIProviderName = "OpenAI" | "Anthropic" | "Google" | "xAI" | "Groq";

class Provider {
  id: AIProvider;
  name: AIProviderName;

  constructor(id: AIProvider, name: AIProviderName) {
    this.id = id;

    switch (id) {
      case "openai":
        this.name = "OpenAI";
        break;
      case "anthropic":
        this.name = "Anthropic";
        break;
      case "google":
        this.name = "Google";
        break;
      case "xai":
        this.name = "xAI";
        break;
      case "groq":
        this.name = "Groq";
        break;
      default:
        throw new InvalidProviderError("Invalid provider.", id);
    }
  }
}

export type {
  OpenAIModelId,
  AnthropicModelId,
  GoogleModelId,
  XAIModelId,
  GroqModelId,
};
