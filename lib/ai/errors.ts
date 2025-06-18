import { AIProvider, llms } from "lib/ai/providers";

export const DEFAULT_ERROR_MESSAGE = () =>
  "Sorry, I couldn't generate a response due to an error.";

export const NO_API_KEY_SET = (provider?: AIProvider) =>
  `No API key set for '${provider ? llms.provider(provider).name : "unknown"}'. Head to the API keys section in settings to learn how to set your API key.`;

export const INVALID_MODEL = (model?: string) =>
  `Model '${model ? model : "unknown"}' not found. Try again with a different model.`;

export const INVALID_LOCATION = () =>
  "The request was sent from an invalid location. This is likely a problem with the server.";

export const INVALID_PROVIDER = (model?: string) =>
  `Provider '${model ? model : "unknown"}' not found. Try again with a different provider.`;

export const GOOGLE_MODEL_NOT_FOUND = (model?: string) =>
  `Model '${model ? model : "unknown"}' not found. Request failed to Gemini API. Try again later or with a different model.`;

export const GOOGLE_RATE_LIMIT = () =>
  `Gemini rate limit exceeded. You've reached the request limit for the Gemini API. Please wait a few minutes before trying again, or consider upgrading your API quota.`;

export const RATE_LIMIT = (provider?: AIProvider) =>
  `Rate limit exceeded. Your API key has reached its usage limit. Please check your '${provider ? llms.provider(provider).name : "unknown"}' account to check your limits or wait before trying again.`;

export const INVALID_API_KEY = (provider?: AIProvider) =>
  `Invalid API Key. The '${provider ? llms.provider(provider).name : "unknown"}' API key appears to be invalid. Please check your Settings and update the key.`;
