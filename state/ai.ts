import { useState, useCallback } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { ModelId } from "lib/ai/models";
import { Id } from "../convex/_generated/dataModel";

import { CustomError } from "lib/errors";
import { extractMetadata } from "lib/metadata";
import { useUIState } from "./ui";

interface Message {
  role: "user" | "assistant";
  content: string;
}

type MessageHistory = Message[];

export const useAIGeneration = () => {
  const [error, setError] = useState<CustomError | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [currentMessageId, setCurrentMessageId] = useState<Id<"messages"> | null>(null);
  const generateResponseAction = useAction(api.ai.generateResponse);
  const cancelGeneration = useMutation(api.generations.cancel);
  const { setIsSearching } = useUIState();

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
        setIsSearching(false);
      } catch (error) {
        console.error("Failed to cancel generation:", error);
      }
    }
  }, [currentMessageId, streaming, cancelGeneration, setIsSearching]);

  const generateResponse = async (
    userId: Id<"users">,
    chatSlug: string,
    messageSlug: Id<"messages">,
    prompt: string,
    modelId: ModelId,
    messageHistory?: MessageHistory,
    enableWebSearch?: boolean
  ): Promise<{ content: string; thinking?: string; sources?: Array<{title: string; url: string; excerpt?: string}> }> => {
    setError(null);
    setStreaming(true);
    setCurrentMessageId(messageSlug);
    
    // Only show search animation if web search is enabled and the prompt likely requires search
    // Check if the prompt contains keywords that would trigger web search
    if (enableWebSearch) {
      const searchKeywords = [
        'current', 'recent', 'latest', 'today', 'yesterday', 'news', 'weather', 
        'price', 'stock', 'market', 'update', 'happening', 'events', 'when did',
        'when was', 'what happened', 'search', 'find', 'look up', 'check',
        '2024', '2025', 'this year', 'this month', 'this week'
      ];
      
      const promptLower = prompt.toLowerCase();
      const likelyToSearch = searchKeywords.some(keyword => promptLower.includes(keyword)) ||
                           promptLower.includes('?'); // Questions are more likely to need search
      
      if (likelyToSearch) {
        setIsSearching(true);
        // Auto-clear after 5 seconds if still showing
        setTimeout(() => setIsSearching(false), 5000);
      }
    }

    try {
      const result = await generateResponseAction({
        userId,
        chatSlug,
        messageSlug,
        prompt,
        modelId,
        messageHistory,
        enableWebSearch,
      }).catch((error: Error) => {
        const metadata = extractMetadata(error.message);
        throw new CustomError(metadata.name, metadata.message, metadata);
      });

      setStreaming(false);
      setCurrentMessageId(null);
      setIsSearching(false);
      return result;
    } catch (error: any) {
      // Check if error was due to cancellation
      if (error instanceof CustomError && error.name === "GenerationCancelled") {
        setStreaming(false);
        setCurrentMessageId(null);
        setIsSearching(false);
        throw new CustomError("GenerationStopped", "Generation was stopped by user.");
      }
      
      if (error instanceof CustomError) {
        setError(error);
      } else {
        const customError = new CustomError(
          "UnknownError",
          "An unknown error occurred while streaming text."
        );
        setError(customError);
      }
      setStreaming(false);
      setCurrentMessageId(null);
      setIsSearching(false);
      throw error;
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
