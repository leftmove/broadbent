import { useState, useCallback } from "react";
import { useAction, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { ModelId } from "lib/ai/models";
import { Id } from "../convex/_generated/dataModel";

import { CustomError } from "lib/errors";
import { extractMetadata } from "lib/metadata";

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
    messageHistory?: MessageHistory
  ): Promise<{ content: string; thinking?: string }> => {
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
        messageHistory,
      }).catch((error: Error) => {
        const metadata = extractMetadata(error.message);
        throw new CustomError(metadata.name, metadata.message, metadata);
      });

      setStreaming(false);
      setCurrentMessageId(null);
      return result;
    } catch (error: any) {
      // Check if error was due to cancellation
      if (error instanceof CustomError && error.name === "GenerationCancelled") {
        setStreaming(false);
        setCurrentMessageId(null);
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
