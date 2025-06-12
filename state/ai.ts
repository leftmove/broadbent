import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { AIProvider, ApiKeys, getDefaultModel } from "lib/ai/types";

export const useAIGeneration = () => {
  const generateResponse = async (
    prompt: string,
    provider: AIProvider,
    apiKeys: ApiKeys,
    modelId?: string,
    onChunk?: (chunk: string) => void
  ): Promise<string> => {
    let llm;
    let model;

    // Use provided model or default for provider
    const selectedModel = modelId || getDefaultModel(provider);

    switch (provider) {
      case "openai":
        if (!apiKeys.openai) throw new Error("OpenAI API key not set");
        llm = createOpenAI({ apiKey: apiKeys.openai });
        model = llm(selectedModel);
        break;

      case "anthropic":
        if (!apiKeys.anthropic) throw new Error("Anthropic API key not set");
        llm = createAnthropic({ apiKey: apiKeys.anthropic });
        model = llm(selectedModel);
        break;

      case "google":
        if (!apiKeys.google) throw new Error("Google API key not set");
        llm = createGoogleGenerativeAI({ apiKey: apiKeys.google });
        model = llm(selectedModel);
        break;

      case "xai":
        if (!apiKeys.xai) throw new Error("xAI API key not set");
        // xAI's Grok model uses OpenAI-compatible API
        llm = createOpenAI({
          apiKey: apiKeys.xai,
          baseURL: "https://api.x.ai/v1",
        });
        model = llm(selectedModel);
        break;

      case "openrouter":
        if (!apiKeys.openrouter) throw new Error("OpenRouter API key not set");
        llm = createOpenAI({
          apiKey: apiKeys.openrouter,
          baseURL: "https://openrouter.ai/api/v1",
        });
        model = llm(selectedModel);
        break;

      default:
        throw new Error("Invalid provider");
    }

    // Use streaming if onChunk callback is provided
    if (onChunk) {
      const { textStream } = streamText({
        model,
        prompt,
      });

      let fullText = "";
      for await (const textPart of textStream) {
        fullText += textPart;
        onChunk(fullText);
      }

      return fullText;
    } else {
      // Fallback to non-streaming for compatibility
      const { textStream: stream } = streamText({
        model,
        prompt,
      });

      let fullText = "";
      for await (const textPart of stream) {
        fullText += textPart;
      }

      return fullText;
    }
  };

  return { generateResponse };
};
