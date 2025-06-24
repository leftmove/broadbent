import { tool } from "ai";
import { z } from "zod";
import { searchWithFirecrawl } from "./search";

export type WebSearchProvider = "firecrawl";

export interface WebSearchConfig {
  provider: WebSearchProvider;
  apiKey: string;
}

export interface FirecrawlConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface SearchResult {
  title: string;
  url: string;
  content: string;
  excerpt?: string;
}

export interface SearchOptions {
  query: string;
  maxResults?: number;
  includeHtml?: boolean;
  includeRawHtml?: boolean;
}

export interface WebSearchResult {
  title: string;
  source: string;
  content: string;
  excerpt?: string;
}

export interface WebSearchProviderInfo {
  name: string;
  apiKeyName: string;
  apiKeyPlaceholder: string;
  href: string;
  description: string;
}

export const webSearchProviders: Record<
  WebSearchProvider,
  WebSearchProviderInfo
> = {
  firecrawl: {
    name: "Firecrawl",
    apiKeyName: "Firecrawl API Key",
    apiKeyPlaceholder: "fc-...",
    href: "https://www.firecrawl.dev/app/api-keys",
    description:
      "Advanced web scraping and search with LLM-ready content extraction",
  },
};

export function createWebSearchTool(
  apiKey: string,
  catcher: (error: Error) => any
) {
  return tool({
    description:
      "Search the web for current information and get full content from results",
    parameters: z.object({
      query: z.string().describe("The search query"),
      maxResults: z
        .number()
        .default(3)
        .optional()
        .describe("Maximum number of results to return"),
      cache: z
        .boolean()
        .default(true)
        .optional()
        .describe("Whether to cache results"),
    }),
    execute: async ({
      query,
      maxResults,
      cache,
    }): Promise<WebSearchResult[]> => {
      return await searchWithFirecrawl(apiKey, {
        query,
        maxResults,
        cache,
      })
        .then((results) => {
          // Temporary section length based on number of results
          let section = 500;
          if (results.length <= 1) {
            section = 1000;
          } else if (results.length <= 2) {
            section = 750;
          } else if (results.length <= 3) {
            section = 500;
          } else if (results.length <= 4) {
            section = 300;
          } else if (results.length <= 5) {
            section = 200;
          } else {
            section = 100;
          }

          return results.map((result) => ({
            title: result.title,
            source: result.url,
            excerpt: result.excerpt,
            content:
              result.content.length > 100
                ? result.content.slice(0, 100) + "..."
                : result.content,
          }));
        })
        .catch(catcher);
    },
  });
}
