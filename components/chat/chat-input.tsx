"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { ChevronDown, ChevronUp, Send, ArrowUp, Brain } from "lucide-react";

import { useChatState } from "state/chat";
import { useAIGeneration } from "state/ai";
import { useUIState } from "state/ui";

import { cn } from "lib/utils";
import { Keyboard } from "lib/keyboard";
import { inputPhrase } from "lib/phrases";

import { Textarea } from "components/ui/textarea";
import { Button } from "components/ui/button";

import { llms as collection, type AIProvider } from "lib/ai/providers";
import { handleError } from "lib/handlers";
import { type ModelId } from "lib/ai/models";

interface ChatInputProps {
  className?: string;
  chatSlug: string;
  isHomepage?: boolean;
}

export function ChatInput({
  className,
  chatSlug,
  isHomepage = false,
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
  ) || { selectedModel: "gpt-4o", provider: "openai" };
  const messages =
    useQuery(api.messages.listBySlug, chatSlug ? { chatSlug } : "skip") || [];

  const { setSelectedChatSlug } = useChatState();
  const { generateResponse, streaming, setError, clearError } =
    useAIGeneration();
  const { setInputHasContent } = useUIState();

  const createChat = useMutation(api.chats.create);
  const sendMessage = useMutation(api.messages.sendBySlug);
  const updateMessage = useMutation(api.messages.updateBySlug);
  const setSelectedModel = useMutation(api.settings.setSelectedModel);

  const currentModel =
    collection.model(userSettings.selectedModel) || collection.model("gpt-4o");
  const currentProvider = collection.provider(currentModel.provider);

  const handleKeyboard = new Keyboard()
    .setup(["enter"], () => {
      if (input.trim() && !isSubmitting && !streaming) {
        void handleSubmit(input);
      }
    })
    .setup(["shift", "enter"], () => {
      setInput((prev) => {
        const newValue = prev + "\n";
        return newValue;
      });
    })
    .handler();

  const handleSubmit = async (message: string) => {
    if (!user || !message.trim() || isSubmitting || streaming) return;

    setIsSubmitting(true);
    setInput("");
    clearError();
    try {
      let currentChatSlug = chatSlug;

      // Create chat if needed
      if (isHomepage || !currentChatSlug) {
        const title =
          message.length > 50 ? `${message.slice(0, 50)}...` : message;

        currentChatSlug = await createChat({ title });
        setSelectedChatSlug(currentChatSlug);
        router.push(`/c/${currentChatSlug}`);
      }
      // Send user message
      await sendMessage({
        chatSlug: currentChatSlug,
        content: message,
        role: "user",
      });
      // Create assistant message placeholder
      const assistantMessageId = await sendMessage({
        chatSlug: currentChatSlug,
        content: "",
        role: "assistant",
        modelId: currentModel.id,
      });
      // Prepare message history
      const messageHistory =
        messages
          .filter((msg) => msg.content.trim() !== "")
          .map((msg) => ({
            role: msg.role,
            content: msg.content,
          })) || [];
      // Generate AI response
      await generateResponse(
        user._id,
        currentChatSlug,
        assistantMessageId,
        message,
        userSettings.selectedModel,
        messageHistory
      ).catch(async (error: any) => {
        const errorMessage = handleError(error, {
          provider: currentProvider.id,
          model: currentModel.id,
        });
        await updateMessage({
          chatSlug: currentChatSlug,
          messageSlug: assistantMessageId,
          content: errorMessage,
          type: "error",
        });
      });
    } catch (error: any) {
      setError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModelChange = async (provider: AIProvider, modelId: ModelId) => {
    if (!user) return;
    await setSelectedModel({
      userId: user._id,
      provider,
      modelId,
    });
    setIsModelSelectorOpen(false);
  };

  useEffect(() => {
    if (isHomepage && !input.trim()) {
      setInputHasContent(false);
    } else if (isHomepage && input.trim()) {
      setInputHasContent(true);
    }
  }, [isHomepage, input]);

  return (
    <div className="relative">
      {/* {error && (
        <div className="absolute left-0 right-0 z-40 mb-2 bottom-full">
          <ErrorMessage
            error={error}
            details={{ provider: currentProvider.id, model: currentModel.id }}
          />
        </div>
      )} */}
      <div
        className={cn(
          "relative flex flex-col border rounded-xl shadow-lg bg-background/95 z-50 backdrop-blur-sm border-border/50 transition-all duration-300 hover:shadow-xl hover:border-border/70 focus-within:shadow-xl focus-within:border-primary/20 focus-within:ring-1 focus-within:ring-primary/10",
          isHomepage && isModelSelectorOpen
            ? "-translate-y-[26rem]"
            : "translate-y-0",
          className
        )}
      >
        <div className="flex items-center justify-between px-4 py-3 transition-colors duration-200 border-b border-border/30">
          <button
            onClick={() => setIsModelSelectorOpen(!isModelSelectorOpen)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm transition-all duration-200 rounded-lg text-foreground hover:bg-secondary/70 border border-transparent hover:border-border/50 hover:shadow-sm"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium">{currentModel.name}</span>
              {currentModel.capabilities?.thinking && (
                <div className="flex items-center justify-center w-4 h-4 bg-purple-100 rounded-full dark:bg-purple-900/30">
                  <Brain className="w-2.5 h-2.5 text-purple-600 dark:text-purple-400" />
                </div>
              )}
            </div>
            {isModelSelectorOpen ? (
              <ChevronUp className="w-4 h-4 ml-1 transition-transform duration-200" />
            ) : (
              <ChevronDown className="w-4 h-4 ml-1 transition-transform duration-200" />
            )}
          </button>
        </div>

        <div
          className={cn(
            "overflow-hidden border-b border-border/30 bg-background/50 transition-all duration-300 ease-in-out backdrop-blur-sm",
            isModelSelectorOpen
              ? "max-h-[32rem] opacity-100 transform translate-y-0 shadow-inner"
              : "max-h-0 opacity-0 transform -translate-y-2"
          )}
        >
          <div className="overflow-y-auto max-h-[32rem] p-2">
            {collection.providers.map((provider) => (
              <div key={provider.id} className="mb-6">
                <div className="flex items-center justify-between px-3 py-3 mb-3 border-b border-border/20">
                  <div className="text-sm font-medium tracking-wide text-foreground/90">
                    {provider.name}
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-2 px-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {provider.models.map((model) => {
                    const isSelected = currentModel.id === model.id;

                    return (
                      <button
                        key={model.id}
                        onClick={() =>
                          void handleModelChange(provider.id, model.id)
                        }
                        className={cn(
                          "text-left px-3 py-3 text-sm rounded-lg hover:bg-secondary/70 transition-all duration-200 border border-transparent hover:shadow-sm hover:scale-[1.02]",
                          isSelected
                            ? "bg-secondary/70 ring-1 ring-primary/20 border-primary/20 shadow-sm"
                            : "hover:border-primary/10"
                        )}
                      >
                        <div className="flex items-center min-h-[4rem]">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <div className="font-medium text-foreground">
                                {model.name}
                              </div>
                              {model.capabilities?.thinking && (
                                <div className="flex items-center justify-center w-5 h-5 bg-purple-100 rounded-full dark:bg-purple-900/30">
                                  <Brain className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                                </div>
                              )}
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
            ))}
          </div>
        </div>
        <div className="flex items-start h-20 gap-3 p-4 transition-all duration-200">
          <div className="relative flex items-center flex-1 group">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                const newValue = e.target.value;
                setInput(newValue);
                setInputHasContent(newValue.trim().length > 0);
              }}
              onKeyDown={handleKeyboard}
              placeholder={streaming ? "Streaming..." : inputPhrase()}
              className="w-full h-16 px-0 text-sm leading-relaxed transition-all duration-200 bg-transparent border-0 outline-none resize-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60 focus:placeholder:text-muted-foreground/40"
              disabled={isSubmitting || streaming}
            />
          </div>
          <div className="flex items-center pt-1">
            <Button
              onClick={() => void handleSubmit(input)}
              disabled={!input.trim() || isSubmitting || streaming}
              size="sm"
              className={cn(
                "relative overflow-hidden transition-all duration-300 rounded-full h-10 w-10 shrink-0 shadow-sm",
                !input.trim() || isSubmitting || streaming
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 hover:shadow-md active:scale-95"
              )}
            >
              <div className="relative z-10 flex items-center justify-center">
                {streaming ? (
                  <div className="w-4 h-4 border-2 border-current rounded-full border-t-transparent animate-spin" />
                ) : (
                  <ArrowUp className="w-4 h-4 transition-transform duration-200 group-hover:translate-y-[-1px]" />
                )}
              </div>
              {/* Subtle shine effect on hover */}
              {!(!input.trim() || isSubmitting || streaming) && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-500 ease-out"></div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
