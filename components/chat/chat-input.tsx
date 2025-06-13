"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";

import { Send, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "lib/utils";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { Textarea } from "components/ui/textarea";
import { Button } from "components/ui/button";
import { useChatState } from "state/chat";
import { useAIGeneration } from "state/ai";
import { useUIState } from "state/ui";
import { useSettingsState } from "state/settings";
import { errorHandler } from "lib/ai/handler";
import {
  providerModels,
  getProviderName,
  type AIProvider,
  ProviderModel,
} from "lib/ai/providers";

interface ChatInputProps {
  isHomePage?: boolean;
  className?: string;
  promptToSubmit?: string;
  onPromptHandled?: () => void;
  chatId?: Id<"chats">;
  onStreamingUpdate?: (
    isStreaming: boolean,
    content: string,
    chatId: Id<"chats"> | null
  ) => void;
}

export function ChatInput({
  isHomePage = false,
  className,
  promptToSubmit,
  onPromptHandled,
  chatId,
  onStreamingUpdate,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [streamingResponse, setStreamingResponse] = useState("");
  const [currentStreamingChatId, setCurrentStreamingChatId] =
    useState<Id<"chats"> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  const user = useQuery(api.auth.loggedInUser);
  const { setSelectedChatId } = useChatState();
  const { generateResponse } = useAIGeneration();
  const { apiKeys } = useSettingsState();

  const createChat = useMutation(api.chats.create);
  const sendMessage = useMutation(api.messages.send);
  const userSettings = useQuery(
    api.settings.getSettings,
    user ? { userId: user._id } : "skip"
  );
  const setProvider = useMutation(api.settings.setProvider);
  const setSelectedModel = useMutation(api.settings.setSelectedModel);

  const currentProvider = userSettings?.provider || "openai";
  const currentModel = userSettings?.selectedModel;

  useEffect(() => {
    if (promptToSubmit && promptToSubmit.trim()) {
      setInput(promptToSubmit);
      void handleSubmit(promptToSubmit);
      onPromptHandled?.();
    }
  }, [promptToSubmit]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isSubmitting) {
        void handleSubmit(input);
      }
    }
  };

  const handleSubmit = async (message: string) => {
    if (!user || !message.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setInput("");

    try {
      let currentChatId = chatId;

      if (isHomePage || !currentChatId) {
        const title =
          message.length > 50 ? `${message.slice(0, 50)}...` : message;
        currentChatId = await createChat({ title });
        setSelectedChatId(currentChatId);
        router.push(`/conversation/${currentChatId}`);
      }

      await sendMessage({
        chatId: currentChatId,
        content: message,
        role: "user",
      });

      // Generate AI response with streaming
      if (userSettings?.provider) {
        try {
          const selectedModel = userSettings.selectedModel;
          const provider = userSettings.provider;

          // Set up streaming state
          setCurrentStreamingChatId(currentChatId);
          setStreamingResponse("");
          onStreamingUpdate?.(true, "", currentChatId);

          const response = await generateResponse(
            message,
            provider,
            apiKeys,
            selectedModel || undefined,
            (chunk: string) => {
              // Update streaming response as chunks arrive
              setStreamingResponse(chunk);
              onStreamingUpdate?.(true, chunk, currentChatId);
            }
          );

          // Send the final complete response
          if (response && response.trim()) {
            await sendMessage({
              chatId: currentChatId,
              content: response,
              role: "assistant",
            });
          }

          // Clear streaming state
          setStreamingResponse("");
          setCurrentStreamingChatId(null);
          onStreamingUpdate?.(false, "", null);
        } catch (error) {
          // Clear streaming state on error
          setStreamingResponse("");
          setCurrentStreamingChatId(null);
          onStreamingUpdate?.(false, "", null);

          const errorMessage = errorHandler(
            error,
            userSettings.provider,
            providerModels[userSettings.provider].get(
              userSettings.selectedModel || "default"
            ) as ProviderModel
          );
          await sendMessage({
            chatId: currentChatId,
            content: errorMessage,
            role: "assistant",
          });
        }
      }
    } catch (error) {
      console.error("Error sending message", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProviderChange = async (provider: AIProvider) => {
    if (!user) return;

    await setProvider({
      userId: user._id,
      provider,
    });
    setIsModelSelectorOpen(false);
  };

  const handleModelChange = async (provider: AIProvider, modelId: string) => {
    if (!user) return;

    await setSelectedModel({
      userId: user._id,
      provider,
      modelId,
    });
    setIsModelSelectorOpen(false);
  };

  const getCurrentModelName = () => {
    if (!currentModel) return `${getProviderName(currentProvider)} (Default)`;

    const models = providerModels[currentProvider];
    const model = models.get(currentModel);
    return model ? `${model.name}` : currentModel;
  };

  return (
    <div className={cn("relative", className)}>
      <div className="relative flex flex-col border rounded-lg shadow-sm bg-background border-border">
        {/* Model Selection Button */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-border">
          <button
            onClick={() => setIsModelSelectorOpen(!isModelSelectorOpen)}
            className="flex items-center gap-2 text-sm transition-colors text-muted-foreground hover:text-foreground"
          >
            <span className="font-medium">{getCurrentModelName()}</span>
            {isModelSelectorOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Model Selection Dropdown */}
        {isModelSelectorOpen && (
          <div className="overflow-y-auto border-b border-border max-h-64">
            {Object.entries(providerModels).map(([providerId, models]) => (
              <div key={providerId} className="p-2">
                <div className="mb-2 text-xs font-medium tracking-wider uppercase text-muted-foreground">
                  {getProviderName(providerId as AIProvider)}
                </div>
                <div className="space-y-1">
                  {Array.from(models.entries() as Iterable<[string, any]>)
                    .filter(([id]) => id !== "default")
                    .map(([modelId, model]) => (
                      <button
                        key={modelId}
                        onClick={() =>
                          void handleModelChange(
                            providerId as AIProvider,
                            modelId
                          )
                        }
                        className={cn(
                          "w-full text-left px-3 py-2 text-sm rounded-md hover:bg-secondary transition-colors",
                          currentModel === modelId &&
                            currentProvider === providerId &&
                            "bg-secondary"
                        )}
                      >
                        <div className="font-medium">{model.name}</div>
                        {model.description && (
                          <div className="mt-1 text-xs text-muted-foreground">
                            {model.description}
                          </div>
                        )}
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="flex items-end gap-2 p-3">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isHomePage ? "How can I help you today?" : "Type a message..."
            }
            className="flex-1 min-h-[2.5rem] max-h-[200px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
            disabled={isSubmitting}
          />
          <Button
            onClick={() => void handleSubmit(input)}
            disabled={!input.trim() || isSubmitting}
            size="sm"
            className="shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
