import { merge } from "lodash";

import { openai, anthropic, google, xai, groq } from "./spec";

export type AIProvider = "openai" | "anthropic" | "google" | "xai" | "groq";

export const OPENAI_DEFAULT_MODEL = "gpt-4o";
export const ANTHROPIC_DEFAULT_MODEL = "claude-3-5-sonnet";
export const GOOGLE_DEFAULT_MODEL = "gemini-1.5-flash";
export const XAI_DEFAULT_MODEL = "grok-2";
export const GROQ_DEFAULT_MODEL = "llama-3.1-8b-instant";

export type OpenAIModelId = (typeof openai.models)[number]["id"];
export type AnthropicModelId = (typeof anthropic.models)[number]["id"];
export type GoogleModelId = (typeof google.models)[number]["id"];
export type XAIModelId = (typeof xai.models)[number]["id"];
export type GroqModelId = (typeof groq.models)[number]["id"];
export type ModelId =
  | OpenAIModelId
  | AnthropicModelId
  | GoogleModelId
  | XAIModelId
  | GroqModelId;

export type OpenAIModelName = (typeof openai.models)[number]["name"];
export type AnthropicModelName = (typeof anthropic.models)[number]["name"];
export type GoogleModelName = (typeof google.models)[number]["name"];
export type XAIModelName = (typeof xai.models)[number]["name"];
export type GroqModelName = (typeof groq.models)[number]["name"];
export type ModelName =
  | OpenAIModelName
  | AnthropicModelName
  | GoogleModelName
  | XAIModelName
  | GroqModelName;

export type ModelInferred =
  | (typeof openai.models)[number]
  | (typeof anthropic.models)[number]
  | (typeof google.models)[number]
  | (typeof xai.models)[number]
  | (typeof groq.models)[number];

export class Model {
  id: ModelId;
  name: ModelName;
  description: string;
  provider: AIProvider;
  capabilities: {
    thinking: boolean;
    tool: boolean;
  };
  input: {
    text: boolean;
    image: boolean;
    audio: boolean;
    video: boolean;
  };
  output: {
    text: boolean;
    image: boolean;
    audio: boolean;
    video: boolean;
  };
  context: {
    window: number;
    output: number;
    input: number;
    unit: string;
  };

  constructor(model: ModelInferred, provider: AIProvider) {
    this.id = model.id;
    this.name = model.name;
    this.description = model.description;
    this.provider = provider;

    this.capabilities = merge(
      {},
      {
        thinking: false,
        tool: false,
      },
      "capabilities" in model ? model.capabilities : {}
    );
    this.input = merge(
      {},
      {
        text: false,
        image: false,
        audio: false,
        video: false,
      },
      "input" in model ? model.input : {}
    );
    this.output = merge(
      {},
      {
        text: false,
        image: false,
        audio: false,
        video: false,
      },
      "output" in model ? model.output : {}
    );
    this.context = merge(
      {},
      {
        window: 200_000,
        output: 0,
        input: 0,
        unit: "tokens",
      },
      "context" in model ? model.context : {}
    );
  }
}
