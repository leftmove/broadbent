"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Textarea } from "components/ui/textarea";
import { Button } from "components/ui/button";
import {
  Send,
  Sparkles,
  Search,
  BrainCircuit,
  Compass,
  Telescope,
  ChevronDown,
  Paperclip,
} from "lucide-react";

import { useAIGeneration } from "state/ai";
import { useSettingsState } from "state/settings";
import { providerModels, getDefaultModel, getModelName } from "lib/ai/types";
import { getApiKeyMissingErrorMessage } from "lib/ai/error-messages";

const placeholderPhrases: string[] = [
  "How can I help you today?",
  "Is this thing on?",
  "You first.",
  "Conversation pending.",
  "It begins.",
  "Holding for words.",
  "We start from nothing.",
  "Blank space. Big potential.",
  "Prompt not included.",
  "Scene: Unwritten.",
  "All quiet on the input front.",
  "On the edge of meaning.",
  "Where words might go.",
  "One message away.",
  "Speechless, by design.",
  "The calm before the reply.",
  "Nothing yet. But almost.",
  "Right before relevance.",
  "This could be the start.",
];

// Store callback functions globally
let setPromptInputText: ((text: string) => void) | null = null;
let submitPromptFn: ((prompt: string) => Promise<void>) | null = null;

// Global helper function to handle prompt selection
export function handlePromptSelection(prompt: string) {
  // Directly submit the prompt if the submit function is available
  if (submitPromptFn) {
    void submitPromptFn(prompt);
  } else {
    console.warn("Prompt submission function not initialized");

    // Fallback to just setting the text
    if (setPromptInputText) {
      setPromptInputText(prompt);

      // Focus the textarea after setting the input
      setTimeout(() => {
        const inputElement = document.querySelector(
          ".home-screen-input"
        ) as HTMLTextAreaElement;
        if (inputElement) {
          inputElement.focus();
        }
      }, 0);
    }
  }
}

