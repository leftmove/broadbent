import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { AIProvider, ApiKeys } from "lib/ai/types";

export const useAIGeneration = () => {
  const generateResponse = async (
    prompt: string,
    provider: AIProvider,
    apiKeys: ApiKeys,
    modelId?: string
  ): Promise<string> => {
    let llm;
    let model;

    switch (provider) {
      case "openai":
        if (!apiKeys.openai) throw new Error("OpenAI API key not set");
        llm = createOpenAI({ apiKey: apiKeys.openai });
        model = llm(modelId || "gpt-4-turbo-preview");
        break;

      case "anthropic":
        if (!apiKeys.anthropic) throw new Error("Anthropic API key not set");
        llm = createAnthropic({ apiKey: apiKeys.anthropic });
        model = llm(modelId || "claude-3-5-sonnet-20241022");
        break;

      case "google":
        if (!apiKeys.google) throw new Error("Google API key not set");
        llm = createGoogleGenerativeAI({ apiKey: apiKeys.google });
        model = llm(modelId || "gemini-pro");
        break;

      case "grok":
        if (!apiKeys.grok) throw new Error("Grok API key not set");
        // Grok uses OpenAI-compatible API
        llm = createOpenAI({ 
          apiKey: apiKeys.grok,
          baseURL: "https://api.x.ai/v1"
        });
        model = llm(modelId || "grok-beta");
        break;

      case "openrouter":
        if (!apiKeys.openrouter) throw new Error("OpenRouter API key not set");
        llm = createOpenAI({ 
          apiKey: apiKeys.openrouter,
          baseURL: "https://openrouter.ai/api/v1"
        });
        model = llm(modelId || "openai/gpt-4-turbo");
        break;

      default:
        throw new Error("Invalid provider");
    }

    const { text } = await generateText({
      model,
      prompt,
    });

    return text;
  };

  return { generateResponse };
};