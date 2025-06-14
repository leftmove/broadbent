"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "lib/utils";
import { api } from "convex/_generated/api";
import { Textarea } from "components/ui/textarea";
import { Button } from "components/ui/button";
import { ErrorMessage } from "components/error-message";
import { useChatState } from "state/chat";
import { useAIGeneration } from "state/ai";
import { useSettingsState } from "state/settings";
import {
  providerModels,
  getProviderName,
  getModel,
  getProvider,
  type AIProvider,
} from "lib/ai/providers";

const placeholderPhrases = [
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
] as const;

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  const user = useQuery(api.auth.loggedInUser);
  const userSettings = useQuery(
    api.settings.getSettings,
    user ? { userId: user._id } : "skip"
  );
  const messages = useQuery(
    api.messages.listBySlug,
    chatSlug ? { chatSlug } : "skip"
  );

  const { setSelectedChatSlug } = useChatState();
  const { generateResponse, streaming, error } = useAIGeneration();
  const { apiKeys } = useSettingsState();

  const createChat = useMutation(api.chats.create);
  const sendMessage = useMutation(api.messages.sendBySlug);
  const setProvider = useMutation(api.settings.setProvider);
  const setSelectedModel = useMutation(api.settings.setSelectedModel);

  const currentModel = userSettings?.selectedModel;
  const currentProvider =
    (currentModel && getProvider(currentModel)) ||
    userSettings?.provider ||
    "openai";

  const randomPlaceholder =
    placeholderPhrases[Math.floor(Math.random() * placeholderPhrases.length)];

  // useEffect(() => {
  //   if (promptToSubmit?.trim()) {
  //     setInput(promptToSubmit);
  //     void handleSubmit(promptToSubmit);
  //     onPromptHandled?.();
  //   }
  // }, [promptToSubmit, onPromptHandled]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && !isSubmitting) {
        void handleSubmit(input);
      }
    }
  };

  const createChatAndNavigate = async (title: string) => {
    onChatStart?.();
    const chatCreationPromise = createChat({ title });

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

    return await chatCreationPromise;
  };

  const generateAIResponse = async (message: string, chatSlug: string) => {
    if (!userSettings?.provider) return;

    try {
      const selectedModel = userSettings.selectedModel;
      if (!selectedModel) {
        throw new Error("Invalid model.");
      }

      const messageHistory =
        messages?.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })) || [];

      onStreamingUpdate?.(true, "", chatSlug);

      const response = await generateResponse(
        message,
        apiKeys,
        selectedModel,
        (chunk: string) => {
          onStreamingUpdate?.(true, chunk, chatSlug);
        },
        messageHistory
      );

      if (response?.trim()) {
        await sendMessage({
          chatSlug,
          content: response,
          role: "assistant",
        });
      }

      onStreamingUpdate?.(false, "", null);
    } catch {
      onStreamingUpdate?.(false, "", null);
    }
  };

  const handleSubmit = async (message: string) => {
    if (!user || !message.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setInput("");

    try {
      let currentChatSlug = chatSlug;

      if (isHomePage || !currentChatSlug) {
        const title =
          message.length > 50 ? `${message.slice(0, 50)}...` : message;
        currentChatSlug = await createChatAndNavigate(title);
      }

      await sendMessage({
        chatSlug: currentChatSlug,
        content: message,
        role: "user",
      });

      await generateAIResponse(message, currentChatSlug);
    } catch (error) {
      console.error("Error sending message", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleProviderChange = async (provider: AIProvider) => {
    if (!user) return;
    await setProvider({ userId: user._id, provider });
    setIsModelSelectorOpen(false);
  };

  const handleModelChange = async (provider: AIProvider, modelId: string) => {
    if (!user) return;
    await setSelectedModel({ userId: user._id, provider, modelId });
    setIsModelSelectorOpen(false);
  };

  const getCurrentModelName = () => {
    if (!currentModel) return `${getProviderName(currentProvider)} (Default)`;
    const modelFind = getModel(currentModel);
    return modelFind?.name || `${getProviderName(currentProvider)} (Default)`;
  };

  const renderModelSelector = () => (
    <div
      className={cn(
        "overflow-hidden border-b border-border/30 bg-background/50 transition-all duration-300 ease-in-out",
        isModelSelectorOpen
          ? "max-h-[32rem] opacity-100 transform translate-y-0"
          : "max-h-0 opacity-0 transform -translate-y-2"
      )}
    >
      <div className="overflow-y-auto max-h-[32rem] p-2">
        {Object.entries(providerModels).map(([providerId, models]) => {
          const providerName = getProviderName(providerId as AIProvider);

          return (
            <div key={providerId} className="mb-6">
              <div className="flex items-center justify-between px-3 py-3 mb-3 border-b border-border/20">
                <div className="text-sm font-medium tracking-wide text-foreground/90">
                  {providerName}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2 px-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from(models.entries() as Iterable<[string, any]>)
                  .filter(([id]) => id !== "default")
                  .map(([modelId, model]) => {
                    const isSelected =
                      currentModel === modelId &&
                      currentProvider === providerId;

                    return (
                      <button
                        key={modelId}
                        onClick={() =>
                          void handleModelChange(
                            providerId as AIProvider,
                            modelId
                          )
                        }
                        className={cn(
                          "text-left px-3 py-3 text-sm rounded-lg hover:bg-secondary/70 transition-all duration-200 border border-transparent",
                          isSelected
                            ? "bg-secondary/70 ring-1 ring-primary/20 border-primary/20"
                            : "hover:border-primary/10"
                        )}
                      >
                        <div className="flex items-center min-h-[4rem]">
                          <div className="flex-1">
                            <div className="font-medium text-foreground">
                              {model.name}
                            </div>
                            {model.description && (
                              <div className="mt-1 text-xs text-muted-foreground line-clamp-2">
                                {model.description}
                              </div>
                            )}
                          </div>
                          {isSelected && (
                            <div className="flex items-center justify-center w-5 h-5 ml-2 rounded-full bg-primary/10">
                              <div className="w-2.5 h-2.5 rounded-full bg-primary"></div>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="relative">
      {error && (
        <div className="absolute left-0 right-0 z-40 mb-2 bottom-full">
          <ErrorMessage
            error={error}
            details={{ provider: currentProvider, model: currentModel }}
          />
        </div>
      )}
      <div
        className={cn(
          "relative flex flex-col border rounded-xl shadow-lg bg-background/95 z-50 backdrop-blur-sm border-border/50",
          className
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
          <button
            onClick={() => setIsModelSelectorOpen(!isModelSelectorOpen)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm transition-all duration-200 rounded-md text-foreground hover:bg-secondary/70 border border-transparent hover:border-border/50"
          >
            <span className="font-medium">{getCurrentModelName()}</span>
            {isModelSelectorOpen ? (
              <ChevronUp className="w-4 h-4 ml-1 transition-transform duration-200" />
            ) : (
              <ChevronDown className="w-4 h-4 ml-1 transition-transform duration-200" />
            )}
          </button>
        </div>

        {renderModelSelector()}

        <div className="flex items-start h-20 gap-3 p-4">
          <div className="relative flex items-center flex-1">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={randomPlaceholder}
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
    </div>
  );
}
