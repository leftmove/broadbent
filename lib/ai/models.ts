import { z } from "zod";

import { openai, anthropic, google, xai, groq } from "./spec";

export interface ModelYAML {
  provider: string;
  name: string;
  links: { name: string; link: string }[];
  models: any[]; // Use any for the raw YAML data
}

const ModelCapabilities = z.object({
  thinking: z.boolean(),
  tool: z.boolean(),
});

const ModelInput = z.object({
  text: z.boolean(),
  image: z.boolean(),
  audio: z.boolean().optional(),
  video: z.boolean().optional(),
});

const ModelOutput = z.object({
  text: z.boolean(),
  image: z.boolean().optional(),
  audio: z.boolean().optional(),
  video: z.boolean().optional(),
});
interface ModelContext {
  window?: number;
  output?: number;
  input?: number;
  unit?: string;
}

interface ModelConfig {
  name: string;
  id: string;
  description: string;
  capabilities: z.infer<typeof ModelCapabilities>;
  input: z.infer<typeof ModelInput>;
  output: z.infer<typeof ModelOutput>;
  context: ModelContext;
}

export interface OpenAIModel extends ModelConfig {
  provider: "openai";
}

export interface AnthropicModel extends ModelConfig {
  provider: "anthropic";
}

export interface GoogleModel extends ModelConfig {
  provider: "google";
}

export interface XAIModel extends ModelConfig {
  provider: "xai";
}

export interface GroqModel extends ModelConfig {
  provider: "groq";
}

type ProviderModel =
  | OpenAIModel
  | AnthropicModel
  | GoogleModel
  | XAIModel
  | GroqModel;

function fillOptions<T extends z.ZodObject<any>>(
  options: Record<string, boolean> = {},
  schema: T
): z.infer<T> {
  return options
    ? (Object.fromEntries(
        Object.keys(schema.shape).map((key) => [key, options[key] || false])
      ) as z.infer<T>)
    : (Object.fromEntries(
        Object.keys(schema.shape).map((key) => [key, false])
      ) as z.infer<T>);
}

function createProviderFromYAML<T extends ProviderModel>(
  data: ModelYAML
): Map<string, T> {
  const models = new Map(
    data.models.map((model: ModelConfig) => {
      try {
        const provider = data.provider;
        const name = model.name;
        const id = model.id;
        const description = model.description;

        const capabilities = fillOptions(model.capabilities, ModelCapabilities);
        const input = fillOptions(model.input, ModelInput);
        const output = fillOptions(model.output, ModelOutput);

        const window = model.context?.window || false;
        const contin = model.context?.output || false;
        const contout = model.context?.input || false;
        const context = {
          window: window || (contin || 0) + (contout || 0) || false,
          output: contout,
          input: contin,
          unit: model.context?.unit || "tokens",
        };

        return [
          model.id,
          {
            provider,
            name,
            id,
            description,
            capabilities,
            input,
            output,
            context,
          },
        ];
      } catch (error: any) {
        console.error(error, model.id);
        return [`_deprecated_${model.id}`, null];
      }
    })
  );

  // Set default model
  let defaultModelId: string;
  switch (data.provider) {
    case "openai":
      defaultModelId = OPENAI_DEFAULT_MODEL;
      break;
    case "anthropic":
      defaultModelId = ANTHROPIC_DEFAULT_MODEL;
      break;
    case "google":
      defaultModelId = GOOGLE_DEFAULT_MODEL;
      break;
    case "xai":
      defaultModelId = XAI_DEFAULT_MODEL;
      break;
    case "groq":
      defaultModelId = GROQ_DEFAULT_MODEL;
      break;
    default:
      throw new Error(`Unknown provider: ${data.provider}`);
  }

  const defaultModel = models.get(defaultModelId);
  if (defaultModel) {
    models.set("default", defaultModel);
  } else {
    console.error(
      `Default model not found: ${data.provider} ${defaultModelId}`
    );
  }

  return models as Map<string, T>;
}

export const OPENAI_DEFAULT_MODEL = "gpt-4o";
export const ANTHROPIC_DEFAULT_MODEL = "claude-3-5-sonnet";
export const GOOGLE_DEFAULT_MODEL = "gemini-1.5-flash";
export const XAI_DEFAULT_MODEL = "grok-2";
export const GROQ_DEFAULT_MODEL = "llama-3.1-8b-instant";

export const OpenAIProvider = createProviderFromYAML<OpenAIModel>(openai);
export const AnthropicProvider =
  createProviderFromYAML<AnthropicModel>(anthropic);
export const GoogleProvider = createProviderFromYAML<GoogleModel>(google);
export const XAIProvider = createProviderFromYAML<XAIModel>(xai);
export const GroqProvider = createProviderFromYAML<GroqModel>(groq);

export const OpenAIModels = [...OpenAIProvider.keys()];
export const AnthropicModels = [...AnthropicProvider.keys()];
export const GoogleModels = [...GoogleProvider.keys()];
export const XAIModels = [...XAIProvider.keys()];
export const GroqModels = [...GroqProvider.keys()];

export type OpenAIModelId = keyof typeof OpenAIProvider;
export type AnthropicModelId = keyof typeof AnthropicProvider;
export type GoogleModelId = keyof typeof GoogleProvider;
export type XAIModelId = keyof typeof XAIProvider;
export type GroqModelId = keyof typeof GroqProvider;

// The real type is a union of the above types.
export type ModelId = string;
