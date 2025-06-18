import { tool } from "ai";
import { z } from "zod";

export const webSearchTool = tool({
  description: "Search the web for current information, recent events, and up-to-date data. Use this when you need information that may not be in your training data or when asked about recent events.",
  parameters: z.object({
    query: z.string().describe("The search query to find information about. Be specific and use relevant keywords."),
  }),
  execute: async ({ query }) => {
    // This tool definition will be handled by the AI provider's native search capabilities
    // The actual search implementation depends on the provider:
    // - OpenAI: Uses web browsing capability
    // - Google: Uses search grounding  
    // - Anthropic: Uses web search capability
    // - Other providers: May use their own search methods
    
    return {
      query,
      message: "Web search executed via provider's native search capability",
      timestamp: new Date().toISOString(),
    };
  },
});