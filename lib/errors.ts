import { embedMetadata } from "lib/metadata";

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
