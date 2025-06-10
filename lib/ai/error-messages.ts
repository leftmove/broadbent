import { AIProvider } from "lib/ai/types";

export const DEFAULT_ERROR_MESSAGE =
  "Sorry, I couldn't generate a response due to an error.";

export const getApiKeyMissingErrorMessage = (provider: AIProvider) => `
It looks like you don't have an API key set for this model yet.

If you're new here, before you can use the chat, you need to get an API key from one of several providers. Here are some possible options.

* **[OpenAI](https://platform.openai.com/api-keys)**: ChatGPT.
* **[Anthropic](https://console.anthropic.com/)**: Claude.
* **[Google](https://aistudio.google.com/app/apikey)**: Gemini.
* **[xAI](https://console.x.ai)**: Grok.

Click the provider's name to go to their API key page. Once your there, if you've setup an account, you can setup billing and get an API key.

With your API key setup, click the settings button in the bottom left and navigate to *Settings > API Keys* and add your key to the provider you chose. You can then set that provider as your default by clicking the provider you want above the API keys.
`;

export const getRateLimitErrorMessage = (provider: AIProvider) => `
⚠️ **Rate Limit Exceeded**: Your API key has reached its usage limit. Please check your ${provider.toUpperCase()} account or wait before trying again.
`;

export const getInvalidApiKeyErrorMessage = (provider: AIProvider) => `
❌ **Invalid API Key**: The ${provider.toUpperCase()} API key appears to be invalid. Please check your Settings and update the key.
`;
