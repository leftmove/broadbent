export type AIProvider =
  | "openai"
  | "anthropic"
  | "google"
  | "grok"
  | "openrouter";

export interface ApiKeys {
  openai: string;
  anthropic: string;
  google: string;
  grok: string;
  openrouter: string;
}
