import { llms, type AIProvider } from "./ai/providers";
import { CustomError, RequestDetails } from "./errors";
import { openai, anthropic, google, xai, groq } from "./ai/spec";

export type ErrorDetails = Record<string, any>;
export type RequestErrorDetails = ErrorDetails & { request: RequestDetails };

export function handleError(error: CustomError, details: ErrorDetails) {
  const name = error.name;
  const message = error.message;
  const supplementals = { ...details, ...error.details };
  console.error(name, message, supplementals, details);

  if (name === "EmptyAPIKey") {
    return NO_API_KEY_SET(supplementals.provider as AIProvider);
  }

  if (name === "RateLimit") {
    return RATE_LIMIT(supplementals.provider as AIProvider);
  }

  if (name === "InvalidModel") {
    return INVALID_MODEL(supplementals.model);
  }

  if (name === "InvalidProvider") {
    return INVALID_PROVIDER(supplementals.model);
  }

  if (name === "RequestError") {
    return requestHandler(name, message, supplementals as RequestErrorDetails);
  }

  return DEFAULT_MESSAGE();
}

export function requestHandler(
  name: string,
  message: string,
  details: RequestErrorDetails
) {
  switch (details.request.statusCode) {
    case 401:
    case 403:
      return NO_API_KEY_SET(details.provider);
    case 404:
      return INVALID_RESOURCE(details.provider, details.model);
    case 429:
      return RATE_LIMIT(details.provider);
    default:
      return DEFAULT_MESSAGE();
  }
}

export const DEFAULT_MESSAGE = () =>
  `An unexpected error occurred while generating the response.`;

export const NO_API_KEY_SET = (provider?: AIProvider) => {
  const providerName = provider
    ? llms.provider(provider).name
    : "this provider";
  return `## Missing API Key

No API key has been configured for **${providerName}**.

You can setup an API key through any of the following providers.

- [OpenAI](${openai.links[4].link})
- [Anthropic](${anthropic.links[4].link})
- [Google](${google.links[4].link})
- [xAI](${xai.links[4].link})
- [Groq](${groq.links[4].link})

After you've created an API key, head over to **Settings** (bottom left) and then **API Keys** (left sidebar).

Once you're there, click the provider you've chosen, enter your API key, and hit save. After that, you'll be all set to start sending and receiving messages.

If you've already set an API key, and your wondering why your seeing this message, try double-checking your provider's console. If that doesn't resolve the issue, you can report this message to the [public repository](https://github.com/leftmove/broadbent).`;
};

export const INVALID_MODEL = (model?: string) => {
  const modelName = model || "'Unknown'";
  return `## Model Unavailable

The model **${modelName}** is not available or does not exist.

This is likely due to an error in our configuration. For now, you can try and switch to a different model.
`;
};

export const INVALID_PROVIDER = (provider?: AIProvider) => {
  const providerName = provider ? llms.provider(provider).name : "Unknown";
  return `## Provider Not Recognized

The AI provider **${providerName}** is not supported or does not exist.
    
This is likely due to an error in our configuration. For now, you can try and switch to a different provider.`;
};

export const INVALID_RESOURCE = (provider?: AIProvider, model?: string) => {
  const providerName = provider ? llms.provider(provider).name : "Unknown";
  const modelName = model || "Unknown";
  return `## Resource Not Found
  
  The resource **${providerName}** with model **${modelName}** was not found. This is likely due to an error in our configuration. For now, you can try and switch to a different provider.
  `;
};

export const RATE_LIMIT = (provider?: AIProvider) => {
  const providerName = provider ? llms.provider(provider).name : "Unknown";
  return `## Usage Limit Reached

The API key for **${providerName}** has exceeded its usage allocation.

You have either reached a temporary limit, or your billing has expired. Here are a couple of options going forward.

- Wait for the limit to reset
- Upgrade your subscription plan or add credits
- Verify your API key is correct

For now, you can try and switch to a different provider/model.
`;
};
