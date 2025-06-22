import FirecrawlApp from "@mendable/firecrawl-js";
import type { SearchParams, SearchResponse } from "@mendable/firecrawl-js";

import type { SearchResult } from "./web-search";

interface FirecrawlSearchParams {
  query: string;
  maxResults?: number;
  cache?: boolean;
}

export async function searchWithFirecrawl(
  apiKey: string,
  params: FirecrawlSearchParams
): Promise<SearchResult[]> {
  const firecrawl = new FirecrawlApp({ apiKey });
  const options: SearchParams = {
    limit: params.maxResults || 5,
    scrapeOptions: {
      formats: ["markdown"],
      onlyMainContent: true,
      maxAge: params.cache ? 1000 * 60 * 60 * 24 * 7 : undefined,
    },
  };
  const results: SearchResponse = await firecrawl.search(params.query, options);

  console.log("results", results);

  if (!results.success || !results.data) {
    throw new Error(results.error || "Search failed");
  }

  return results.data.map((item) => ({
    title: item.title || item.metadata?.title || "Untitled",
    url: item.url || "",
    content:
      item.markdown || item.description || item.metadata?.description || "",
    excerpt:
      item.description ||
      item.metadata?.description ||
      item.markdown?.substring(0, 200) ||
      "",
  }));
}
