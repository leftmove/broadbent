import FirecrawlApp, { type SearchParams } from "@mendable/firecrawl-js";

interface FirecrawlSearchParams {
  query: string;
  maxResults?: number;
  cache: boolean;
}

export async function searchWithFirecrawl(
  apiKey: string,
  params: FirecrawlSearchParams
) {
  const app = new FirecrawlApp({ apiKey });
  const options: SearchParams = {
    limit: Math.min(params.maxResults ?? 5, 5),
    location: "",
    tbs: "",
    scrapeOptions: {
      formats: ["markdown"],
      onlyMainContent: true,
      maxAge: params.cache ? 1000 * 60 * 60 * 24 * 3 : undefined,
    },
  };
  const results = await app.search(params.query, options);

  if (!results.success || !results.data) {
    throw new Error(results.error || "Search failed");
  }

  return results.data.map((item) => ({
    title: item.title || item.metadata?.title || "Untitled",
    url: item.url,
    content:
      item.markdown || item.description || item.metadata?.description || "",
    excerpt:
      item.description ||
      item.metadata?.description ||
      item.markdown?.substring(0, 200) ||
      "",
  }));
}
