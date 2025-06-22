import { InvalidProviderError } from "../errors";
import { openai, anthropic, google, xai, groq } from "./spec";
import {
  Model,
  type ModelId,
  type AIProvider as ModelAIProvider,
} from "./models";

export type AIProvider = ModelAIProvider;
export type { ModelId } from "./models";
export type AIProviderName = "OpenAI" | "Anthropic" | "Google" | "xAI" | "Groq";

export type ApiKeys = Record<AIProvider, string>;

export type Message = {
  role: "user" | "assistant" | "system";
  content: string;
  usage?: {
    prompt?: number;
    completion?: number;
    total?: number;
  };
};

export class Provider {
  id: AIProvider;
  name: AIProviderName;

  models: Model[] = [];

  constructor(id: AIProvider) {
    this.id = id;
    switch (id) {
      case "openai":
        this.name = "OpenAI";
        this.models = openai.models.map((m: any) => new Model(m, "openai"));
        break;
      case "anthropic":
        this.name = "Anthropic";
        this.models = anthropic.models.map(
          (m: any) => new Model(m, "anthropic")
        );
        break;
      case "google":
        this.name = "Google";
        this.models = google.models.map((m: any) => new Model(m, "google"));
        break;
      case "xai":
        this.name = "xAI";
        this.models = xai.models.map((m: any) => new Model(m, "xai"));
        break;
      case "groq":
        this.name = "Groq";
        this.models = groq.models.map((m: any) => new Model(m, "groq"));
        break;
      default:
        throw new InvalidProviderError("Invalid provider.");
    }
  }
}

export class AICollection {
  providers: Provider[] = [];

  constructor() {
    this.providers = [
      new Provider("openai"),
      new Provider("anthropic"),
      new Provider("google"),
      new Provider("xai"),
      new Provider("groq"),
    ];
  }

  provider(id: AIProvider): Provider {
    return this.providers.find((p) => p.id === id)!;
  }

  model(id: ModelId): Model {
    return this.providers.flatMap((p) => p.models).find((m) => m.id === id)!;
  }
}

export const llms = new AICollection();
