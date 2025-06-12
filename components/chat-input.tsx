"use client";

import { useState, useEffect, useCallback } from "react";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { Button } from "components/ui/button";
import { Textarea } from "components/ui/textarea";
import { useClickOutside } from "@/components/hooks/useClickOutside";
import {
  Send,
  Paperclip,
  Search,
  ChevronDown,
  ArrowLeft,
  X,
  Brain,
  Image,
  Wrench,
  Zap,
  Check,
  AlertTriangle,
} from "lucide-react";

import { cn } from "lib/utils";
import { useAIGeneration } from "state/ai";
import { useChatState } from "state/chat";
import { useSettingsState } from "state/settings";
import { getAIErrorMessage } from "lib/ai/error-handler";
import { getApiKeyMissingErrorMessage } from "lib/ai/error-messages";
import {
  AIProvider,
  providerModels,
  getProviderName,
  ProviderModel,
} from "lib/ai/providers";

interface UnifiedChatInputProps {
  chatId?: Id<"chats"> | null;
  isHomePage?: boolean;
  className?: string;
  promptToSubmit?: string;
  onPromptHandled?: () => void;
}

const PROVIDER_ORDER: AIProvider[] = [
  "openai",
  "anthropic",
  "google",
  "xai",
  "groq",
];

// Helper function to check if API key is available for a provider
const hasApiKeyForProvider = (provider: AIProvider, apiKeys: any): boolean => {
  return !!(apiKeys && apiKeys[provider] && apiKeys[provider].trim());
};

