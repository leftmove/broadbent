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

export interface ModelConfig {
  name: string;
  id: string;
  description?: string;
}

// Model configurations based on Vercel AI SDK
export const providerModels: Record<AIProvider, ModelConfig[]> = {
  openai: [
    { name: "GPT-4o", id: "gpt-4o", description: "Most capable model" },
    { name: "GPT-4o mini", id: "gpt-4o-mini", description: "Faster and cheaper" },
    { name: "GPT-4 Turbo", id: "gpt-4-turbo", description: "Previous generation" },
    { name: "GPT-4", id: "gpt-4", description: "Original GPT-4" },
    { name: "GPT-3.5 Turbo", id: "gpt-3.5-turbo", description: "Fast and efficient" },
  ],
  anthropic: [
    { name: "Claude 3.5 Sonnet", id: "claude-3-5-sonnet-20241022", description: "Most capable" },
    { name: "Claude 3.5 Haiku", id: "claude-3-5-haiku-20241022", description: "Fast and efficient" },
    { name: "Claude 3 Opus", id: "claude-3-opus-20240229", description: "Most powerful" },
    { name: "Claude 3 Sonnet", id: "claude-3-sonnet-20240229", description: "Balanced performance" },
    { name: "Claude 3 Haiku", id: "claude-3-haiku-20240307", description: "Fastest" },
  ],
  google: [
    { name: "Gemini 1.5 Pro", id: "gemini-1.5-pro", description: "Most capable" },
    { name: "Gemini 1.5 Flash", id: "gemini-1.5-flash", description: "Fast and efficient" },
    { name: "Gemini Pro", id: "gemini-pro", description: "Previous generation" },
    { name: "Gemini Pro Vision", id: "gemini-pro-vision", description: "With vision capabilities" },
  ],
  grok: [
    { name: "Grok Beta", id: "grok-beta", description: "X.AI's conversational AI" },
    { name: "Grok 2", id: "grok-2", description: "Latest version" },
  ],
  openrouter: [
    { name: "GPT-4o", id: "openai/gpt-4o", description: "OpenAI's latest" },
    { name: "Claude 3.5 Sonnet", id: "anthropic/claude-3.5-sonnet", description: "Anthropic's best" },
    { name: "Llama 3.1 405B", id: "meta-llama/llama-3.1-405b-instruct", description: "Meta's largest" },
    { name: "Gemini Pro 1.5", id: "google/gemini-pro-1.5", description: "Google's advanced" },
    { name: "Mixtral 8x7B", id: "mistralai/mixtral-8x7b-instruct", description: "Mistral's mixture" },
  ],
};

// Get default model for each provider
export const getDefaultModel = (provider: AIProvider): string => {
  const models = providerModels[provider];
  return models?.[0]?.id || "";
};

// Get model display name
export const getModelName = (provider: AIProvider, modelId: string): string => {
  const models = providerModels[provider];
  return models?.find(m => m.id === modelId)?.name || modelId;
};