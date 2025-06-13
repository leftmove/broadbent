import { AIProvider, ProviderModel } from "lib/ai/providers";
import {
  DEFAULT_ERROR_MESSAGE,
  NO_API_KEY_SET_ERROR_MESSAGE,
  INVALID_API_KEY_ERROR_MESSAGE,
  RATE_LIMIT_ERROR_MESSAGE,
} from "./errors";

export function errorHandler(
  error: unknown,
  provider: AIProvider,
  model: ProviderModel
): string {
  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase();

    if (errorMessage.includes("api key not set")) {
      return NO_API_KEY_SET_ERROR_MESSAGE(provider);
    }
    if (errorMessage.includes("rate limit") || errorMessage.includes("quota")) {
      return RATE_LIMIT_ERROR_MESSAGE(provider);
    }
    if (errorMessage.includes("invalid") && errorMessage.includes("key")) {
      return INVALID_API_KEY_ERROR_MESSAGE(provider);
    }
  }
  return DEFAULT_ERROR_MESSAGE();
}
