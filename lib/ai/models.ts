import { z } from "zod";

import { openai, anthropic, google, xai, groq } from "./spec";

export interface ModelYAML {
  provider: string;
  name: string;
  links: { name: string; link: string }[];
  models: any[]; // Use any for the raw YAML data
}

// Taken directly from Vercel's AI SDK type
export const OPENAI_MODEL_IDS = [
  "o1",
  "o1-2024-12-17",
  "o1-mini",
  "o1-mini-2024-09-12",
  "o1-preview",
  "o1-preview-2024-09-12",
  "o3-mini",
  "o3-mini-2025-01-31",
  "o3",
  "o3-2025-04-16",
  "o4-mini",
  "o4-mini-2025-04-16",
  "gpt-4.1",
  "gpt-4.1-2025-04-14",
  "gpt-4.1-mini",
  "gpt-4.1-mini-2025-04-14",
  "gpt-4.1-nano",
  "gpt-4.1-nano-2025-04-14",
  "gpt-4o",
  "gpt-4o-2024-05-13",
  "gpt-4o-2024-08-06",
  "gpt-4o-2024-11-20",
  "gpt-4o-audio-preview",
  "gpt-4o-audio-preview-2024-10-01",
  "gpt-4o-audio-preview-2024-12-17",
  "gpt-4o-search-preview",
  "gpt-4o-search-preview-2025-03-11",
  "gpt-4o-mini-search-preview",
  "gpt-4o-mini-search-preview-2025-03-11",
  "gpt-4o-mini",
  "gpt-4o-mini-2024-07-18",
  "gpt-4-turbo",
  "gpt-4-turbo-2024-04-09",
  "gpt-4-turbo-preview",
  "gpt-4-0125-preview",
  "gpt-4-1106-preview",
  "gpt-4",
  "gpt-4-0613",
  "gpt-4.5-preview",
  "gpt-4.5-preview-2025-02-27",
  "gpt-3.5-turbo-0125",
  "gpt-3.5-turbo",
  "gpt-3.5-turbo-1106",
  "chatgpt-4o-latest",
];
export const ANTHROPIC_MODEL_IDS = [
  "claude-4-opus-20250514",
  "claude-4-sonnet-20250514",
  "claude-3-7-sonnet-20250219",
  "claude-3-5-sonnet-latest",
  "claude-3-5-sonnet-20241022",
  "claude-3-5-sonnet-20240620",
  "claude-3-5-haiku-latest",
  "claude-3-5-haiku-20241022",
  "claude-3-opus-latest",
  "claude-3-opus-20240229",
  "claude-3-sonnet-20240229",
  "claude-3-haiku-20240307",
];
export const GOOGLE_MODEL_IDS = [
  "gemini-1.5-flash",
  "gemini-1.5-flash-latest",
  "gemini-1.5-flash-001",
  "gemini-1.5-flash-002",
  "gemini-1.5-flash-8b",
  "gemini-1.5-flash-8b-latest",
  "gemini-1.5-flash-8b-001",
  "gemini-1.5-pro",
  "gemini-1.5-pro-latest",
  "gemini-1.5-pro-001",
  "gemini-1.5-pro-002",
  "gemini-2.0-flash",
  "gemini-2.0-flash-001",
  "gemini-2.0-flash-live-001",
  "gemini-2.0-flash-lite",
  "gemini-2.0-pro-exp-02-05",
  "gemini-2.0-flash-thinking-exp-01-21",
  "gemini-2.0-flash-exp",
  "gemini-2.5-pro-exp-03-25",
  "gemini-2.5-pro-preview-05-06",
  "gemini-2.5-flash-preview-04-17",
  "gemini-exp-1206",
  "gemma-3-27b-it",
  "learnlm-1.5-pro-experimental",
];
export const XAI_MODEL_IDS = [
  "grok-3",
  "grok-3-latest",
  "grok-3-fast",
  "grok-3-fast-latest",
  "grok-3-mini",
  "grok-3-mini-latest",
  "grok-3-mini-fast",
  "grok-3-mini-fast-latest",
  "grok-2-vision-1212",
  "grok-2-vision",
  "grok-2-vision-latest",
  "grok-2-image-1212",
  "grok-2-image",
  "grok-2-image-latest",
  "grok-2-1212",
  "grok-2",
  "grok-2-latest",
  "grok-vision-beta",
  "grok-beta",
];
export const GROQ_MODEL_IDS = [
  "gemma2-9b-it",
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant",
  "llama-guard-3-8b",
  "llama3-70b-8192",
  "llama3-8b-8192",
  "mixtral-8x7b-32768",
  "meta-llama/llama-4-scout-17b-16e-instruct",
  "qwen-qwq-32b",
  "mistral-saba-24b",
  "qwen-2.5-32b",
  "deepseek-r1-distill-qwen-32b",
  "deepseek-r1-distill-llama-70b",
];

export const OPENAI_DEFAULT_MODEL = "gpt-4o";
export const ANTHROPIC_DEFAULT_MODEL = "claude-3-5-sonnet";
export const GOOGLE_DEFAULT_MODEL = "gemini-1.5-flash";
export const XAI_DEFAULT_MODEL = "grok-2";
export const GROQ_DEFAULT_MODEL = "llama-3.1-8b-instant";

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
      console.log("anthropic");
      defaultModelId = ANTHROPIC_DEFAULT_MODEL;
      break;
    case "google":
      defaultModelId = GOOGLE_DEFAULT_MODEL;
      break;
    case "xai":
      defaultModelId = XAI_DEFAULT_MODEL;
      console.log(models);
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

export const OpenAIProvider = createProviderFromYAML<OpenAIModel>(openai);
export const AnthropicProvider =
  createProviderFromYAML<AnthropicModel>(anthropic);
export const GoogleProvider = createProviderFromYAML<GoogleModel>(google);
export const XAIProvider = createProviderFromYAML<XAIModel>(xai);
export const GroqProvider = createProviderFromYAML<GroqModel>(groq);
