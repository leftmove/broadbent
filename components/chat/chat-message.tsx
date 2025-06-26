"use client";

import { useState, useEffect } from "react";
import { Doc } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import ReactMarkdown from "react-markdown";
import {
  Copy,
  FileText,
  RotateCcw,
  Trash2,
  Check,
  Edit2,
  Globe,
} from "lucide-react";
import { markdownToTxt } from "markdown-to-txt";

import { cn } from "lib/utils";
import { ModelId } from "lib/ai/models";
import { CodeBlock } from "components/code-block";
import { Button } from "components/ui/button";
import { MessageEditor } from "components/chat/message-editor";
import { ThinkingDisplay } from "components/chat/thinking-display";
import { MessageSources } from "components/chat/message-sources";
import { llms } from "lib/ai/providers";
import { useAIGeneration } from "state/ai";
import { uiStore$ } from "state/ui";

interface ChatMessageProps {
  message: Doc<"messages">;
  chatSlug: string;
}

export function ChatMessage({ message, chatSlug }: ChatMessageProps) {
  const [copiedText, setCopiedText] = useState<"formatted" | "raw" | null>(
    null
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [isSaving, setIsSaving] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showDeleteUndo, setShowDeleteUndo] = useState(false);
  const [deleteTimeout, setDeleteTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  const user = useQuery(api.auth.loggedInUser);
  const messages = useQuery(api.messages.listBySlug, { chatSlug });
  const deleteMessage = useMutation(api.messages.deleteMessage);
  const editMessage = useMutation(api.messages.editMessage);
  const updateMessage = useMutation(api.messages.updateBySlug);
  const { generateResponse, streaming } = useAIGeneration();

  const isSearching = uiStore$.search.isSearching.get();
  const searchEnabled = uiStore$.search.enabled.get();

  const isUser = message.role === "user";
  const isOwnMessage = user && message.userId === user._id;

  // Check if this is the last assistant message and if we're currently streaming/searching
  const isLastAssistantMessage =
    messages &&
    messages.length > 0 &&
    messages[messages.length - 1]._id === message._id &&
    message.role === "assistant";
  const showSearchIndicator =
    isLastAssistantMessage && isSearching && streaming;
  const isSearchingTool = useQuery(api.generations.isSearching, {
    messageId: message._id,
  });

  const copyToClipboard = async (text: string, type: "formatted" | "raw") => {
    try {
      const contentToCopy = type === "raw" ? markdownToTxt(text) : text;
      await navigator.clipboard.writeText(contentToCopy);
      setCopiedText(type);
      setTimeout(() => setCopiedText(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const handleDelete = () => {
    if (isDeleting || showDeleteUndo) return;

    setShowDeleteUndo(true);
    // Set a timeout to actually delete after 3 seconds
    const timeout = setTimeout(() => {
      setIsDeleting(true);
      deleteMessage({ messageId: message._id }).catch((error) => {
        console.error("Failed to delete message:", error);
        setIsDeleting(false);
        setShowDeleteUndo(false);
      });
    }, 3000);
    setDeleteTimeout(timeout);
  };

  const handleUndoDelete = () => {
    if (deleteTimeout) {
      clearTimeout(deleteTimeout);
      setDeleteTimeout(null);
    }
    setShowDeleteUndo(false);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditContent(message.content);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditContent(message.content);
  };

  const handleSaveEdit = async () => {
    if (isSaving || editContent.trim() === "") return;
    setIsSaving(true);
    try {
      await editMessage({
        messageId: message._id,
        content: editContent.trim(),
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to edit message:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegenerate = async () => {
    if (isRegenerating || !message.modelId || !messages) return;
    setIsRegenerating(true);
    try {
      // Find current message index
      const messageIndex = messages.findIndex((m) => m._id === message._id);
      if (messageIndex === -1) return;

      // Clear the current AI message
      await updateMessage({
        chatSlug,
        messageSlug: message._id,
        content: "",
        thinking: undefined,
      });

      // Get conversation history up to the user message that prompted this AI response
      const conversationHistory = messages
        .slice(0, messageIndex)
        .filter((m) => m.content.trim() !== "")
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      // Find the last user message for the prompt
      const lastUserMessage = conversationHistory
        .reverse()
        .find((m) => m.role === "user");

      if (!lastUserMessage) return;

      await generateResponse(
        message.userId,
        chatSlug,
        message._id,
        lastUserMessage.content,
        message.modelId as ModelId,
        searchEnabled
      );
    } finally {
      setIsRegenerating(false);
    }
  };

  const getModelInfo = () => {
    if (!message.modelId) return null;
    try {
      const model = llms.model(message.modelId as any);
      const provider = llms.provider(model.provider);
      return { model, provider };
    } catch {
      return null;
    }
  };

  const modelInfo = getModelInfo();
  const hasReasoning = message.thinking && message.thinking.trim() !== "";

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (deleteTimeout) {
        clearTimeout(deleteTimeout);
      }
    };
  }, [deleteTimeout]);

  // Show undo delete notification
  if (showDeleteUndo) {
    return (
      <div className="flex px-4 py-2 w-full">
        <div className="flex justify-between items-center p-4 w-full rounded-xl border duration-300 bg-destructive/10 border-destructive/20 animate-in fade-in slide-in-from-top-2">
          <div className="flex gap-2 items-center">
            <div className="w-2 h-2 rounded-full animate-pulse bg-destructive"></div>
            <span className="text-sm font-medium text-destructive">
              Message will be deleted in 3 seconds
            </span>
          </div>
          <button
            onClick={handleUndoDelete}
            className="px-3 py-1.5 text-sm font-medium text-destructive hover:text-destructive/80 underline underline-offset-2 transition-colors"
          >
            Undo
          </button>
        </div>
      </div>
    );
  }

  if (isUser) {
    return (
      <div
        id={message._id}
        className="flex justify-end px-4 py-2 w-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex flex-col max-w-[80%] break-words">
          {isEditing ? (
            <MessageEditor
              content={editContent}
              onContentChange={setEditContent}
              onSave={() => void handleSaveEdit()}
              onCancel={handleCancelEdit}
              isSaving={isSaving}
              isDisabled={
                isSaving ||
                editContent.trim() === "" ||
                editContent.trim() === message.content
              }
              messageType="user"
            />
          ) : (
            <>
              <div className="px-4 py-3 rounded-xl border shadow-sm transition-all duration-200 bg-primary text-primary-foreground border-primary/20 hover:shadow-md">
                <div className="text-base leading-relaxed">
                  {message.content}
                </div>
              </div>
              {isOwnMessage && (
                <div
                  className={cn(
                    "flex gap-1 justify-end mt-2 transition-all duration-300",
                    isHovered
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-2"
                  )}
                >
                  <button
                    onClick={handleEdit}
                    className="p-1.5 text-muted-foreground hover:text-foreground transition-all duration-200 hover:scale-110 active:scale-95 rounded-full hover:bg-secondary/30"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="p-1.5 text-muted-foreground hover:text-destructive transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50 rounded-full hover:bg-destructive/10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      id={message._id}
      className="flex px-4 py-2 w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="w-full max-w-none break-words">
        {isEditing ? (
          <MessageEditor
            content={editContent}
            onContentChange={setEditContent}
            onSave={() => void handleSaveEdit()}
            onCancel={handleCancelEdit}
            isSaving={isSaving}
            isDisabled={
              isSaving ||
              editContent.trim() === "" ||
              editContent.trim() === message.content
            }
            messageType="assistant"
            modelInfo={modelInfo}
          />
        ) : (
          <>
            {/* Search indicator - show when this is the last assistant message and search is active */}
            {showSearchIndicator && (
              <div className="px-4 py-3 mb-4 bg-blue-50 rounded-xl border border-blue-200 dark:bg-blue-950/30 dark:border-blue-800">
                <div className="flex gap-3 items-center text-sm text-blue-700 dark:text-blue-300">
                  <div className="relative">
                    <Globe className="w-4 h-4 animate-pulse" />
                    <div className="flex absolute inset-0 justify-center items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
                    </div>
                  </div>
                  <span className="font-medium">Searching the web...</span>
                  <div className="flex-1">
                    <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full animate-[shimmer_2s_ease-in-out_infinite]"
                        style={{
                          background:
                            "linear-gradient(90deg, rgb(59 130 246) 0%, rgb(37 99 235) 50%, rgb(59 130 246) 100%)",
                          backgroundSize: "200% 100%",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tool search progress bar */}
            {isSearchingTool && (
              <div className="flex justify-between items-center mb-4">
                <div className="overflow-hidden relative w-11/12">
                  <div className="w-full h-2 bg-gradient-to-r from-blue-100 to-blue-50 rounded-full border shadow-inner dark:from-blue-950/40 dark:to-blue-900/20 border-blue-200/50 dark:border-blue-800/30">
                    <div className="overflow-hidden relative h-full rounded-full">
                      <div
                        className="h-full rounded-full animate-[progress_2.5s_ease-in-out_infinite] shadow-sm"
                        style={{
                          background:
                            "linear-gradient(90deg, rgb(59 130 246) 0%, rgb(96 165 250) 25%, rgb(147 197 253) 50%, rgb(96 165 250) 75%, rgb(59 130 246) 100%)",
                          backgroundSize: "200% 100%",
                          animation: "progress 2.5s ease-in-out infinite",
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full animate-[shimmer_2s_ease-in-out_infinite]" />
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r rounded-full animate-pulse from-blue-400/10 via-blue-500/20 to-blue-400/10" />
                </div>
                <div className="relative flex-shrink-0">
                  <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <div className="absolute -inset-1">
                    <div className="w-6 h-6 rounded-full border-2 border-blue-200 opacity-30 animate-ping dark:border-blue-700" />
                  </div>
                </div>
              </div>
            )}

            <div className="prose prose-base max-w-none font-sans break-words text-foreground [&_*]:text-foreground">
              <ReactMarkdown
                components={{
                  p: ({ children }) => (
                    <p className="mb-3 leading-relaxed break-words last:mb-0">
                      {children}
                    </p>
                  ),
                  code: ({ children, className, ...props }) => {
                    const match = /language-(\w+)/.exec(className || "");
                    const language = match ? match[1] : "";

                    const codeContent = Array.isArray(children)
                      ? children
                          .filter((child) => typeof child === "string")
                          .join("")
                      : typeof children === "string"
                        ? children
                        : "";

                    if (language) {
                      return (
                        <CodeBlock language={language} isUserMessage={false}>
                          {codeContent.replace(/\n$/, "")}
                        </CodeBlock>
                      );
                    }

                    return (
                      <code
                        className="px-1.5 py-0.5 rounded text-sm font-mono break-words bg-muted text-muted-foreground"
                        {...props}
                      >
                        {children}
                      </code>
                    );
                  },
                  pre: ({ children }) => {
                    return <>{children}</>;
                  },
                  strong: ({ children }) => (
                    <strong className="font-semibold">{children}</strong>
                  ),
                  em: ({ children }) => <em className="italic">{children}</em>,
                  ul: ({ children }) => (
                    <ul className="pl-2 mb-3 space-y-1 list-disc list-inside last:mb-0">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="pl-2 mb-3 space-y-1 list-decimal list-inside last:mb-0">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="leading-relaxed break-words">{children}</li>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="py-2 pl-4 my-3 italic break-words border-l-4 border-muted-foreground/30">
                      {children}
                    </blockquote>
                  ),
                  a: ({ children, href }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline break-all transition-colors hover:no-underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {children}
                    </a>
                  ),
                  h1: ({ children }) => (
                    <h1 className="mt-4 mb-3 text-xl font-bold break-words first:mt-0">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="mt-3 mb-2 text-lg font-bold break-words first:mt-0">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="mt-3 mb-2 text-base font-bold break-words first:mt-0">
                      {children}
                    </h3>
                  ),
                  hr: () => (
                    <hr className="my-4 border-t border-muted-foreground/30" />
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>

            {/* Sources section - only show if message has sources */}
            {message.sources && message.sources.length > 0 && (
              <MessageSources sources={message.sources} />
            )}

            {/* Reasoning section - only show if model has reasoning */}
            {hasReasoning && (
              <ThinkingDisplay
                thinking={message.thinking!}
                messageId={message._id}
              />
            )}

            {/* Action buttons and model info - only show on hover */}
            <div
              className={cn(
                "flex flex-col gap-3 pt-4 mt-3 transition-all duration-300 sm:flex-row sm:items-center sm:justify-between",
                isHovered
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-2"
              )}
            >
              <div className="flex items-center flex-wrap gap-0.5 sm:gap-0.5">
                <button
                  onClick={() =>
                    void copyToClipboard(message.content, "formatted")
                  }
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs transition-all duration-200 text-muted-foreground hover:text-foreground hover:scale-105 active:scale-95 rounded-full hover:bg-secondary/30"
                >
                  {copiedText === "formatted" ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden font-medium xs:inline">Copy</span>
                </button>

                <button
                  onClick={() => void copyToClipboard(message.content, "raw")}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs transition-all duration-200 text-muted-foreground hover:text-foreground hover:scale-105 active:scale-95 rounded-full hover:bg-secondary/30"
                >
                  {copiedText === "raw" ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <FileText className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden font-medium xs:inline">Raw</span>
                </button>

                {isOwnMessage && (
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs transition-all duration-200 text-muted-foreground hover:text-foreground hover:scale-105 active:scale-95 rounded-full hover:bg-secondary/30"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span className="hidden font-medium xs:inline">Edit</span>
                  </button>
                )}

                <button
                  onClick={() => void handleRegenerate()}
                  disabled={isRegenerating || !message.modelId}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs transition-all duration-200 text-muted-foreground hover:text-foreground hover:scale-105 active:scale-95 disabled:opacity-50 rounded-full hover:bg-secondary/30"
                >
                  <RotateCcw
                    className={cn(
                      "w-3.5 h-3.5",
                      isRegenerating && "animate-spin"
                    )}
                  />
                  <span className="hidden font-medium xs:inline">
                    Regenerate
                  </span>
                </button>

                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs transition-all duration-200 text-muted-foreground hover:text-destructive hover:scale-105 active:scale-95 disabled:opacity-50 rounded-full hover:bg-destructive/10"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden font-medium xs:inline">Delete</span>
                </button>
              </div>

              {modelInfo && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-secondary/30 rounded-full border border-border/30 self-start sm:self-auto">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                  <span className="text-xs font-medium text-foreground/80">
                    {modelInfo.provider.name}
                  </span>
                  <span className="text-xs text-muted-foreground/60">•</span>
                  <span className="text-xs font-medium text-foreground/70">
                    {modelInfo.model.name}
                  </span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