// New component for home screen input
function HomeScreenInput() {
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);
  const router = useRouter();

  // Create a direct submission function that bypasses the form
  const submitPromptDirectly = async (promptText: string) => {
    if (isSubmitting) return;

    setInput(""); // Clear the input
    setIsSubmitting(true);

    try {
      // Check if API key is available for the selected provider
      if (!hasApiKey) {
        // Create a new chat
        const newChatId = await createChat({
          title: promptText.substring(0, 30) + "...",
        });

        // Navigate to the chat page
        router.push(`/conversation/${newChatId}`);

        // Send user message
        await sendMessage({
          chatId: newChatId,
          content: promptText,
          role: "user",
        });

        // Add error message about missing API key
        await sendMessage({
          chatId: newChatId,
          content: getApiKeyMissingErrorMessage(selectedProvider),
          role: "assistant",
        });

        return;
      }

      // 1. Create a new chat
      const newChatId = await createChat({
        title: promptText.substring(0, 30) + "...",
      });

      // 2. Navigate to the chat page
      router.push(`/conversation/${newChatId}`);

      // 3. Send user message
      await sendMessage({
        chatId: newChatId,
        content: promptText,
        role: "user",
      });

      // 4. Create initial AI message placeholder
      const aiMessageId = await sendMessage({
        chatId: newChatId,
        content: "",
        role: "assistant",
      });

      // 5. Generate AI response
      await generateResponse(
        promptText,
        selectedProvider,
        apiKeys,
        selectedModel,
        (partialText: string) => {
          void updateMessage({
            messageId: aiMessageId,
            content: partialText,
          });
        }
      );
    } catch (error) {
      console.error("Error starting new chat:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Register the setter and submit functions globally when component mounts
  useEffect(() => {
    setPromptInputText = setInput;
    submitPromptFn = submitPromptDirectly;
    return () => {
      setPromptInputText = null;
      submitPromptFn = null;
    };
  }, [setInput, submitPromptDirectly]);

  const createChat = useMutation(api.chats.create);
  const sendMessage = useMutation(api.messages.send);
  const updateMessage = useMutation(api.messages.update);
  const setSelectedModelMutation = useMutation(api.settings.setSelectedModel);
  const { generateResponse } = useAIGeneration();
  const { apiKeys, selectedProvider } = useSettingsState();

  // Get user for settings
  const user = useQuery(api.auth.loggedInUser);
  const userId = user?._id;

  // Local state for selected model - initialize directly with the default for the current provider
  const [selectedModel, setSelectedModel] = useState(() =>
    getDefaultModel(selectedProvider)
  );

  // Update model when provider changes
  useEffect(() => {
    // Get default model for the current provider
    const defaultModel = getDefaultModel(selectedProvider);

    // Set the model to the default for this provider
    setSelectedModel(defaultModel);

    // Save to database if user is logged in
    if (userId) {
      void setSelectedModelMutation({
        userId,
        modelId: defaultModel,
      }).catch((error) => {
        console.error("Failed to save default model for provider:", error);
      });
    }
  }, [selectedProvider, userId, setSelectedModelMutation]);

  // Get available models for current provider
  const availableModels = providerModels[selectedProvider] || [];

  // Current model name for display
  const currentModelName = getModelName(selectedProvider, selectedModel);

  // Check if API key is available for the selected provider
  const hasApiKey = !!apiKeys?.[selectedProvider];

  // Handle model selection
  const handleModelSelect = async (modelId: string) => {
    setSelectedModel(modelId);
    setShowModelDropdown(false);

    // Save to Convex if user is logged in
    if (userId) {
      try {
        void setSelectedModelMutation({
          userId,
          modelId,
        });
      } catch (error) {
        console.error("Failed to save model selection:", error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSubmitting) return;

    // Use the direct submission function
    void submitPromptDirectly(input.trim());
  };

  // Handle Enter key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit(e);
    }
  };

  return (
    <div className="p-3">
      <form onSubmit={(e) => void handleSubmit(e)} className="relative">
        <div className="transition-shadow border shadow-sm border-border rounded-2xl bg-background focus-within:shadow-md">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              isSubmitting ? "Creating chat..." : "Type your message here..."
            }
            disabled={isSubmitting}
            className="home-screen-input w-full pr-20 pb-12 pt-4 px-4 min-h-[80px] max-h-[300px] resize-none !border-0 bg-transparent font-sans text-sm focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
            onKeyDown={handleKeyDown}
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
                  disabled={isSubmitting}
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
                        {availableModels.map(
                          (model: {
                            id: string;
                            name: string;
                            description?: string;
                          }) => (
                            <button
                              key={model.id}
                              type="button"
                              className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                                selectedModel === model.id
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
                          )
                        )}
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
                disabled={isSubmitting}
              >
                <Paperclip className="w-4 h-4" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="w-8 h-8 p-0 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                disabled={isSubmitting}
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>

            <Button
              type="submit"
              disabled={!input.trim() || isSubmitting}
              size="sm"
              className="w-8 h-8 p-0 rounded-lg bg-foreground text-background hover:bg-foreground/90 disabled:opacity-50"
            >
              {isSubmitting ? (
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
  );
}

export function HomePlaceholder() {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-4">
      <div className="max-w-3xl mx-auto space-y-8 text-center">
        <div className="space-y-6 opacity-0 animate-pop-in">
          <h1 className="font-sans text-4xl font-semibold text-foreground">
            {
              placeholderPhrases[
                Math.floor(Math.random() * placeholderPhrases.length)
              ]
            }
          </h1>
        </div>

        <div className="grid w-full max-w-2xl grid-cols-1 gap-4 font-serif md:grid-cols-2">
          <button
            onClick={() =>
              handlePromptSelection(
                "Help me spark my imagination with a creative writing prompt."
              )
            }
            className="p-5 text-left transition-all duration-200 border shadow-sm opacity-0 border-border rounded-2xl hover:bg-secondary/30 group hover:shadow-md animate-pop-in-delay-1"
          >
            <div className="flex items-center h-16 space-x-3">
              <div className="text-lg">
                <Sparkles className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">
                  Imagine
                </div>
                <div className="font-sans text-xs leading-relaxed text-muted-foreground">
                  Write a thousand words at once with image generation.
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() =>
              handlePromptSelection(
                "What are some emerging technologies I should learn about?"
              )
            }
            className="p-5 text-left transition-all duration-200 border shadow-sm opacity-0 border-border rounded-2xl hover:bg-secondary/30 group hover:shadow-md animate-pop-in-delay-1"
          >
            <div className="flex items-center h-16 space-x-3">
              <div className="text-lg">
                <Telescope className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">
                  Search
                </div>
                <div className="font-sans text-xs leading-relaxed text-muted-foreground">
                  Traverse the web to find more current and specific context.
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() =>
              handlePromptSelection(
                "Help me break down a complex problem I'm facing with my project."
              )
            }
            className="p-5 text-left transition-all duration-200 border shadow-sm opacity-0 border-border rounded-2xl hover:bg-secondary/30 group hover:shadow-md animate-pop-in-delay-2"
          >
            <div className="flex items-center h-16 space-x-3">
              <div className="text-lg">
                <BrainCircuit className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">Think</div>
                <div className="font-sans text-xs leading-relaxed text-muted-foreground">
                  Reason with complex problems to get more accurate answers.
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() =>
              handlePromptSelection(
                "Explain a complex topic to me in simple terms."
              )
            }
            className="p-5 text-left transition-all duration-200 border shadow-sm opacity-0 border-border rounded-2xl hover:bg-secondary/30 group hover:shadow-md animate-pop-in-delay-2"
          >
            <div className="flex items-center h-16 space-x-3">
              <div className="text-lg">
                <Compass className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <div className="text-sm font-medium text-foreground">
                  Assist
                </div>
                <div className="font-sans text-xs leading-relaxed text-muted-foreground">
                  Navigate your browser with an extra helping hand.
                </div>
              </div>
            </div>
          </button>
        </div>

        <div className="max-w-lg mx-auto space-y-4 font-sans text-sm opacity-0 animate-pop-in-delay-3">
          <button
            onClick={() => handlePromptSelection("How does AI work?")}
            className="block w-full px-4 py-3 text-left transition-colors rounded-xl hover:bg-secondary/30 text-muted-foreground"
          >
            How does AI work?
          </button>
          <button
            onClick={() => handlePromptSelection("Are black holes real?")}
            className="block w-full px-4 py-3 text-left transition-colors rounded-xl hover:bg-secondary/30 text-muted-foreground"
          >
            Are black holes real?
          </button>
          <button
            onClick={() =>
              handlePromptSelection('How many Rs are in the word "strawberry"?')
            }
            className="block w-full px-4 py-3 text-left transition-colors rounded-xl hover:bg-secondary/30 text-muted-foreground"
          >
            How many Rs are in the word "strawberry"?
          </button>
          <button
            onClick={() =>
              handlePromptSelection("What is the meaning of life?")
            }
            className="block w-full px-4 py-3 text-left transition-colors rounded-xl hover:bg-secondary/30 text-muted-foreground"
          >
            What is the meaning of life?
          </button>
        </div>

        <div className="max-w-4xl mx-auto opacity-0 animate-pop-in-delay-3">
          <HomeScreenInput />
        </div>
      </div>
    </div>
  );
}
