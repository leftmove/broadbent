import { tool } from "ai";
import { z } from "zod";
// import { searchDuckDuckGo } from "../web/search";

export const webSearchTool = tool({
  description:
    "Search the web for current information, recent events, and up-to-date data. Use this when you need information that may not be in your training data or when asked about recent events.",
  parameters: z.object({
    query: z
      .string()
      .describe(
        "The search query to find information about. Be specific and use relevant keywords."
      ),
  }),
  execute: async ({ query }) => {
    try {
      console.log(`Performing web search for: ${query}`);
      // const searchResults = await searchDuckDuckGo(query);
      const searchResults: any[] = [];

      if (searchResults.length === 0) {
        return {
          query,
          message: "No search results found for this query.",
          sources: [],
          timestamp: new Date().toISOString(),
        };
      }

      // Extract sources from search results
      const sources = searchResults.slice(0, 5).map((result) => ({
        title: result.title,
        url: result.url,
        excerpt: result.excerpt || "No excerpt available",
      }));

      // Compile search information for the AI
      let searchContent = `I found ${searchResults.length} web search results for "${query}":\n\n`;

      searchResults.slice(0, 5).forEach((result, index) => {
        searchContent += `${index + 1}. **${result.title}**\n`;
        searchContent += `   URL: ${result.url}\n`;
        if (result.excerpt) {
          searchContent += `   Excerpt: ${result.excerpt}\n`;
        }
        // Include page content if available but keep it concise
        if (
          result.pageContent?.success &&
          result.pageContent.content?.cleanedContent
        ) {
          const content = result.pageContent.content.cleanedContent.substring(
            0,
            300
          );
          searchContent += `   Content: ${content}${content.length >= 300 ? "..." : ""}\n`;
        }
        searchContent += "\n";
      });

      console.log(`Web search completed with ${sources.length} sources`);

      return {
        query,
        message: searchContent,
        sources,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Web search error:", error);
      return {
        query,
        message: `Error performing web search: ${error instanceof Error ? error.message : "Unknown error"}`,
        sources: [],
        timestamp: new Date().toISOString(),
      };
    }
  },
});
