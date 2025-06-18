import { AIProvider } from "lib/ai/providers";
import {
  DEFAULT_ERROR_MESSAGE,
  NO_API_KEY_SET,
  INVALID_MODEL,
  INVALID_PROVIDER,
  INVALID_LOCATION,
  RATE_LIMIT,
} from "lib/ai/errors";
import { CustomError, RequestDetails } from "lib/errors";

type ErrorDetails = Record<string, any>;
type RequestErrorDetails = ErrorDetails & { request: RequestDetails };

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

  return DEFAULT_ERROR_MESSAGE();
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
    case 429:
      return RATE_LIMIT(details.provider);
    default:
      return DEFAULT_ERROR_MESSAGE();
  }
}
