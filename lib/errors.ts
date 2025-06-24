import { embedMetadata } from "./metadata";

import { openai, anthropic, google, xai, groq } from "./ai/spec";
import { llms } from "./ai/providers";
import { AIProvider } from "./ai/models";

export abstract class BaseError extends Error {
  public readonly details?: any;
  public readonly parentError?: Error;
  public cause?: Error;

  constructor(message: string, parentError?: Error, details?: any) {
    // Format message with details if provided
    const formattedMessage = details
      ? `${message} ${typeof details === "string" ? details : JSON.stringify(details)}`
      : message;

    super(formattedMessage);

    this.parentError = parentError;
    this.details = details;

    // If parent error is provided, mirror its properties
    if (parentError) {
      this.stack = parentError.stack;
      this.cause = (parentError as any).cause || parentError;

      // Copy any additional properties from parent error
      Object.getOwnPropertyNames(parentError).forEach((prop) => {
        if (prop !== "name" && prop !== "message" && prop !== "stack") {
          try {
            (this as any)[prop] = (parentError as any)[prop];
          } catch {
            // Ignore non-configurable properties
          }
        }
      });
    }

    // Ensure proper prototype chain for instanceof checks
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class APIKeyError extends BaseError {
  constructor(message: string, parentError?: Error, details?: any) {
    super(message, parentError, details);
    this.name = "APIKeyError";
  }
}

export class RateLimitError extends BaseError {
  constructor(message: string, parentError?: Error, details?: any) {
    super(message, parentError, details);
    this.name = "RateLimitError";
  }
}

export class InvalidModelError extends BaseError {
  constructor(message: string, parentError?: Error, details?: any) {
    super(message, parentError, details);
    this.name = "InvalidModelError";
  }
}

export class InvalidProviderError extends BaseError {
  constructor(message: string, parentError?: Error, details?: any) {
    super(message, parentError, details);
    this.name = "InvalidProviderError";
  }
}

export class KeyboardError extends BaseError {
  constructor(message: string, parentError?: Error, details?: any) {
    super(message, parentError, details);
    this.name = "KeyboardError";
  }
}

export interface RequestDetails {
  name: string;
  cause: Error;
  url: string;
  requestBodyValues: Record<string, unknown>;
  statusCode: number;
  responseHeaders: Record<string, unknown>;
  responseBody: string;
  isRetryable: boolean;
  data: Record<string, unknown>;
}

export class RequestError extends BaseError {
  name: string;

  url: string;
  requestBodyValues: Record<string, unknown>;
  statusCode: number;
  responseHeaders: Record<string, unknown>;
  responseBody: string;
  isRetryable: boolean;
  data: Record<string, unknown>;

  details: any;

  constructor(
    message: string,
    parentError: {
      name?: string;
      cause?: Error;
      url?: string;
      requestBodyValues?: Record<string, unknown>;
      statusCode?: number;
      responseHeaders?: Record<string, unknown>;
      responseBody?: string;
      isRetryable?: boolean;
      data?: Record<string, unknown>;
    },
    details?: any
  ) {
    super(message);
    this.name = "RequestError";
    this.url = parentError?.url || "";
    this.requestBodyValues = parentError?.requestBodyValues || {};
    this.statusCode = parentError?.statusCode || 0;
    this.responseHeaders = parentError?.responseHeaders || {};
    this.responseBody = parentError?.responseBody || "";
    this.isRetryable = parentError?.isRetryable || false;
    this.data = parentError?.data || {};
    this.details = details;
  }
}

/**
 * Custom error class for errors that are not instances of Error.
 * This is used to handle errors that are not instances of Error.
 *
 * @param name - Name of the error, used as a replacement for the class name.
 * @param message - Main message attached to the error.
 * @param details - Details of the error, additional information about the error passed in from where it is thrown.
 */
export class CustomError extends BaseError {
  details: Record<string, any>;
  constructor(
    name: string,
    message: string,
    details: Record<string, any> = {}
  ) {
    super(message);
    this.name = name;
    this.details = details;
  }
}

export class ConvexError extends CustomError {
  constructor(name: string, message: string, details: Record<string, any>) {
    super(name, message, details);
    this.name = "ConvexError";
    this.message = embedMetadata(name, message, details);
  }
}

export class MessagedError extends CustomError {
  constructor(name: string, message: string, details: Record<string, any>) {
    super(name, message, details);
    this.name = "MessagedError";
  }
}

export const DEFAULT_MESSAGE = () =>
  `An unexpected error occurred while generating the response.`;

export const NO_API_KEY_SET = (provider: string) => {
  const providerName =
    (provider in llms.providers
      ? llms.provider(provider as AIProvider).name
      : provider) || "Unknown";
  return `## Missing API Key

No API key has been configured for **${providerName}**.

You can setup an API key through any of the following providers.

### Large Language Models

- [OpenAI](${openai.links[4].link})
- [Anthropic](${anthropic.links[4].link})
- [Google](${google.links[4].link})
- [xAI](${xai.links[4].link})
- [Groq](${groq.links[4].link})

### Tools

- [Firecrawl](https://www.firecrawl.dev/app/api-keys)


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

export const RATE_LIMIT = (provider: string) => {
  const providerName =
    (provider in llms.providers
      ? llms.provider(provider as AIProvider).name
      : provider) || "Unknown";
  return `## Usage Limit Reached

The API key for **${providerName}** has exceeded its usage allocation.

You have either reached a temporary limit, or your billing has expired. Here are a couple of options going forward.

- Wait for the limit to reset
- Upgrade your subscription plan or add credits
- Verify your API key is correct

For now, you can try and switch to a different provider/model.
`;
};

export const WEB_SEARCH_ERROR = (message: string) => {
  return `# Tool Error

The following error occurred while trying to web search.

${message}
`;
};
