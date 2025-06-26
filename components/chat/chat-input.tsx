"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { observer } from "@legendapp/state/react";

import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import {
  ChevronDown,
  ChevronUp,
  ArrowUp,
  Brain,
  Square,
  Globe,
} from "lucide-react";

import { chatState$ } from "state/chat";
import { useAIGeneration } from "state/ai";
import { uiStore$ } from "state/ui";

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
  defaultValue?: string;
  onPromptHandled?: () => void;
}

export const ChatInput = observer(
  ({
    className,
    chatSlug,
    isHomepage = false,
    defaultValue,
    onPromptHandled,
  }: ChatInputProps) => {
    const [input, setInput] = useState(defaultValue || "");
    const [isModelSelectorOpen, setIsModelSelectorOpen] = useState(false);
    const [isDemosSectionExpanded, setIsDemosSectionExpanded] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const router = useRouter();

    const user = useQuery(api.auth.loggedInUser);
    const userSettings = useQuery(
      api.settings.getSettings,
      user ? { userId: user._id } : "skip"
    ) || { selectedModel: "gemini-2.5-flash", provider: "google" };
    const messages =
      useQuery(api.messages.listBySlug, chatSlug ? { chatSlug } : "skip") || [];

    const {
      generateResponse,
      streaming,
      setError,
      clearError,
      stopGeneration,
    } = useAIGeneration();

    const createChat = useMutation(api.chats.create);
    const sendMessage = useMutation(api.messages.sendBySlug);
    const updateMessage = useMutation(api.messages.updateBySlug);
    const setSelectedModel = useMutation(api.settings.setSelectedModel);

    const currentModel =
      collection.model(userSettings.selectedModel as ModelId) ||
      collection.model(collection.provider(userSettings.provider).models[0].id);
    const currentProvider = collection.provider(currentModel.provider);

    const handleKeyboard = new Keyboard()
      .setup(["enter"], () => {
        if (input.trim() && !isSubmitting && !streaming) {
          void handleSubmit(input);
        }
      })
      .setup(["shift", "enter"], () => {
        if (textareaRef.current) {
          const textarea = textareaRef.current;
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;

          setInput((prev) => {
            const newValue = prev.slice(0, start) + "\n" + prev.slice(end);

            // Set cursor position after the newline on next tick
            setTimeout(() => {
              if (textarea) {
                textarea.selectionStart = textarea.selectionEnd = start + 1;
              }
            }, 0);

            return newValue;
          });
        }
      })
      .handler();

    const handleSubmit = async (message: string) => {
      if (!user || !message.trim() || isSubmitting || streaming) return;

      setIsSubmitting(true);
      setInput("");
      clearError();

      // Notify that prompt was handled
      if (onPromptHandled) {
        onPromptHandled();
      }
      try {
        let currentChatSlug = chatSlug;

        // Create chat if needed
        if (isHomepage || !currentChatSlug) {
          const title =
            message.length > 50 ? `${message.slice(0, 50)}...` : message;

          currentChatSlug = await createChat({ title });
          chatState$.selectedChatSlug.set(currentChatSlug);
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

        // Generate AI response
        await generateResponse(
          user._id,
          currentChatSlug,
          assistantMessageId,
          message,
          userSettings.selectedModel as ModelId,
          uiStore$.search.enabled.get()
        );
      } catch (error: any) {
        setError(error);
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleModelChange = async (
      provider: AIProvider,
      modelId: ModelId
    ) => {
      if (!user) return;
      await setSelectedModel({
        userId: user._id,
        provider,
        modelId,
      });
      setIsModelSelectorOpen(false);
    };

    const handleButtonClick = () => {
      if (streaming) {
        // Stop the current generation
        void stopGeneration();
      } else if (input.trim() && !isSubmitting) {
        // Send the message
        void handleSubmit(input);
      }
    };

    // Auto-resize textarea based on content
    const autoResizeTextarea = () => {
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = `${Math.min(
          textareaRef.current.scrollHeight,
          120
        )}px`;
      }
    };

    useEffect(() => {
      if (isHomepage) {
        uiStore$.input.hasContent.set(input.trim().length > 0);
      }

      // Auto-resize textarea when input changes
      autoResizeTextarea();
    }, [isHomepage, input]);

    // Update input when defaultValue changes
    useEffect(() => {
      if (defaultValue !== undefined) {
        setInput(defaultValue);
      }
    }, [defaultValue]);

    return (
      <div className="relative">
        {/* {error && (
        <div className="absolute right-0 left-0 bottom-full z-40 mb-2">
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
          <div className="flex justify-between items-center px-4 py-3 border-b transition-colors duration-200 border-border/30">
            <button
              onClick={() => setIsModelSelectorOpen(!isModelSelectorOpen)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm transition-all duration-200 rounded-lg text-foreground hover:bg-secondary/70 border border-transparent hover:border-border/50 hover:shadow-sm"
            >
              <div className="flex gap-2 items-center">
                <span className="font-medium">{currentModel.name}</span>
                {currentModel.capabilities?.thinking && (
                  <div
                    className="flex justify-center items-center w-4 h-4 bg-purple-100 rounded-full dark:bg-purple-900/30"
                    title="Reasoning capabilities"
                  >
                    <Brain className="w-2.5 h-2.5 text-purple-600 dark:text-purple-400" />
                  </div>
                )}
              </div>
              {isModelSelectorOpen ? (
                <ChevronUp className="ml-1 w-4 h-4 transition-transform duration-200" />
              ) : (
                <ChevronDown className="ml-1 w-4 h-4 transition-transform duration-200" />
              )}
            </button>

            {/* Search Toggle Button */}
            {currentModel.capabilities?.tool && (
              <button
                onClick={() =>
                  uiStore$.search.enabled.set(!uiStore$.search.enabled.get())
                }
                className={cn(
                  "flex relative justify-center items-center w-8 h-8 rounded-lg border transition-all duration-200",
                  uiStore$.search.enabled.get()
                    ? "text-white bg-blue-500 border-blue-500 hover:bg-blue-600"
                    : "text-blue-500 bg-transparent border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-950"
                )}
                title={
                  uiStore$.search.enabled.get()
                    ? "Disable web search"
                    : "Enable web search"
                }
              >
                <Globe
                  className={cn(
                    "w-4 h-4 transition-transform duration-200",
                    uiStore$.search.isSearching.get() && "animate-pulse"
                  )}
                />
                {uiStore$.search.isSearching.get() && (
                  <div className="flex absolute inset-0 justify-center items-center">
                    <div className="w-2 h-2 bg-current rounded-full animate-ping" />
                  </div>
                )}
              </button>
            )}
          </div>

          <div
            className={cn(
              "overflow-hidden border-b backdrop-blur-sm transition-all duration-300 ease-in-out border-border/30 bg-background/50",
              isModelSelectorOpen
                ? "shadow-inner opacity-100 transform translate-y-0 max-h-[32rem]"
                : "max-h-0 opacity-0 transform -translate-y-2"
            )}
          >
            <div className="overflow-y-auto max-h-[32rem] p-2">
              {/* Icon Key */}
              <div className="flex justify-end pr-2 mb-4">
                <div className="flex gap-4 items-center px-3 py-2 rounded-lg border bg-secondary/30 border-border/20">
                  <div className="flex gap-1 items-center">
                    <div className="flex justify-center items-center w-4 h-4 bg-purple-100 rounded-full dark:bg-purple-900/30">
                      <Brain className="w-2.5 h-2.5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Reasoning
                    </span>
                  </div>
                  <div className="flex gap-1 items-center">
                    <div className="flex justify-center items-center w-4 h-4 bg-blue-100 rounded-full dark:bg-blue-900/30">
                      <Globe className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      Web Search
                    </span>
                  </div>
                </div>
              </div>
              {(() => {
                const ENABLE_DEMOS = true; // Toggle this to show/hide demos section
                const DEMO_PROVIDERS = ["openai", "xai", "groq"];

                const regularProviders = collection.providers.filter(
                  (provider) => !DEMO_PROVIDERS.includes(provider.id)
                );
                const demoProviders = collection.providers.filter((provider) =>
                  DEMO_PROVIDERS.includes(provider.id)
                );

                return (
                  <>
                    {regularProviders.map((provider) => (
                      <div key={provider.id} className="mb-6">
                        <div className="flex justify-between items-center px-3 py-3 mb-3 border-b border-border/20">
                          <div className="text-sm font-medium tracking-wide text-foreground/90">
                            {provider.name}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 gap-2 px-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
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
                                    <div className="flex gap-2 items-center">
                                      <div className="font-medium text-foreground">
                                        {model.name}
                                      </div>
                                      <div className="flex gap-1 items-center">
                                        {model.capabilities?.thinking && (
                                          <div
                                            className="flex justify-center items-center w-5 h-5 bg-purple-100 rounded-full dark:bg-purple-900/30"
                                            title="Reasoning capabilities"
                                          >
                                            <Brain className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                                          </div>
                                        )}
                                        {model.capabilities?.tool && (
                                          <div
                                            className="flex justify-center items-center w-5 h-5 bg-blue-100 rounded-full dark:bg-blue-900/30"
                                            title="Web search capabilities"
                                          >
                                            <Globe className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                    {model.description && (
                                      <div className="mt-1 text-xs text-muted-foreground line-clamp-2">
                                        {model.description}
                                      </div>
                                    )}
                                  </div>
                                  {isSelected && (
                                    <div className="flex justify-center items-center ml-2 w-5 h-5 rounded-full bg-primary/10">
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

                    {ENABLE_DEMOS && demoProviders.length > 0 && (
                      <div className="mb-6">
                        <button
                          onClick={() =>
                            setIsDemosSectionExpanded(!isDemosSectionExpanded)
                          }
                          className="flex justify-between items-center px-3 py-3 mb-3 w-full rounded-lg border-b transition-colors duration-200 border-border/20 hover:bg-secondary/30"
                        >
                          <div>
                            <div className="text-sm font-medium tracking-wide text-left text-foreground/90">
                              Demos
                            </div>
                            <div className="mt-1 text-xs text-left text-muted-foreground/80">
                              These models are untested and may not work as
                              expected
                            </div>
                          </div>
                          {isDemosSectionExpanded ? (
                            <ChevronUp className="w-4 h-4 transition-transform duration-200 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-4 h-4 transition-transform duration-200 text-muted-foreground" />
                          )}
                        </button>

                        <div
                          className={cn(
                            "transition-all duration-300 ease-in-out",
                            isDemosSectionExpanded
                              ? "block opacity-100"
                              : "hidden opacity-0"
                          )}
                        >
                          <div className="space-y-4">
                            {demoProviders.map((provider) => (
                              <div key={provider.id}>
                                <div className="px-3 mb-2">
                                  <div className="text-xs font-medium tracking-wider text-muted-foreground">
                                    {provider.name}
                                  </div>
                                </div>
                                <div className="grid grid-cols-1 gap-2 px-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                  {provider.models.map((model) => {
                                    const isSelected =
                                      currentModel.id === model.id;

                                    return (
                                      <button
                                        key={model.id}
                                        onClick={() =>
                                          void handleModelChange(
                                            provider.id,
                                            model.id
                                          )
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
                                            <div className="flex gap-2 items-center">
                                              <div className="font-medium text-foreground">
                                                {model.name}
                                              </div>
                                              <div className="flex gap-1 items-center">
                                                {model.capabilities
                                                  ?.thinking && (
                                                  <div
                                                    className="flex justify-center items-center w-5 h-5 bg-purple-100 rounded-full dark:bg-purple-900/30"
                                                    title="Reasoning capabilities"
                                                  >
                                                    <Brain className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                                                  </div>
                                                )}
                                                {model.capabilities?.tool && (
                                                  <div
                                                    className="flex justify-center items-center w-5 h-5 bg-blue-100 rounded-full dark:bg-blue-900/30"
                                                    title="Web search capabilities"
                                                  >
                                                    <Globe className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                            {model.description && (
                                              <div className="mt-1 text-xs text-muted-foreground line-clamp-2">
                                                {model.description}
                                              </div>
                                            )}
                                          </div>
                                          {isSelected && (
                                            <div className="flex justify-center items-center ml-2 w-5 h-5 rounded-full bg-primary/10">
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
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
          <div className="flex gap-3 items-start p-4 transition-all duration-200 min-h-20">
            <div className="flex relative flex-1 items-center group">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setInput(newValue);
                  uiStore$.input.hasContent.set(newValue.trim().length > 0);
                }}
                onKeyDown={handleKeyboard}
                placeholder={streaming ? "Streaming..." : inputPhrase()}
                className="px-0 w-full text-sm leading-relaxed bg-transparent border-0 transition-all duration-200 outline-none resize-none min-h-16 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60 focus:placeholder:text-muted-foreground/40"
                disabled={isSubmitting || streaming}
              />
            </div>
            <div className="flex items-center pt-1">
              <Button
                onClick={handleButtonClick}
                disabled={!streaming && (!input.trim() || isSubmitting)}
                size="sm"
                className={cn(
                  "relative overflow-hidden transition-all duration-300 rounded-full h-10 w-10 shrink-0 shadow-sm",
                  streaming
                    ? "bg-red-500 text-white hover:bg-red-600 hover:scale-105 hover:shadow-md active:scale-95"
                    : !input.trim() || isSubmitting
                      ? "bg-muted text-muted-foreground cursor-not-allowed"
                      : "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 hover:shadow-md active:scale-95"
                )}
              >
                <div className="flex relative z-10 justify-center items-center">
                  {streaming ? (
                    <Square className="w-4 h-4" />
                  ) : isSubmitting ? (
                    <div className="w-4 h-4 rounded-full border-2 border-current animate-spin border-t-transparent" />
                  ) : (
                    <ArrowUp className="w-4 h-4 transition-transform duration-200 group-hover:translate-y-[-1px]" />
                  )}
                </div>
                {/* Subtle shine effect on hover */}
                {streaming || !input.trim() || isSubmitting ? null : (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-500 ease-out"></div>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
);
