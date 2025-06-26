import { useState, useCallback } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { ModelId } from "lib/ai/models";
import { Id } from "../convex/_generated/dataModel";

import { CustomError } from "lib/errors";
import { uiStore$ } from "./ui";

export const useAIGeneration = () => {
  const [error, setError] = useState<CustomError | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [currentMessageId, setCurrentMessageId] =
    useState<Id<"messages"> | null>(null);
  const generateResponseAction = useAction(api.ai.generateResponse);
  const cancelGeneration = useMutation(api.generations.cancel);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetStreaming = useCallback(() => {
    setStreaming(false);
  }, []);

  const stopGeneration = useCallback(async () => {
    if (currentMessageId && streaming) {
      try {
        await cancelGeneration({ messageId: currentMessageId });
        setStreaming(false);
        setCurrentMessageId(null);
        uiStore$.search.isSearching.set(false);
      } catch (error) {
        console.error("Failed to cancel generation:", error);
      }
    }
  }, [currentMessageId, streaming, cancelGeneration]);

  const generateResponse = async (
    userId: Id<"users">,
    chatSlug: string,
    messageSlug: Id<"messages">,
    prompt: string,
    modelId: ModelId,
    enableWebSearch?: boolean
  ) => {
    setError(null);
    setStreaming(true);
    setCurrentMessageId(messageSlug);

    try {
      const result = await generateResponseAction({
        userId,
        chatSlug,
        messageSlug,
        prompt,
        modelId,
        enableWebSearch,
      });

      setStreaming(false);
      setCurrentMessageId(null);
      uiStore$.search.isSearching.set(false);
      return result;
    } catch (error: any) {
      setError(error);
      setStreaming(false);
      setCurrentMessageId(null);
      uiStore$.search.isSearching.set(false);
    }
  };

  return {
    generateResponse,
    streaming,
    error,
    setError,
    clearError,
    resetStreaming,
    stopGeneration,
  };
};
