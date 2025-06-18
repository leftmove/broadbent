import { useState, useCallback } from "react";
import { useAction } from "convex/react";
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
  const generateResponseAction = useAction(api.ai.generateResponse);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetStreaming = useCallback(() => {
    setStreaming(false);
  }, []);

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
      return result;
    } catch (error: any) {
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
  };
};
