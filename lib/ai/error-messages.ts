import { AIProvider } from "lib/ai/types";

export const DEFAULT_ERROR_MESSAGE =
  "Sorry, I couldn't generate a response due to an error.";

export const getApiKeyMissingErrorMessage = (provider: AIProvider) => `
**API Key Required**: I need an API key to respond. Please go to Settings and add your ${provider.toUpperCase()} API key.

**How to get an API key:**
* **OpenAI**: Visit https://platform.openai.com/api-keys
* **Anthropic**: Visit https://console.anthropic.com/
* **Google**: Visit https://aistudio.google.com/app/apikey

Once you have your key, click the Settings button to add it.
`;

export const getRateLimitErrorMessage = (provider: AIProvider) => `
⚠️ **Rate Limit Exceeded**: Your API key has reached its usage limit. Please check your ${provider.toUpperCase()} account or wait before trying again.
`;

export const getInvalidApiKeyErrorMessage = (provider: AIProvider) => `
❌ **Invalid API Key**: The ${provider.toUpperCase()} API key appears to be invalid. Please check your Settings and update the key.
`;
