import { SearchResult } from "./web-search";

interface FirecrawlSearchParams {
  query: string;
  maxResults?: number;
}

interface FirecrawlSearchResponse {
  success: boolean;
  data?: Array<{
    url: string;
    title?: string;
    description?: string;
    markdown?: string;
    metadata?: {
      title?: string;
      description?: string;
    };
  }>;
  error?: string;
}

export async function searchWithFirecrawl(
  apiKey: string,
  params: FirecrawlSearchParams
): Promise<SearchResult[]> {
  if (!apiKey) {
    throw new Error("Firecrawl API key is required");
  }

  try {
    const response = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        query: params.query,
        limit: params.maxResults || 5,
        location: "",
        tbs: "",
        scrapeOptions: {
          formats: ["markdown"],
        },
      }),
    });

    const data: FirecrawlSearchResponse = await response.json();

    console.log("firecrawl response", data);

    if (!data.success || !data.data) {
      throw new Error(data.error || "Search failed");
    }

    return data.data.map((item) => ({
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
  } catch (error) {
    console.error("Firecrawl search error:", error);
    throw error;
  }
}
