"use client";

import { useState, useEffect } from "react";
import { Doc } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import ReactMarkdown from "react-markdown";
import { Copy, FileText, RotateCcw, Trash2, Check, Edit2, Brain, ChevronDown, ChevronUp } from "lucide-react";
import { markdownToTxt } from "markdown-to-txt";

import { cn } from "lib/utils";
import { CodeBlock } from "components/code-block";
import { Button } from "components/ui/button";
import { MessageEditor } from "components/chat/message-editor";
import { llms } from "lib/ai/providers";
import { useAIGeneration } from "state/ai";

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
  const { generateResponse } = useAIGeneration();

  const isUser = message.role === "user";
  const isOwnMessage = user && message.userId === user._id;

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
        message.modelId as any,
        conversationHistory.reverse().slice(0, -1) // Exclude the prompt message from history
      );
    } catch (error) {
      console.error("Failed to regenerate message:", error);
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
      <div className="flex w-full px-4 py-2">
        <div className="flex items-center justify-between w-full p-4 duration-300 border bg-destructive/10 border-destructive/20 rounded-xl animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-destructive animate-pulse"></div>
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
        className="flex justify-end w-full px-4 py-2"
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
              <div className="px-4 py-3 transition-all duration-200 border shadow-sm rounded-xl bg-primary text-primary-foreground border-primary/20 hover:shadow-md">
                <div className="text-base leading-relaxed">
                  {message.content}
                </div>
              </div>
              {isOwnMessage && (
                <div
                  className={cn(
                    "flex justify-end gap-1 mt-2 transition-all duration-300",
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
      className="flex w-full px-4 py-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="w-full break-words max-w-none">
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

            {/* Action buttons and model info - only show on hover */}
            <div
              className={cn(
                "flex items-center justify-between pt-4 mt-3 transition-all duration-300",
                isHovered
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-2"
              )}
            >
              <div className="flex items-center gap-0.5">
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
                  <span className="font-medium">Copy</span>
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
                  <span className="font-medium">Raw</span>
                </button>

                {isOwnMessage && (
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs transition-all duration-200 text-muted-foreground hover:text-foreground hover:scale-105 active:scale-95 rounded-full hover:bg-secondary/30"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span className="font-medium">Edit</span>
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
                  <span className="font-medium">Regenerate</span>
                </button>

                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs transition-all duration-200 text-muted-foreground hover:text-destructive hover:scale-105 active:scale-95 disabled:opacity-50 rounded-full hover:bg-destructive/10"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="font-medium">Delete</span>
                </button>
              </div>

              {modelInfo && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-secondary/30 rounded-full border border-border/30">
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
