"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { ArrowUp, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "lib/utils";
import { api } from "convex/_generated/api";
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

const placeholderPhrases: string[] = [
  "Words optional.",
  "Talk is cheap. Typing is cheaper.",
  "Fill me up.",
  "Blank.",
  "One bad idea away.",
  "Nothing says intimacy like plaintext.",
  "Go ahead, complicate things.",
  "Mean more.",
  "What's the worst that could happen?",
  "Mistakes start here.",
  "Go on.",
  "Use your words.",
  "Use your inside voice.",
  "Might as well.",
  "You know what to do.",
  "Put a thought in the box.",
  "This is the way.",
  "Ask me anything.",
];

interface ChatInputProps {
  isHomePage?: boolean;
  className?: string;
  promptToSubmit?: string;
  onPromptHandled?: () => void;
  onChatStart?: () => void;
  chatSlug?: string;
  onStreamingUpdate?: (
    isStreaming: boolean,
    content: string,
    chatSlug: string | null
  ) => void;
}

export function ChatInput({
  isHomePage = false,
  className,
  promptToSubmit,
  onPromptHandled,
  onChatStart,
  chatSlug,
  onStreamingUpdate,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [streamingResponse, setStreamingResponse] = useState("");
  const [currentStreamingChatSlug, setCurrentStreamingChatSlug] = useState<
    string | null
  >(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  const user = useQuery(api.auth.loggedInUser);
  const { setSelectedChatSlug } = useChatState();
  const { generateResponse } = useAIGeneration();
  const { apiKeys } = useSettingsState();

  const createChat = useMutation(api.chats.create);
  const sendMessage = useMutation(api.messages.sendBySlug);
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
      let currentChatSlug = chatSlug;

      if (isHomePage || !currentChatSlug) {
        // Start the transition animation immediately
        onChatStart?.();

        const title =
          message.length > 50 ? `${message.slice(0, 50)}...` : message;

        // Create chat and navigation optimistically in parallel
        const chatCreationPromise = createChat({ title });

        // Start navigation after a brief delay to allow animation to begin
        setTimeout(() => {
          void chatCreationPromise
            .then((slug) => {
              setSelectedChatSlug(slug);
              router.push(`/c/${slug}`);
            })
            .catch((error) => {
              console.error("Error navigating to chat:", error);
            });
        }, 200);

        currentChatSlug = await chatCreationPromise;
      }

      await sendMessage({
        chatSlug: currentChatSlug,
        content: message,
        role: "user",
      });

      // Generate AI response with streaming
      if (userSettings?.provider) {
        try {
          const selectedModel = userSettings.selectedModel;
          const provider = userSettings.provider;

          // Set up streaming state
          setCurrentStreamingChatSlug(currentChatSlug);
          setStreamingResponse("");
          onStreamingUpdate?.(true, "", currentChatSlug);

          const response = await generateResponse(
            message,
            provider,
            apiKeys,
            selectedModel || undefined,
            (chunk: string) => {
              // Update streaming response as chunks arrive
              setStreamingResponse(chunk);
              onStreamingUpdate?.(true, chunk, currentChatSlug);
            }
          );

          // Send the final complete response
          if (response && response.trim()) {
            await sendMessage({
              chatSlug: currentChatSlug,
              content: response,
              role: "assistant",
            });
          }

          // Clear streaming state
          setStreamingResponse("");
          setCurrentStreamingChatSlug(null);
          onStreamingUpdate?.(false, "", null);
        } catch (error) {
          // Clear streaming state on error
          setStreamingResponse("");
          setCurrentStreamingChatSlug(null);
          onStreamingUpdate?.(false, "", null);

          const errorMessage = errorHandler(
            error,
            userSettings.provider,
            providerModels[userSettings.provider].get(
              userSettings.selectedModel || "default"
            ) as ProviderModel
          );
          await sendMessage({
            chatSlug: currentChatSlug,
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
    <div
      className={cn(
        "relative flex flex-col border rounded-xl shadow-lg bg-background/95 backdrop-blur-sm border-border/50",
        className
      )}
    >
      {/* Model Selection Button */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
        <button
          onClick={() => setIsModelSelectorOpen(!isModelSelectorOpen)}
          className="flex items-center gap-2 px-2 py-1 text-sm transition-all duration-200 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/50"
        >
          <span className="font-medium">{getCurrentModelName()}</span>
          {isModelSelectorOpen ? (
            <ChevronUp className="w-4 h-4 transition-transform duration-200" />
          ) : (
            <ChevronDown className="w-4 h-4 transition-transform duration-200" />
          )}
        </button>
      </div>

      {/* Model Selection Dropdown */}
      <div
        className={cn(
          "overflow-hidden border-b border-border/30 bg-background/50 transition-all duration-300 ease-in-out",
          isModelSelectorOpen
            ? "max-h-64 opacity-100 transform translate-y-0"
            : "max-h-0 opacity-0 transform -translate-y-2"
        )}
      >
        <div className="overflow-y-auto max-h-64">
          {Object.entries(providerModels).map(([providerId, models]) => (
            <div key={providerId} className="p-3">
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
                        "w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-secondary/70 transition-all duration-200",
                        currentModel === modelId &&
                          currentProvider === providerId &&
                          "bg-secondary/70 ring-1 ring-primary/20"
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
      </div>

      {/* Input Area */}
      <div className="flex items-start h-20 gap-3 p-4">
        <div className="relative flex items-center flex-1">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              placeholderPhrases[
                Math.floor(Math.random() * placeholderPhrases.length)
              ]
            }
            className="w-full h-16 px-0 text-sm leading-relaxed bg-transparent border-0 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
            disabled={isSubmitting}
          />
        </div>
        <div className="flex items-center pt-1">
          <Button
            onClick={() => void handleSubmit(input)}
            disabled={!input.trim() || isSubmitting}
            size="sm"
            className="transition-all duration-200 rounded-lg h-9 w-9 shrink-0 hover:scale-105 disabled:scale-100"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <path d="m5 12 7-7 7 7"></path>
              <path d="M12 19V5"></path>
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}
