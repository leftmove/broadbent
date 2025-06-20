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

export function createWebSearchTool(apiKey: string) {
  return tool({
    description:
      "Search the web for current information and get full content from results",
    parameters: z.object({
      query: z.string().describe("The search query"),
      maxResults: z
        .number()
        .max(8)
        .optional()
        .default(5)
        .describe("Maximum number of results to return (default: 5)"),
      cache: z
        .boolean()
        .optional()
        .describe("Whether to use cached search results"),
    }),
    execute: async ({ query, cache = true, maxResults = 5 }) => {
      // return {
      //   results: [
      //     {
      //       title: "Example Title",
      //       url: "https://www.example.com",
      //       excerpt: "Example Excerpt",
      //       content: "Example Content",
      //     },
      //     {
      //       title: "Example Title 2",
      //       url: "https://www.example.com",
      //       excerpt: "Example Excerpt 2",
      //       content: "Example Content 2",
      //     },
      //   ],
      // };
      const results = await searchWithFirecrawl(apiKey, {
        query,
        maxResults,
        cache,
      });
      const context = {
        results: results.map((result) => ({
          title: result.title,
          url: result.url,
          excerpt: result.excerpt,
          content: result.content,
        })),
      };

      return context;
    },
  });
}

// Legacy export for backward compatibility
export const webSearchTool = createWebSearchTool("");
