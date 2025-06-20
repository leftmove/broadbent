// General tools types
export type ToolProvider = "firecrawl";

export interface ToolProviderInfo {
  name: string;
  apiKeyName: string;
  apiKeyPlaceholder: string;
  href: string;
  description: string;
  category: "web-search";
}

export const toolProviders: Record<ToolProvider, ToolProviderInfo> = {
  firecrawl: {
    name: "Firecrawl",
    apiKeyName: "Firecrawl API Key",
    apiKeyPlaceholder: "fc-...",
    href: "https://www.firecrawl.dev/app/api-keys",
    description: "Advanced web scraping and search with LLM-ready content extraction",
    category: "web-search"
  }
};