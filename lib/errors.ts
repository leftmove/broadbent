import { AIProvider } from "lib/ai/providers";

export class APIKeyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "APIKeyError";
  }
}

export class InvalidModelError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidModelError";
  }
}

export class InvalidProviderError extends Error {
  cause: any;
  constructor(message: string, provider?: AIProvider) {
    super(message);
    this.cause.provider = provider;
    this.name = "InvalidProviderError";
  }
}
