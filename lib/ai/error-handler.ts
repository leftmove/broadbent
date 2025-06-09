import { AIProvider } from "./types";
import {
  DEFAULT_ERROR_MESSAGE,
  getApiKeyMissingErrorMessage,
  getInvalidApiKeyErrorMessage,
  getRateLimitErrorMessage,
} from "./error-messages";

export function getAIErrorMessage(
  error: unknown,
  provider: AIProvider
): string {
  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase();

    if (errorMessage.includes("api key not set")) {
      return getApiKeyMissingErrorMessage(provider);
    }
    if (errorMessage.includes("rate limit") || errorMessage.includes("quota")) {
      return getRateLimitErrorMessage(provider);
    }
    if (errorMessage.includes("invalid") && errorMessage.includes("key")) {
      return getInvalidApiKeyErrorMessage(provider);
    }
  }

  return DEFAULT_ERROR_MESSAGE;
}
