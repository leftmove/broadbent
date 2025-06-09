"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { Button } from "components/ui/button";
import { Textarea } from "components/ui/textarea";
import { Send } from "lucide-react";
import { useAIGeneration } from "state/functionality/ai";
import { useSettingsState } from "state/ui/settings";

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

      // Send helpful error message to the chat
      let errorMessage =
        "Sorry, I couldn't generate a response due to an error.";

      if (error instanceof Error) {
        if (error.message.includes("API key not set")) {
          errorMessage = `🔑 **API Key Required**: I need an API key to respond. Please go to Settings and add your ${selectedProvider.toUpperCase()} API key.\n\n**How to get an API key:**\n• **OpenAI**: Visit https://platform.openai.com/api-keys\n• **Anthropic**: Visit https://console.anthropic.com/\n• **Google**: Visit https://aistudio.google.com/app/apikey\n\nOnce you have your key, click the Settings button to add it.`;
        } else if (
          error.message.includes("rate limit") ||
          error.message.includes("quota")
        ) {
          errorMessage = `⚠️ **Rate Limit Exceeded**: Your API key has reached its usage limit. Please check your ${selectedProvider.toUpperCase()} account or wait before trying again.`;
        } else if (
          error.message.includes("invalid") &&
          error.message.includes("key")
        ) {
          errorMessage = `❌ **Invalid API Key**: The ${selectedProvider.toUpperCase()} API key appears to be invalid. Please check your Settings and update the key.`;
        }
      }

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
          className="flex-1 min-h-[60px] max-h-[200px] resize-none"
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
          className="self-end"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
