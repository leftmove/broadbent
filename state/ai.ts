import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createXai } from "@ai-sdk/xai";
import { createGroq } from "@ai-sdk/groq";
import { AIProvider, ApiKeys, providerModels } from "lib/ai/providers";

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
    const selectedProvider = providerModels[provider];
    const selectedModel = modelId || selectedProvider.get("default")!.id;

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
        llm = createXai({ apiKey: apiKeys.xai });
        model = llm(selectedModel);
        break;
      case "groq":
        if (!apiKeys.groq) throw new Error("Groq API key not set");
        llm = createGroq({ apiKey: apiKeys.groq });
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