export function ChatInput({
  chatId = null,
  isHomePage = false,
  className = "",
  promptToSubmit,
  onPromptHandled,
}: UnifiedChatInputProps) {
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showAllProviders, setShowAllProviders] = useState(false);
  const [streamingMessageId, setStreamingMessageId] =
    useState<Id<"messages"> | null>(null);

  const router = useRouter();
  const sendMessage = useMutation(api.messages.send);
  const updateMessage = useMutation(api.messages.update);
  const createChat = useMutation(api.chats.create);
  const setSelectedModelMutation = useMutation(api.settings.setSelectedModel);

  const { setSelectedChatId } = useChatState();
  const { generateResponse } = useAIGeneration();
  const {
    apiKeys,
    selectedProvider,
    selectedModel,
    setSelectedProvider,
    setSelectedModel,
  } = useSettingsState();

  const user = useQuery(api.auth.loggedInUser);
  const userId = user?._id;

  const savedProvider = useQuery(
    api.settings.getProvider,
    userId ? { userId } : "skip"
  );
  const savedModel = useQuery(
    api.settings.getSelectedModel,
    userId ? { userId } : "skip"
  );

  const currentProvider = savedProvider || selectedProvider;
  const currentProviderMap = providerModels[currentProvider];
  const defaultModel = currentProviderMap.get("default")!;

  const currentModel =
    (savedModel
      ? currentProviderMap.get(savedModel)
      : currentProviderMap.get(selectedModel)) || defaultModel;
  const currentModelName = currentModel.name;

  // Sync with saved model when loaded
  useEffect(() => {
    if (savedModel) {
      setSelectedModel(currentModel.id);
    }
  }, [savedModel, currentModel, setSelectedModel]);

  useEffect(() => {
    setSelectedModel(defaultModel.id);
  }, [currentProvider, defaultModel, setSelectedModel]);

  const handleClose = useCallback(() => {
    setIsExpanded(false);
    setShowAllProviders(false);
  }, []);

  const ref = useClickOutside(handleClose);

  const handleProviderSelect = async (provider: AIProvider) => {
    setSelectedProvider(provider);
    setSelectedModel(defaultModel.id);
    setShowAllProviders(false);

    if (userId) {
      try {
        await setSelectedModelMutation({
          userId,
          provider,
          modelId: defaultModel.id,
        });
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleModelSelect = async (modelId: string) => {
    setSelectedModel(modelId);
    handleClose();

    if (userId) {
      try {
        await setSelectedModelMutation({
          userId,
          provider: currentProvider,
          modelId,
        });
      } catch (error) {
        console.error(error);
      }
    }
  };

  const CapabilityIcon = ({
    capability,
    enabled,
  }: {
    capability: "thinking" | "image" | "tool" | "streaming";
    enabled: boolean;
  }) => {
    const iconProps = {
      className: `w-4 h-4 ${enabled ? "text-green-500" : "text-muted-foreground/30"}`,
    };

    switch (capability) {
      case "thinking":
        return <Brain {...iconProps} />;
      case "image":
        return <Image {...iconProps} />;
      case "tool":
        return <Wrench {...iconProps} />;
      case "streaming":
        return <Zap {...iconProps} />;
    }
  };

  const renderCapabilities = (model: ProviderModel) => {
    const { capabilities, input, context } = model;

    return (
      <div className="flex items-center gap-3 p-2 mt-3 rounded-md bg-secondary/20">
        <div className="flex items-center gap-1">
          <CapabilityIcon
            capability="thinking"
            enabled={capabilities.thinking}
          />
          <span className="text-xs text-muted-foreground">Think</span>
        </div>
        <div className="flex items-center gap-1">
          <CapabilityIcon capability="image" enabled={input.image} />
          <span className="text-xs text-muted-foreground">Vision</span>
        </div>
        <div className="flex items-center gap-1">
          <CapabilityIcon capability="tool" enabled={capabilities.tool} />
          <span className="text-xs text-muted-foreground">Tools</span>
        </div>
        <div className="ml-auto text-xs text-muted-foreground">
          {context.window
            ? `${(context.window / 1000).toFixed(0)}K context`
            : "N/A"}
        </div>
      </div>
    );
  };

  const processSubmission = useCallback(
    async (message: string) => {
      if (!message.trim() || isGenerating) return;

      setInput("");
      setIsGenerating(true);

      try {
        let currentChatId = chatId;

        if (!chatId) {
          currentChatId = await createChat({
            title: message.substring(0, 30) + "...",
          });
          if (isHomePage) {
            router.push(`/conversation/${currentChatId}`);
          } else {
            setSelectedChatId(currentChatId);
          }
        }

        if (!currentChatId) {
          throw new Error("Failed to create or retrieve chat ID");
        }

        const hasApiKey = hasApiKeyForProvider(currentProvider, apiKeys);

        await sendMessage({
          chatId: currentChatId,
          content: message,
          role: "user",
        });

        if (!hasApiKey) {
          await sendMessage({
            chatId: currentChatId,
            content: getApiKeyMissingErrorMessage(currentProvider),
            role: "assistant",
          });
          return;
        }

        const aiMessageId = await sendMessage({
          chatId: currentChatId,
          content: "",
          role: "assistant",
        });

        setStreamingMessageId(aiMessageId);

        await generateResponse(
          message,
          currentProvider,
          apiKeys,
          currentModel.id,
          (partialText: string) => {
            void updateMessage({
              messageId: aiMessageId,
              content: partialText,
            });
          }
        );
      } catch (error) {
        console.error("Error generating response:", error);
        const errorMessage = getAIErrorMessage(error, currentProvider);

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
        }
      } finally {
        setIsGenerating(false);
        setStreamingMessageId(null);
        if (onPromptHandled) onPromptHandled();
      }
    },
    [
      isGenerating,
      chatId,
      createChat,
      isHomePage,
      router,
      setSelectedChatId,
      sendMessage,
      currentProvider,
      apiKeys,
      currentModel,
      generateResponse,
      updateMessage,
      streamingMessageId,
      onPromptHandled,
    ]
  );

  useEffect(() => {
    if (promptToSubmit) {
      void processSubmission(promptToSubmit);
    }
  }, [promptToSubmit, processSubmission]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void processSubmission(input);
  };

  return (
    <div
      ref={ref}
      className={cn(
        className,
        "translate-y-0 transition-all duration-500 ease-in-out",
        isHomePage && isExpanded ? "translate-y-[-280px]" : "translate-y-0"
      )}
      data-chat-input
    >
      <div className="max-w-4xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className={`relative ${isHomePage ? "z-50" : ""}`}
        >
          <div
            className={`transition-all duration-500 ease-in-out border shadow-sm border-border rounded-2xl bg-background focus-within:shadow-md ${
              isExpanded ? "pb-6 rounded-b-none" : ""
            }`}
          >
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                isGenerating
                  ? "Generating response..."
                  : isHomePage
                    ? "Type your message here..."
                    : "Type your message here..."
              }
              disabled={isGenerating}
              className={`w-full pr-20 pb-12 pt-4 px-4 ${isHomePage ? "home-screen-input" : ""} ${
                isExpanded ? "min-h-[80px]" : "min-h-[80px]"
              } max-h-[300px] resize-none !border-0 bg-transparent font-sans text-sm focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60`}
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
                  className={`h-8 px-3 font-sans text-xs rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition-all duration-200 ${
                    isExpanded ? "bg-secondary/50 text-foreground" : ""
                  }`}
                  onClick={() => setIsExpanded(!isExpanded)}
                  disabled={isGenerating}
                >
                  <span className="mr-1">{currentModelName}</span>
                  <ChevronDown
                    className={`w-3 h-3 transition-transform duration-200 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </Button>

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

            {/* Expanded Model Selection */}
            <div
              className={`transition-all duration-500 ease-in-out overflow-hidden ${
                isExpanded ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              <div
                className={`px-4 pb-4 border-t border-border/50 ${isHomePage ? "max-h-[50vh]" : ""}`}
              >
                <div className="mt-4">
                  {!showAllProviders ? (
                    // Current provider's models view
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium text-muted-foreground">
                            {getProviderName(currentProvider)} Models
                          </div>
                          {!hasApiKeyForProvider(currentProvider, apiKeys) && (
                            <div className="flex items-center gap-1 px-2 py-1 text-xs border rounded bg-amber-50 border-amber-200 text-amber-700">
                              <AlertTriangle className="w-3 h-3" />
                              <span>No API key</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8 px-3 text-xs cursor-pointer hover:bg-secondary"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log("Switch Provider clicked");
                              setShowAllProviders(true);
                            }}
                          >
                            Switch Provider
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="w-8 h-8 p-0 hover:bg-secondary"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setIsExpanded(false);
                              setShowAllProviders(false);
                            }}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <div
                        className="overflow-y-auto pr-2 max-h-[31vh]"
                        style={{ scrollbarWidth: "thin" }}
                      >
                        <div className="grid grid-cols-1 gap-3 pb-4 overflow-y-scroll">
                          {Array.from(
                            currentProviderMap.values() as unknown as ProviderModel[]
                          )
                            .filter(
                              (model) => !model.id?.startsWith("_deprecated")
                            )
                            .map((model) => {
                              const isSelected = currentModel === model;

                              return (
                                <button
                                  key={model.id}
                                  type="button"
                                  className={`text-left p-4 rounded-lg transition-colors border cursor-pointer ${
                                    isSelected
                                      ? "bg-accent text-accent-foreground border-accent"
                                      : "hover:bg-accent hover:text-accent-foreground border-border"
                                  }`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    void handleModelSelect(model.id);
                                  }}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium">
                                        {model.name}
                                      </div>
                                      <div className="mt-1 text-xs text-muted-foreground">
                                        {model.id}
                                      </div>
                                      {model.description && (
                                        <div className="mt-2 text-xs text-muted-foreground/80">
                                          {model.description}
                                        </div>
                                      )}
                                      {renderCapabilities(model)}
                                    </div>
                                    {isSelected && (
                                      <Check className="flex-shrink-0 w-5 h-5 ml-3 text-accent-foreground" />
                                    )}
                                  </div>
                                </button>
                              );
                            })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    // All providers view
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="w-8 h-8 p-0 hover:bg-secondary"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setShowAllProviders(false);
                            }}
                          >
                            <ArrowLeft className="w-4 h-4" />
                          </Button>
                          <div className="text-sm font-medium text-muted-foreground">
                            All AI Providers
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="w-8 h-8 p-0 hover:bg-secondary"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsExpanded(false);
                            setShowAllProviders(false);
                          }}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div
                        className={`${isHomePage ? "max-h-[40vh]" : "max-h-80"} overflow-y-auto pr-2 ${isExpanded ? "rounded-b-none pb-4" : ""}`}
                        style={{ scrollbarWidth: "thin" }}
                      >
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {PROVIDER_ORDER.map((provider) => {
                            const models = providerModels[provider];
                            const isCurrentProvider =
                              provider === currentProvider;

                            return (
                              <button
                                key={provider}
                                type="button"
                                className={`text-left p-4 rounded-lg transition-colors border cursor-pointer ${
                                  isCurrentProvider
                                    ? "bg-accent/50 text-accent-foreground border-accent"
                                    : "hover:bg-accent hover:text-accent-foreground border-border"
                                }`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  void handleProviderSelect(provider);
                                }}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="font-medium">
                                      {getProviderName(provider)}
                                    </div>
                                    <div className="mt-1 text-xs text-muted-foreground">
                                      {models.size} model
                                      {models.size !== 1 ? "s" : ""} available
                                    </div>
                                  </div>
                                  {isCurrentProvider && (
                                    <Check className="w-5 h-5 text-accent-foreground" />
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
