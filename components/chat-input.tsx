"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { Button } from "components/ui/button";
import { Textarea } from "components/ui/textarea";
import { Send, ChevronDown, Paperclip, Search } from "lucide-react";
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
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={(e) => void handleSubmit(e)} className="relative">
          <div className="transition-shadow border shadow-sm border-border rounded-2xl bg-background focus-within:shadow-md">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message here..."
              className="w-full pr-20 pb-12 pt-4 px-4 min-h-[80px] max-h-[300px] resize-none !border-0 bg-transparent font-sans text-sm focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void handleSubmit(e);
                }
              }}
            />

            <div className="flex items-center justify-between px-4 pb-3">
              <div className="flex items-center space-x-3">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 font-sans text-xs rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                >
                  <span className="mr-1">Claude 3.5 Sonnet</span>
                  <ChevronDown className="w-3 h-3" />
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 p-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                >
                  <Paperclip className="w-4 h-4" />
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 p-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>

              <Button
                type="submit"
                disabled={!input.trim() || isGenerating}
                size="sm"
                className="w-8 h-8 p-0 rounded-lg bg-foreground text-background hover:bg-foreground/90"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
