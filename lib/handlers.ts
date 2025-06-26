import { AIProvider } from "./ai/models";
import { RequestDetails } from "./errors";
import {
  DEFAULT_MESSAGE,
  NO_API_KEY_SET,
  INVALID_MODEL,
  INVALID_PROVIDER,
  RATE_LIMIT,
  INVALID_RESOURCE,
  WEB_SEARCH_ERROR,
} from "./errors";

export interface ErrorType {
  name:
    | "EmptyAPIKey"
    | "RateLimit"
    | "InvalidModel"
    | "InvalidProvider"
    | "RequestError"
    | "ToolError";
  message: string;
  details: ErrorDetails;
}

export type ErrorDetails = Record<string, any>;
export type RequestErrorDetails = ErrorDetails & {
  request: RequestDetails & { toolName?: string };
};

export function handleError(error: ErrorType, details: ErrorDetails) {
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

  if (name === "ToolError") {
    return toolHandler(name, message, supplementals);
  }

  return DEFAULT_MESSAGE();
}

export function requestHandler(
  name: string,
  message: string,
  details: RequestErrorDetails
) {
  if (!details?.request) {
    return DEFAULT_MESSAGE();
  }

  if (
    details.request.statusCode === 401 ||
    details.request.statusCode === 403
  ) {
    return NO_API_KEY_SET(details.provider);
  }

  if (details.request.statusCode === 404) {
    return INVALID_RESOURCE(details.provider, details.model);
  }

  if (details.request.statusCode === 429) {
    return RATE_LIMIT(details.provider, details.request.responseBody);
  }

  return DEFAULT_MESSAGE();
}

export function toolHandler(
  name: string,
  message: string,
  details: ErrorDetails
) {
  if (details.tool === "web") {
    if (details.error?.statusCode === 401) {
      return NO_API_KEY_SET("Firecrawl");
    }

    if (details.error?.statusCode === 403) {
      return RATE_LIMIT("Firecrawl");
    }
  }

  return DEFAULT_MESSAGE();
}
