import { AIProvider } from "lib/ai/providers";

export const DEFAULT_ERROR_MESSAGE = () =>
  "Sorry, I couldn't generate a response due to an error.";

export const NO_API_KEY_SET_ERROR_MESSAGE = (provider: AIProvider) =>
  `No API key set for '${provider}'. Head to the API keys section in settings to learn how to set your API key.`;

export const INVALID_MODEL_ERROR_MESSAGE = (model: string) =>
  `Model '${model}' not found. Try again with a different model.`;

export const INVALID_PROVIDER_ERROR_MESSAGE = (model: string) =>
  `Provider '${model}' not found. Try again with a different provider.`;

export const GOOGLE_MODEL_NOT_FOUND_ERROR_MESSAGE = (model: string) =>
  `Model '${model}' not found. Request failed to Gemini API. Try again later or with a different model.`;

export const RATE_LIMIT_ERROR_MESSAGE = (provider: AIProvider) => `
## Rate 

Your API key has reached its usage limit. Please check your ${provider.toUpperCase()} account or wait before trying again.
`;

export const INVALID_API_KEY_ERROR_MESSAGE = (provider: AIProvider) => `
❌ **Invalid API Key**: The ${provider.toUpperCase()} API key appears to be invalid. Please check your Settings and update the key.
`;
