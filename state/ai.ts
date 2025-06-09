import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { AIProvider, ApiKeys } from "lib/ai/types";

export const useAIGeneration = () => {
  const generateResponse = async (
    prompt: string,
    provider: AIProvider,
    apiKeys: ApiKeys
  ): Promise<string> => {
    let llm;
    let model;

    switch (provider) {
      case "openai":
        if (!apiKeys.openai) throw new Error("OpenAI API key not set");
        llm = createOpenAI({ apiKey: apiKeys.openai });
        model = llm("gpt-4-turbo-preview");
        break;

      case "anthropic":
        if (!apiKeys.anthropic) throw new Error("Anthropic API key not set");
        llm = createAnthropic({ apiKey: apiKeys.anthropic });
        model = llm("claude-3-sonnet-20240229");
        break;

      case "google":
        if (!apiKeys.google) throw new Error("Google API key not set");
        llm = createGoogleGenerativeAI({ apiKey: apiKeys.google });
        model = llm("gemini-pro");
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
