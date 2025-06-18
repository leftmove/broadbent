"use client";

import { useState } from "react";
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
  X,
  Save,
} from "lucide-react";
import { markdownToTxt } from "markdown-to-txt";

import { cn } from "lib/utils";
import { CodeBlock } from "components/code-block";
import { Button } from "components/ui/button";
import { Textarea } from "components/ui/textarea";
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

  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      await deleteMessage({ messageId: message._id });
    } catch (error) {
      console.error("Failed to delete message:", error);
    } finally {
      setIsDeleting(false);
    }
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

  if (isUser) {
    return (
      <div
        className="flex justify-end w-full px-4 py-2"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex flex-col max-w-[80%] break-words">
          {isEditing ? (
            <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-xl p-4 shadow-lg">
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Edit2 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Editing message
                  </span>
                </div>
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[100px] resize-none border-0 bg-muted/50 focus:bg-background transition-colors"
                  placeholder="Edit your message..."
                  autoFocus
                />
                <div className="flex justify-end gap-2 pt-2 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="h-8 px-3 text-xs"
                  >
                    <X className="w-3 h-3 mr-1.5" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => void handleSaveEdit()}
                    disabled={
                      isSaving ||
                      editContent.trim() === "" ||
                      editContent.trim() === message.content
                    }
                    className="h-8 px-3 text-xs bg-primary hover:bg-primary/90"
                  >
                    {isSaving ? (
                      <div className="flex items-center">
                        <div className="w-3 h-3 mr-1.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Saving...
                      </div>
                    ) : (
                      <>
                        <Save className="w-3 h-3 mr-1.5" />
                        Save changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="px-3 py-2 rounded-lg bg-primary text-primary-foreground">
                <div className="text-base leading-relaxed">
                  {message.content}
                </div>
              </div>
              {isOwnMessage && isHovered && (
                <div
                  className="flex justify-end gap-1 mt-2 duration-200 opacity-0 animate-in fade-in"
                  style={{ opacity: 1 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleEdit}
                    className="px-2 text-xs transition-colors h-7 text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  >
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => void handleDelete()}
                    disabled={isDeleting}
                    className="px-2 text-xs transition-colors h-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 disabled:opacity-50"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
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
          <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-xl p-4 shadow-lg">
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Edit2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">
                  Editing AI response
                </span>
                {modelInfo && (
                  <span className="text-xs text-muted-foreground/70">
                    • {modelInfo.provider.name} {modelInfo.model.name}
                  </span>
                )}
              </div>
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[160px] resize-none border-0 bg-muted/50 focus:bg-background transition-colors font-mono text-sm"
                placeholder="Edit the AI response..."
                autoFocus
              />
              <div className="flex justify-end gap-2 pt-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="h-8 px-3 text-xs"
                >
                  <X className="w-3 h-3 mr-1.5" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => void handleSaveEdit()}
                  disabled={
                    isSaving ||
                    editContent.trim() === "" ||
                    editContent.trim() === message.content
                  }
                  className="h-8 px-3 text-xs bg-primary hover:bg-primary/90"
                >
                  {isSaving ? (
                    <div className="flex items-center">
                      <div className="w-3 h-3 mr-1.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </div>
                  ) : (
                    <>
                      <Save className="w-3 h-3 mr-1.5" />
                      Save changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
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
            {isHovered && (
              <div className="flex items-center justify-between pt-2 mt-3 transition-all duration-300 ease-in-out border-t border-border/20">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      void copyToClipboard(message.content, "formatted")
                    }
                    className="h-8 px-2 text-xs transition-colors text-muted-foreground hover:text-foreground"
                  >
                    {copiedText === "formatted" ? (
                      <Check className="w-3 h-3 mr-1" />
                    ) : (
                      <Copy className="w-3 h-3 mr-1" />
                    )}
                    Copy
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => void copyToClipboard(message.content, "raw")}
                    className="h-8 px-2 text-xs transition-colors text-muted-foreground hover:text-foreground"
                  >
                    {copiedText === "raw" ? (
                      <Check className="w-3 h-3 mr-1" />
                    ) : (
                      <FileText className="w-3 h-3 mr-1" />
                    )}
                    Copy raw
                  </Button>

                  {isOwnMessage && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleEdit}
                      className="h-8 px-2 text-xs transition-colors text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => void handleRegenerate()}
                    disabled={isRegenerating || !message.modelId}
                    className="h-8 px-2 text-xs transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50"
                  >
                    <RotateCcw
                      className={cn(
                        "w-3 h-3 mr-1",
                        isRegenerating && "animate-spin"
                      )}
                    />
                    Regenerate
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => void handleDelete()}
                    disabled={isDeleting}
                    className="h-8 px-2 text-xs transition-colors text-muted-foreground hover:text-destructive disabled:opacity-50"
                  >
                    <Trash2 className="w-3 h-3 mr-1" />
                    Delete
                  </Button>
                </div>

                {modelInfo && (
                  <div className="text-xs text-muted-foreground">
                    {modelInfo.provider.name} • {modelInfo.model.name}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
