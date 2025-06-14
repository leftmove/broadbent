import { useState, useReducer } from "react";

import { streamText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createXai } from "@ai-sdk/xai";
import { createGroq } from "@ai-sdk/groq";

import { ApiKeys, ModelId, getModel, getProvider } from "lib/ai/providers";
import {
  APIKeyError,
  InvalidModelError,
  InvalidProviderError,
} from "lib/errors";

interface Message {
  role: "user" | "assistant";
  content: string;
}

type MessageAction = {
  type: "add" | "remove";
  message: Message;
};

type MessageHistory = Message[];

export const useAIGeneration = () => {
  const [messageHistory, setMessageHistory] = useReducer(
    (state: MessageHistory, action: MessageAction) => {
      switch (action.type) {
        case "add":
          state = [...state, action.message];
      }
      return state;
    },
    []
  );
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generateResponse = async (
    prompt: string,
    apiKeys: ApiKeys,
    modelId: ModelId,
    onError: () => void,
    onChunk?: (chunk: string) => void,
    messageHistory?: MessageHistory
  ): Promise<string> => {
    let llm;
    let model;

    try {
      const selectedModel = modelId || getModel(modelId)?.id;
      const selectedProvider = getProvider(modelId);

      if (!selectedModel) {
        throw new InvalidModelError("Invalid model.");
      }

      if (!selectedProvider) {
        throw new InvalidProviderError("Invalid provider.");
      }

      switch (selectedProvider) {
        case "openai":
          if (!apiKeys.openai) throw new APIKeyError("OpenAI API key not set");
          llm = createOpenAI({ apiKey: apiKeys.openai });
          model = llm(selectedModel);
          break;
        case "anthropic":
          if (!apiKeys.anthropic)
            throw new APIKeyError("Anthropic API key not set");
          llm = createAnthropic({ apiKey: apiKeys.anthropic });
          model = llm(selectedModel);
          break;

        case "google":
          if (!apiKeys.google) throw new APIKeyError("Google API key not set");
          llm = createGoogleGenerativeAI({ apiKey: apiKeys.google });
          model = llm(selectedModel);
          break;

        case "xai":
          if (!apiKeys.xai) throw new APIKeyError("xAI API key not set");
          llm = createXai({ apiKey: apiKeys.xai });
          model = llm(selectedModel);
          break;
        case "groq":
          if (!apiKeys.groq) throw new APIKeyError("Groq API key not set");
          llm = createGroq({ apiKey: apiKeys.groq });
          model = llm(selectedModel);
          break;
        default:
          throw new InvalidProviderError("Invalid provider.");
      }

      if (!model) {
        throw new InvalidModelError("Invalid model.");
      }
    } catch (error) {
      setError(error as Error);
      throw error;
    }

    try {
      const messages = [
        ...(messageHistory || []),
        { role: "user" as const, content: prompt },
      ];

      if (onChunk) {
        setStreaming(true);
        const { textStream } = streamText({
          model,
          messages,
          onError: (error) => {
            setError(error.error as Error);
          },
        });

        let fullText = "";
        for await (const textPart of textStream) {
          fullText += textPart;
          onChunk(fullText);
        }

        setStreaming(false);

        return fullText;
      } else {
        setStreaming(true);
        const { textStream: stream } = streamText({
          model,
          messages,
          onError: (error) => {
            setError(error.error as Error);
          },
        });

        let fullText = "";
        for await (const textPart of stream) {
          fullText += textPart;
        }

        setStreaming(false);

        return fullText;
      }
    } catch (error) {
      setError(error as Error);
      throw error;
    }
  };

  return { generateResponse, streaming, error };
};
