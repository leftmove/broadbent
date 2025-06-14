import { AIProvider } from "lib/ai/providers";
import {
  DEFAULT_ERROR_MESSAGE,
  NO_API_KEY_SET_ERROR_MESSAGE,
  INVALID_MODEL_ERROR_MESSAGE,
  INVALID_PROVIDER_ERROR_MESSAGE,
  GOOGLE_MODEL_NOT_FOUND_ERROR_MESSAGE,
} from "lib/ai/errors";
import {
  APIKeyError,
  InvalidModelError,
  InvalidProviderError,
} from "lib/errors";

function match(regex: RegExp, message: string): boolean {
  return regex.test(message);
}

export function handleError(error: Error, details: any): string {
  const supplementals: Record<string, string> = {};
  Object.keys(details).forEach((key) => {
    if (details[key]) {
      supplementals[key] = details[key];
    } else {
      supplementals[key] = "Unknown";
    }
  });
  console.error(error);

  if (error instanceof APIKeyError) {
    return NO_API_KEY_SET_ERROR_MESSAGE(supplementals.provider as AIProvider);
  }

  if (error instanceof InvalidModelError) {
    return INVALID_MODEL_ERROR_MESSAGE(supplementals.model);
  }

  if (error instanceof InvalidProviderError) {
    return INVALID_PROVIDER_ERROR_MESSAGE(supplementals.model);
  }

  if (
    match(
      /models\/([^/\s]+) is not found for API version [^,]+, or is not supported for generateContent/,
      error.message
    )
  ) {
    return GOOGLE_MODEL_NOT_FOUND_ERROR_MESSAGE(supplementals.model);
  }

  return DEFAULT_ERROR_MESSAGE();
}
