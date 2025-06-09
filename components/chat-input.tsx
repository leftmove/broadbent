"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { Button } from "components/ui/button";
import { Textarea } from "components/ui/textarea";
import { Send } from "lucide-react";
import { useAIGeneration } from "state/ai";
import { useSettingsState } from "state/ui/settings";
import { getAIErrorMessage } from "lib/ai/error-handler";

interface ChatInputProps {
  chatId: Id<"chats">;
}

export function ChatInput({ chatId }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const sendMessage = useMutation(api.messages.send);
  const { generateResponse } = useAIGeneration();
  const { apiKeys, selectedProvider } = useSettingsState();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;

    const userMessage = input.trim();
    setInput("");
    setIsGenerating(true);

    try {
      // Send user message
      await sendMessage({
        chatId,
        content: userMessage,
        role: "user",
      });

      // Generate AI response
      const response = await generateResponse(
        userMessage,
        selectedProvider,
        apiKeys
      );

      // Send AI response
      await sendMessage({
        chatId,
        content: response,
        role: "assistant",
      });
    } catch (error) {
      console.error("Error generating response:", error);

      const errorMessage = getAIErrorMessage(error, selectedProvider);

      await sendMessage({
        chatId,
        content: errorMessage,
        role: "assistant",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-4 border-t border-border">
      <form onSubmit={(e) => void handleSubmit(e)} className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 min-h-[60px] max-h-[200px] my-auto resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void handleSubmit(e);
            }
          }}
        />
        <Button
          type="submit"
          disabled={!input.trim() || isGenerating}
          className="self-end my-auto"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
