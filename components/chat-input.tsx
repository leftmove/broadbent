"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { Button } from "components/ui/button";
import { Textarea } from "components/ui/textarea";
import { Send, ChevronDown, Paperclip, Search } from "lucide-react";
import { useAIGeneration } from "state/ai";
import { useChatState } from "state/chat";
import { useSettingsState } from "state/settings";
import { getAIErrorMessage } from "lib/ai/error-handler";
import { providerModels, getDefaultModel, getModelName } from "lib/ai/types";

interface ChatInputProps {
  chatId: Id<"chats"> | null;
}

export function ChatInput({ chatId }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const [streamingMessageId, setStreamingMessageId] =
    useState<Id<"messages"> | null>(null);

  const sendMessage = useMutation(api.messages.send);
  const updateMessage = useMutation(api.messages.update);
  const createChat = useMutation(api.chats.create);
  const setSelectedChatId = useChatState().setSelectedChatId;
  const setSelectedModelMutation = useMutation(api.settings.setSelectedModel);

  const { generateResponse } = useAIGeneration();
  const { apiKeys, selectedProvider } = useSettingsState();

  // Get user for settings
  const user = useQuery(api.auth.loggedInUser);
  const userId = user?._id;

  // Get saved model selection from Convex
  const savedModel = useQuery(
    api.settings.getSelectedModel,
    userId ? { userId } : "skip"
  );

  // Local state for selected model
  const [selectedModel, setSelectedModel] = useState<string | null>(null);

  // Sync with saved model when loaded
  useEffect(() => {
    if (savedModel !== undefined) {
      setSelectedModel(savedModel);
    }
  }, [savedModel]);

  // Get available models for current provider
  const availableModels = providerModels[selectedProvider] || [];

  // Get current model (selected or default)
  const currentModel = selectedModel || getDefaultModel(selectedProvider);
  const currentModelName = getModelName(selectedProvider, currentModel);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;

    const userMessage = input.trim();
    setInput("");
    setIsGenerating(true);

    try {
      let currentChatId = chatId;
      // If no chatId, create a new chat
      if (!chatId) {
        currentChatId = await createChat({ title: "New Chat" });
        setSelectedChatId(currentChatId);
      }

      if (!currentChatId) {
        throw new Error("Failed to create or retrieve chat ID");
      }

      // Send user message
      await sendMessage({
        chatId: currentChatId,
        content: userMessage,
        role: "user",
      });

      // Create initial AI message placeholder
      const aiMessageId = await sendMessage({
        chatId: currentChatId,
        content: "",
        role: "assistant",
      });

      setStreamingMessageId(aiMessageId);

      // Generate AI response with streaming
      await generateResponse(
        userMessage,
        selectedProvider,
        apiKeys,
        currentModel,
        // Streaming callback
        async (partialText: string) => {
          await updateMessage({
            messageId: aiMessageId,
            content: partialText,
          });
        }
      );
    } catch (error) {
      console.error("Error generating response:", error);

      const errorMessage = getAIErrorMessage(error, selectedProvider);

      // Update the streaming message with error or create new error message
      if (streamingMessageId) {
        await updateMessage({
          messageId: streamingMessageId,
          content: errorMessage,
        });
      } else if (chatId) {
        await sendMessage({
          chatId,
          content: errorMessage,
          role: "assistant",
        });
      } else {
        // If no chatId and error before creating one, create a new chat for the error message
        const newChatId = await createChat({ title: "New Chat" });
        setSelectedChatId(newChatId);
        await sendMessage({
          chatId: newChatId,
          content: errorMessage,
          role: "assistant",
        });
      }
    } finally {
      setIsGenerating(false);
      setStreamingMessageId(null);
    }
  };

  const handleModelSelect = async (modelId: string) => {
    setSelectedModel(modelId);
    setShowModelDropdown(false);

    // Save to Convex if user is logged in
    if (userId) {
      try {
        await setSelectedModelMutation({
          userId,
          modelId,
        });
      } catch (error) {
        console.error("Failed to save model selection:", error);
      }
    }
  };

  // Reset selected model when provider changes
  useEffect(() => {
    setSelectedModel(null);
  }, [selectedProvider]);

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={(e) => void handleSubmit(e)} className="relative">
          <div className="transition-shadow border shadow-sm border-border rounded-2xl bg-background focus-within:shadow-md">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                isGenerating
                  ? "Generating response..."
                  : "Type your message here..."
              }
              disabled={isGenerating}
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
                <div className="relative">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 font-sans text-xs rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    onClick={() => setShowModelDropdown(!showModelDropdown)}
                    disabled={isGenerating}
                  >
                    <span className="mr-1">{currentModelName}</span>
                    <ChevronDown
                      className={`w-3 h-3 transition-transform duration-200 ${showModelDropdown ? "rotate-180" : ""}`}
                    />
                  </Button>

                  {showModelDropdown && (
                    <div className="absolute left-0 z-50 mb-2 border rounded-lg shadow-lg bottom-full w-80 bg-popover border-border">
                      <div className="p-2">
                        <div className="px-2 py-1 mb-2 text-xs font-medium border-b text-muted-foreground border-border">
                          {selectedProvider.charAt(0).toUpperCase() +
                            selectedProvider.slice(1)}{" "}
                          Models
                        </div>
                        <div className="space-y-1 overflow-y-auto max-h-64">
                          {availableModels.map((model) => (
                            <button
                              key={model.id}
                              type="button"
                              className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                                currentModel === model.id
                                  ? "bg-accent text-accent-foreground"
                                  : "hover:bg-accent hover:text-accent-foreground"
                              }`}
                              onClick={() => void handleModelSelect(model.id)}
                            >
                              <div className="font-medium">{model.name}</div>
                              <div className="text-xs truncate text-muted-foreground">
                                {model.id}
                              </div>
                              {model.description && (
                                <div className="mt-1 text-xs text-muted-foreground/80">
                                  {model.description}
                                </div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 p-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  disabled={isGenerating}
                >
                  <Paperclip className="w-4 h-4" />
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 p-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  disabled={isGenerating}
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>

              <Button
                type="submit"
                disabled={!input.trim() || isGenerating}
                size="sm"
                className="w-8 h-8 p-0 rounded-lg bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50"
              >
                {isGenerating ? (
                  <div className="w-4 h-4 border-2 rounded-full border-background border-t-transparent animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </form>

        {/* Click outside to close dropdown */}
        {showModelDropdown && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowModelDropdown(false)}
          />
        )}
      </div>
    </div>
  );
}
